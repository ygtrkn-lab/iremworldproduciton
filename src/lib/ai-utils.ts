import OpenAI from 'openai';
// NOTE: This file appears unused; scheduled for deletion. Kept for safety until CI build is validated.

// Helper: cosine similarity
function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function magnitude(a: number[]) {
  return Math.sqrt(dot(a, a));
}

function cosine(a: number[], b: number[]) {
  const mag = magnitude(a) * magnitude(b);
  if (!mag) return 0;
  return dot(a, b) / mag;
}

export async function similarityFallback(client: OpenAI, message: string, contextText: string) {
  try {
    const m = await client.embeddings.create({ model: 'text-embedding-3-small', input: message });
    const c = await client.embeddings.create({ model: 'text-embedding-3-small', input: contextText });

    const mv = (m.data?.[0]?.embedding || []) as number[];
    const cv = (c.data?.[0]?.embedding || []) as number[];
    const sim = cosine(mv, cv);
    return sim;
  } catch (err) {
    console.warn('Embedding similarity failed:', err instanceof Error ? err.message : String(err));
    return 0;
  }
}

export async function classifyRelevance(
  client: OpenAI,
  message: string,
  countryName?: string,
  countryCode?: string,
  contextBlock?: string
) {
  const system = `You are a precise multilingual relevance classifier. You will check whether the user's message is specifically about the provided country (or its region or local topics). The user may write in Turkish, English or other languages. Return ONLY JSON with keys: {relevant: true|false, confidence: 0.0-1.0, reason: 'one-sentence explanation in the user's language'}. Avoid judgment statements and keep output minimal JSON only.`;

  // Few-shot examples
  const examples = [
    { q: "What regions in Turkey are best for investment?", ans: { relevant: true, confidence: 0.98 } },
    { q: "How will global inflation affect households?", ans: { relevant: false, confidence: 0.95 } },
    { q: "Are property taxes different in the US vs Canada?", ans: { relevant: false, confidence: 0.9 } },
    { q: "In Turkey how does the property tax work?", ans: { relevant: true, confidence: 0.97 } }
  ];
  
  // Add Turkish and multilingual few-shot examples to improve classification accuracy
  examples.push(
    { q: "Türkiye'deki vergi sistemi nasıl?", ans: { relevant: true, confidence: 0.98 } },
    { q: "Türkiye'de gayrimenkul yatırımı için hangi bölgeler iyi?", ans: { relevant: true, confidence: 0.98 } },
    { q: "BMW arabaları Türkiye'de nasıl?", ans: { relevant: false, confidence: 0.95 } },
    { q: "Global piyasalar Türkiye'yi nasıl etkiler?", ans: { relevant: true, confidence: 0.78 } }
  );

  const userMsg = `Country: ${countryName || countryCode || 'unspecified'}\nMessage: ${message}\nContext: ${contextBlock || 'none'}`;

  try {
    const messages = [
      { role: 'system', content: system },
      ...examples.flatMap(ex => [{ role: 'user', content: ex.q }, { role: 'assistant', content: JSON.stringify(ex.ans) }]),
      { role: 'user', content: userMsg }
    ];

    /* Note: `ChatCompletionMessageParam` type expects certain fields; map to any to align with SDK shape. */
    // Map to any to satisfy SDK typings (we only send role and content)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatMessages: any = messages.map((m) => ({ role: m.role as any, content: m.content }));

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.0,
      max_tokens: 120
    });

    const raw = String(resp.choices?.[0]?.message?.content || '').trim();

    // Try to parse JSON
    try {
      const parsed = JSON.parse(raw);
      const relevant = !!parsed.relevant;
      const confidence = parsed.confidence != null ? Number(parsed.confidence) : (relevant ? 0.7 : 0.3);
      const reason = parsed.reason || '';
      return { relevant, confidence: Math.max(0, Math.min(1, confidence)), reason };
    } catch {
      // fallback: try to interpret the raw text
      const lower = raw.toLowerCase();
      const relevant = lower.includes('true') || lower.includes('relevant') || lower.includes('evet');
      const confidence = relevant ? 0.7 : 0.3;
      return { relevant, confidence, reason: raw };
    }
  } catch (err) {
    console.warn('Relevance classifier failed:', err instanceof Error ? err.message : String(err));
    return { relevant: false, confidence: 0, reason: 'classification_error' };
  }
}
