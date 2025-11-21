import { NextRequest, NextResponse } from 'next/server';
// Silence typescript warnings about process in server code in this project
declare const process: any;
import { logActivity as fileLogActivity } from '@/lib/server-utils';
import OpenAI from 'openai';
import { classifyRelevance, similarityFallback } from '@/lib/ai-utils';

// Vercel serverless function timeout configuration
export const maxDuration = 30; // 30 seconds max (Vercel Pro: 60s, Hobby: 10s default)
export const dynamic = 'force-dynamic';

const MAX_HISTORY_MESSAGES = 4; // shorter history speeds up prompts and reduces token use

// Simple in-memory cache to return repeated questions quickly (local dev only).
// Use a persistent cache (Redis) in production if needed.
const ANSWER_CACHE = new Map<
  string,
  { answer: string; expiresAt: number; usage?: unknown }
>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes
let cachedClient: OpenAI | null = null;

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return cachedClient;
};

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type CountryContext = {
  capital?: string;
  population?: string;
  region?: string;
  subRegion?: string;
  currency?: string;
  language?: string;
  area?: string;
  density?: string;
  dominantReligion?: string;
  avgPrimePrice?: string;
  marketMomentum?: string;
  riskSignal?: string;
  highlight?: string;
};

const sanitizeConversation = (conversation: unknown): ConversationMessage[] => {
  if (!Array.isArray(conversation)) {
    return [];
  }

  return conversation
    .map<ConversationMessage | null>((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const roleValue = (item as { role?: unknown }).role;
      const role: ConversationMessage['role'] = roleValue === 'assistant' ? 'assistant' : 'user';
      const contentValue = (item as { content?: unknown }).content;
      const content = typeof contentValue === 'string' ? contentValue.trim() : '';

      if (!content) {
        return null;
      }

      return { role, content } as ConversationMessage;
    })
    .filter((item): item is ConversationMessage => Boolean(item))
    .slice(-MAX_HISTORY_MESSAGES);
};

// Normalizes text to remove punctuation and unicode diacritics for stable comparisons
const normalizeText = (s?: string | null) => {
  if (!s) return '';
  try {
    // Remove diacritics (normalize -> NFD -> remove combining marks) and convert to lower-case
    const stripped = s.normalize ? s.normalize('NFD').replace(/\p{Diacritic}/gu, '') : s;
    // Remove punctuation and extra spaces
    return stripped.replace(/[\p{P}\p{S}]/gu, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  } catch {
    return String(s).toLowerCase();
  }
};

const isCountryMentionedInText = (text: string | undefined | null, countryName?: string, countryCode?: string) => {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  if (countryName && normalizeText(countryName) && normalized.includes(normalizeText(countryName))) return true;
  if (countryCode && normalized.includes(String(countryCode).toLowerCase())) return true;

  // Common reference phrases
  const countryReferencePhrases = [
    'bu ulke', 'secilen ulke', 'seçilen ülke', 'seçtiğim ülke', 'seçtiğiniz ülke', 'seçtiğimiz ülke', 'buradaki ülke', 'this country', 'selected country', 'the selected country'
  ];
  for (const phrase of countryReferencePhrases) {
    if (normalized.includes(phrase.replace(/ç|ğ|ş|ı|ö|ü/g, ''))) return true;
    if (normalized.includes(phrase)) return true;
  }
  return false;
};

// Topics allowed by the AI Assistant for country context — expanded to include lifestyle, culture, food, transportation, professions etc.
// This allows users to learn about the country comprehensively beyond just property investment.
const allowedCountryTopics = [
  // Core categories
  'vergi', 'vergi sistemi', 'vergi orani', 'vergi oranı', 'tax', 'taxation',
  'nufus', 'nüfus', 'population', 'populasyon',
  'din', 'religion', 'inanc', 'inanç', 'kultur', 'kültür', 'culture', 'cultural',
  'yatirim', 'yatırım', 'investment', 'yatirim bolgeleri', 'yatırım bölgeleri', 'yatirim firsati', 'yatırım fırsatı',
  'yasam', 'yaşam', 'yasam kalitesi', 'yaşam kalitesi', 'life quality', 'cost of living', 'quality of life',
  'kira', 'kiralar', 'kira fiyati', 'kira fiyatı', 'kira fiyatlari', 'kira fiyatları', 'rent', 'rental',
  'fiyat', 'prime', 'fiyat araligi', 'fiyat aralığı', 'price',
  'ekonomi', 'economic', 'ekonomik', 'inflation', 'enflasyon',
  'bolge', 'bölge', 'region', 'location', 'location-based',
  'ipotek', 'mortgage', 'konut kredisi', 'mortgage rate', 'kredi', 'credit', 'loan',
  // Expanded: lifestyle & culture
  'yemek', 'yiyecek', 'mutfak', 'food', 'cuisine', 'dish', 'meal',
  'ulasim', 'ulaşım', 'transportation', 'transport', 'arac', 'araç', 'vehicle', 'car', 'bus', 'metro',
  'meslek', 'is', 'iş', 'profession', 'job', 'career', 'work',
  'egitim', 'eğitim', 'okul', 'education', 'school', 'university',
  'saglik', 'sağlık', 'health', 'healthcare', 'hospital',
  'hava', 'iklim', 'weather', 'climate',
  'gelenek', 'adet', 'tradition', 'custom',
  'tatil', 'festival', 'holiday', 'celebration',
  'spor', 'sport', 'sports',
  'eglence', 'eğlence', 'entertainment',
  'dil', 'language',
  'giyim', 'dress', 'clothing',
  'tercih', 'preferred', 'popular', 'favorite'
];

const isAboutAllowedCountryTopic = (text: string | undefined | null) => {
  if (!text) return false;
  const norm = normalizeText(text);
  for (const phrase of allowedCountryTopics) {
    if (norm.includes(phrase)) return true;
  }
  return false;
};

const buildContextBlock = (countryName?: string, countryCode?: string, context?: CountryContext) => {
  const rows: string[] = [];

  if (countryName) {
    rows.push(`Ülke: ${countryName}${countryCode ? ` (${countryCode})` : ''}`);
  }

  if (context?.capital) rows.push(`Başkent: ${context.capital}`);
  if (context?.population) rows.push(`Nüfus: ${context.population}`);
  if (context?.region) rows.push(`Bölge: ${context.region}${context?.subRegion ? ` / ${context.subRegion}` : ''}`);
  if (context?.currency) rows.push(`Para birimi: ${context.currency}`);
  if (context?.language) rows.push(`Resmi diller: ${context.language}`);
  if (context?.area) rows.push(`Yüzölçümü: ${context.area}`);
  if (context?.density) rows.push(`Nüfus yoğunluğu: ${context.density}`);
  if (context?.dominantReligion) rows.push(`Hakim inanç: ${context.dominantReligion}`);
  if (context?.avgPrimePrice) rows.push(`Prime fiyat aralığı: ${context.avgPrimePrice}`);
  if (context?.marketMomentum) rows.push(`Piyasa momentumu: ${context.marketMomentum}`);
  if (context?.riskSignal) rows.push(`Risk seviyesi: ${context.riskSignal}`);
  if (context?.highlight) rows.push(`Öne çıkan not: ${context.highlight}`);

  return rows.length > 0 ? rows.join('\n') : undefined;
};

// Helper: cosine similarity
// dot/magnitude helpers moved to `src/lib/ai-utils.ts` if needed

// cosine moved to `src/lib/ai-utils.ts`

// Relevance classifier and similarity fallback moved to `src/lib/ai-utils.ts`

type ChatCompletionContentPart = {
  text?: string | string[];
  type?: string;
};

const extractText = (content: string | Array<ChatCompletionContentPart | string>) => {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (typeof part?.text === 'string') {
          return part.text;
        }

        if (Array.isArray(part?.text)) {
          return part.text.join(' ');
        }

        return '';
      })
      .join(' ')
      .trim();
  }

  return '';
};

const systemPrompt = `Sen IREMWORLD'ün yapay zeka asistanısın. Seçilen ülke hakkında kısa, net ve hızlı yanıtlar ver.\n` +
  `KURALLAR:\n` +
  `1. SADECE seçilen ülke hakkında cevap ver (gayrimenkul, yatırım, yaşam, kültür, yemek, ulaşım, meslek, eğitim vb. her konu dahil).\n` +
  `2. Yanıtlarını 2-3 cümle veya kısa paragraflarla sınırla. ÖZ ve DOĞRUDAN yanıt ver.\n` +
  `3. Gereksiz giriş/kapanış cümleleri kullanma. Soruya direkt cevap ver.\n` +
  `4. Emin olmadığın bilgiler için "genel olarak" veya "tipik olarak" ifadelerini kullan.\n` +
  `5. Kullanıcının dilinde yanıt ver.\n` +
  `İLAN ARAMA: Eğer sistem sana "İLAN ARAMA SONUÇLARI" context'i verdiyse:\n` +
  `- Önce "Toplam X ilan bulundu" yaz\n` +
  `- Her ilan için numara, başlık, fiyat, konum bilgilerini listele\n` +
  `- Link'i tam URL olarak ver: <a href=\"URL\" target=\"_blank\">İlan Detayları</a>\n` +
  `- Kısa ve öz tut, gereksiz açıklama yapma\n` +
  `AMAÇ: Hızlı ve faydalı bilgi sağla.`;


export async function POST(request: NextRequest) {
  const client = getClient();

  if (!client) {
    // Explicit and specific error to help debug.
    console.error('AI insight error: OpenAI API key not configured.');
    return NextResponse.json(
      { error: 'OpenAI API anahtarı yapılandırılmadı.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!message) {
      return NextResponse.json(
        { error: 'Lütfen bir soru iletin.' },
        { status: 400 }
      );
    }

    const countryName = typeof body?.countryName === 'string' ? body.countryName : undefined;
    const countryCode = typeof body?.countryCode === 'string' ? body.countryCode : undefined;
    const countryContext: CountryContext | undefined =
      body?.countryContext && typeof body.countryContext === 'object'
        ? body.countryContext
        : undefined;

    const conversation = sanitizeConversation(body?.conversation ?? []);
    const latestIsUser = conversation.at(-1)?.role === 'user';
    const transcript = latestIsUser
      ? [...conversation]
      : [...conversation, { role: 'user', content: message } as ConversationMessage];

    const contextBlock = buildContextBlock(countryName, countryCode, countryContext);

    // Bypass classifier if the message or recent conversation contains a direct country mention

    // Guard: only respond to questions about the selected country
    const isCountryMentioned = (msg: string) => {
      if (!msg) return false;
      const m = msg.toLowerCase();
      if (countryName && m.includes(countryName.toLowerCase())) return true;
      if (countryCode && m.includes(String(countryCode).toLowerCase())) return true;

      const countryReferencePhrases = [
      'bu ülke',
      'seçilen ülke',
      'seçtiğim ülke',
      'seçtiğiniz ülke',
      'seçtiğimiz ülke',
      'buradaki ülke',
      'this country',
      'selected country',
      'the selected country',
      'this country',
      ];

      for (const phrase of countryReferencePhrases) {
      if (m.includes(phrase)) return true;
      }

      return false;
    };

    // previously we used `isCountryMentioned`; use normalize-aware version
    const mentionedInTranscript = transcript.some((entry) => isCountryMentionedInText(entry.content, countryName, countryCode));

    // Run LLM based classifier to determine semantic relevance (but bypass if country mentioned or if message clearly belongs to allowed country-level topics).
    let classifier;
    // If the message touches an allowed topic AND either explicitly mentions the country
    // or the user has selected the country, treat it as relevant. This prevents unrelated
    // country mentions (e.g., 'BMW arabaları Türkiye') from being allowed.
    const isTopic = isAboutAllowedCountryTopic(message) || transcript.some(e => isAboutAllowedCountryTopic(e.content));
    if (isTopic && (mentionedInTranscript || countryName)) {
      // Log bypass reason for monitoring
      try {
        fileLogActivity(
          request.headers.get('x-user-id') || 'anonymous',
          request.headers.get('x-user-name') || 'Anonymous',
          request.headers.get('x-user-email') || '',
          'ai_insight_allowed',
          `Message allowed via bypass (country mention or allowed topic): ${message.slice(0,240)}`,
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
          request.headers.get('user-agent') || 'Unknown',
          'system',
          undefined,
          'success',
          { reason: mentionedInTranscript ? 'country_mentioned' : 'topic_match' }
        );
      } catch {
        // ignore logging errors
      }

      classifier = { relevant: true, confidence: 1, reason: 'topic_match_and_country' } as any;
    } else {
      try {
        classifier = await classifyRelevance(client, message, countryName, countryCode, contextBlock);
      } catch (err) {
        console.warn('Classifier failed:', err instanceof Error ? err.message : String(err));
        // Fallback to simple conservative classifier
        classifier = { relevant: false, confidence: 0, reason: 'classification_error' };
      }
    }

    // If model says it's not relevant with high confidence, consider topic override then block if still irrelevant
    // Raised threshold to 0.75 to be more permissive for lifestyle/culture questions
    if (!classifier.relevant && classifier.confidence > 0.75 && !mentionedInTranscript) {
      // Allow if message still matches an allowed country-level topic (e.g. user selected country but didn't mention it explicitly)
      if (isAboutAllowedCountryTopic(message)) {
        classifier = { relevant: true, confidence: classifier.confidence, reason: 'topic_override' } as any;
      } else {
        const assistantReply = `Bu soru seçilen ülke ile ilgili görünmüyor. Lütfen ${countryName || 'seçilen ülke'} hakkında aşağıdaki konulardan biriyle ilgili soru sorunuz: Vergi Sistemi, Nüfus, Din / Kültür, İpotek / Mortgage, Kira Fiyatları, Yatırım Bölgeleri, Yaşam Kalitesi.`;

      // Log blocked logic
      try {
        fileLogActivity(
          request.headers.get('x-user-id') || 'anonymous',
          request.headers.get('x-user-name') || 'Anonymous',
          request.headers.get('x-user-email') || '',
          'ai_insight_blocked',
          `Classifier blocked: ${message.slice(0, 240)} (reason: ${classifier.reason})`,
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
          request.headers.get('user-agent') || 'Unknown',
          'system',
          undefined,
          'warning',
          { classifier, conversation: transcript.slice(-3) }
        );
      } catch {
        // ignore
      }

        return NextResponse.json({ answer: assistantReply, skipped: true });
      }
    }

    // If classifier is uncertain, use token-based fallback: if already has country mention, allow.
    if (classifier.confidence <= 0.6 && !mentionedInTranscript) {
      // Try embeddings similarity: see if question matches country context
      const contextText = contextBlock || `${countryName || countryCode || ''}`;
      let sim = 0;
      try {
        sim = contextText ? await similarityFallback(client, message, contextText) : 0;
      } catch (err) {
        console.warn('Similarity fallback failed:', err instanceof Error ? err.message : String(err));
        sim = 0;
      }

      // confidence rule: if sim high (>=0.28) allow; if low and classifier unsure, block and log
      if (sim < 0.28) {
        // Allow topic override even if similarity is low
        if (isAboutAllowedCountryTopic(message)) {
          classifier = { relevant: true, confidence: classifier.confidence, reason: 'similarity_topic_override' } as any;
        } else {
          const assistantReply = `Bu soru ${countryName || 'seçilen ülke'} ile ilgili görünmüyor. Lütfen daha spesifik ülke odaklı soru sorunuz veya ülkeyi açıkça belirtiniz.`;

          try {
            fileLogActivity(
              request.headers.get('x-user-id') || 'anonymous',
              request.headers.get('x-user-name') || 'Anonymous',
              request.headers.get('x-user-email') || '',
              'ai_insight_blocked',
              `Ambiguous blocked: ${message.slice(0, 240)} (sim=${sim}, classifier=${classifier.confidence})`,
              request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
              request.headers.get('user-agent') || 'Unknown',
              'system',
              undefined,
              'warning',
              { classifier, sim }
            );
          } catch {
            // ignore
          }

          return NextResponse.json({ answer: assistantReply, skipped: true });
        }
      }
    }

    // If we get here, proceed with regular behavior (allowed by classifier or similarity fallback)
    if (classifier.relevant) {
      // also optionally write a log of successful classification for monitoring
      try {
        fileLogActivity(
          request.headers.get('x-user-id') || 'anonymous',
          request.headers.get('x-user-name') || 'Anonymous',
          request.headers.get('x-user-email') || '',
          'ai_insight_allowed',
          `Classifier allowed (debug): ${message.slice(0, 240)} (conf=${classifier.confidence})`,
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
          request.headers.get('user-agent') || 'Unknown',
          'system',
          undefined,
          'success',
          { classifier }
        );
      } catch {
    }
    }

    // Quick cache lookup before calling OpenAI
    try {
      const cacheKey = `${countryCode || countryName || 'ANY'}::${message}`.toLowerCase();
      const cached = ANSWER_CACHE.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json({ answer: cached.answer, cached: true });
      }
    } catch {
      // ignore cache errors
    }

    // PROPERTY SEARCH DETECTION: Check if user is asking about properties/listings
    const isPropertySearchQuery = (msg: string) => {
      const normalized = msg.toLowerCase();
      const searchKeywords = [
        'ara', 'arıyor', 'bul', 'ilan', 'emlak', 'property', 'listing',
        'satılık', 'kiralık', 'sale', 'rent', 'daire', 'ev', 'ofis', 'villa',
        'apartment', 'house', 'office', 'konut', 'gayrimenkul'
      ];
      return searchKeywords.some(kw => normalized.includes(kw));
    };

    // Extract search parameters from natural language query
    const extractSearchParams = (msg: string, country?: string) => {
      const normalized = msg.toLowerCase();
      const params: any = {};

      // Type detection
      if (/(sat(ı|i)l(ı|i)k|sale|buying)/.test(normalized)) params.type = 'sale';
      if (/(kiral(ı|i)k|rent|rental)/.test(normalized)) params.type = 'rent';

      // Category detection
      if (/(daire|apartment|flat)/.test(normalized)) params.category = 'residential';
      if (/(ofis|office)/.test(normalized)) params.category = 'commercial';
      if (/(villa)/.test(normalized)) params.category = 'residential';
      if (/(arsa|land)/.test(normalized)) params.category = 'land';

      // City extraction (simple - can be enhanced with NER)
      const cityMatch = msg.match(/(?:istanbul|ankara|izmir|antalya|bursa|adana)/i);
      if (cityMatch) params.city = cityMatch[0];

      return params;
    };

    let propertySearchResults = null;
    if (isPropertySearchQuery(message)) {
      try {
        const searchParams = extractSearchParams(message, countryName);
        
        // Call internal property search API
        const searchResponse = await fetch(`${request.url.split('/api/')[0]}/api/ai/search-properties`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...searchParams, limit: 5 }),
        });

        if (searchResponse.ok) {
          propertySearchResults = await searchResponse.json();
        }
      } catch (err) {
        console.warn('Property search failed:', err instanceof Error ? err.message : String(err));
        // Continue with regular AI response even if search fails
      }
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    if (contextBlock) {
      messages.push({ role: 'system', content: `Ülke bağlamı:\n${contextBlock}` });
    }

    // Inject property search results if available
    if (propertySearchResults && propertySearchResults.success && propertySearchResults.count > 0) {
      const searchContext = `İLAN ARAMA SONUÇLARI:\nToplam ${propertySearchResults.total} ilan bulundu. İlk ${propertySearchResults.count} sonuç:\n\n` +
        propertySearchResults.properties.map((p: any, i: number) => 
          `${i + 1}. ${p.title}\n` +
          `   - Tür: ${p.type === 'sale' ? 'Satılık' : 'Kiralık'} | Kategori: ${p.category}\n` +
          `   - Konum: ${p.city}${p.district ? `, ${p.district}` : ''}${p.neighborhood ? `, ${p.neighborhood}` : ''}\n` +
          `   - Fiyat: ${p.price.toLocaleString('tr-TR')} TL | Alan: ${p.netSize}m²\n` +
          `   - Oda: ${p.rooms} | Yaş: ${p.age} yıl\n` +
          `   - Link: https://iremworld.com/property/${p.id}`
        ).join('\n\n') +
        `\n\nBu ilanları kullanıcıya özetle ve HTML link formatında paylaş: <a href=\"https://iremworld.com/property/ID\" target=\"_blank\">İlan Detayları</a>. Gerçek ilan ID'lerini kullan.`;
      
      messages.push({ role: 'system', content: searchContext });
    }

    messages.push(
      ...transcript.map((entry) => ({
        role: entry.role,
        content: entry.content,
      }))
    );

    const MAX_REPLY_TOKENS = 350; // Reduced for faster responses - concise answers preferred

    let completion;
    try {
      completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3, // Lower temperature for faster, more focused responses
      max_tokens: MAX_REPLY_TOKENS,
    }, {
      timeout: 20000, // 20 second timeout for faster failure detection
    });
    } catch (err) {
      console.error('OpenAI completion error:', err instanceof Error ? err.message : String(err));
      return NextResponse.json({ error: 'AI servisi şu anda yanıt veremiyor.' }, { status: 502 });
    }

    const rawContent = completion.choices[0]?.message?.content;
    let assistantReply = extractText(rawContent);

    // Skip continuation for performance - keep responses concise for faster delivery
    // If answer is cut off, user can ask follow-up questions

    // Remove forced brand prefix; keep answer concise and avoid repeating assistant identity.
    const sanitizeReply = (text: string) => {
      if (!text) return '';
      return text.replace(/^Ben IREMWORLD’ün yapay zeka asistanıyım\.?\s*/i, '').trim();
    };

    const finalReply = sanitizeReply(assistantReply);

    if (!finalReply) {
      return NextResponse.json(
        { error: 'Yanıt oluşturulamadı.' },
        { status: 502 }
      );
    }

    // Store in cache (best-effort)
    try {
      const cacheKey = `${countryCode || countryName || 'ANY'}::${message}`.toLowerCase();
      ANSWER_CACHE.set(cacheKey, { answer: finalReply, expiresAt: Date.now() + CACHE_TTL, usage: completion.usage });
    } catch {
      // ignore cache writes
    }

    return NextResponse.json({
      answer: finalReply,
      usage: completion.usage,
    });
  } catch (error) {
    console.error('AI insight error:', error);

    return NextResponse.json(
      { error: 'AI servisi şu anda yanıt veremiyor.' },
      { status: 500 }
    );
  }
}
