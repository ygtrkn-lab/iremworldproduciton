# IREM World Production - Deployment Guide

## 🚀 Vercel Deployment Bilgileri

### Production URL
**https://iremworldproduciton.vercel.app/**

### GitHub Repository
**https://github.com/ygtrkn-lab/iremworldproduciton**

---

## 📋 Vercel CLI ile Güncelleme

### 1. Kod Değişikliklerini GitHub'a Push
```powershell
git add -A
git commit -m "Açıklama mesajı"
git push origin master
```

### 2. Vercel'e Deploy (Production)
```powershell
vercel --prod
```

**NOT:** Vercel CLI kurulu değilse:
```powershell
npm install -g vercel
vercel login
```

---

## 🔄 Otomatik Deploy

Proje GitHub'a bağlı, her `git push origin master` yaptığınızda **otomatik deploy olur**.

Manuel deploy gerekirse yukarıdaki `vercel --prod` komutunu kullanın.

---

## ⚙️ Environment Variables

Production'da gerekli env variables:
- `DATABASE_HOST`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
 - `OPENAI_API_KEY` (required to enable AI Insights at /api/ai/insight)
 - `ENABLE_GOOGLE_TRANSLATE` (optional server-side; set to `true` to allow translation widget and update CSP)
 - `NEXT_PUBLIC_ENABLE_GOOGLE_TRANSLATE` (optional client-side; set to `true` to enable widget on client)

**Vercel Dashboard'dan ekleyin:** https://vercel.com/dashboard

---

## 📁 Proje Yapısı

- **Framework:** Next.js 15.3.3
- **Build Command:** `next build`
- **Output:** `.next/`
- **Node Version:** 20.x

---

## 🔧 Son Optimizasyonlar (Nov 20, 2025)

### Portal Performans İyileştirmeleri:
- ✅ Footer flash sorunu düzeltildi
- ✅ Mobilde yıldız partikülleri azaltıldı (4-6 adet)
- ✅ Mobil/tablet'te 3D kart animasyonları kapatıldı
- ✅ GPU acceleration eklendi (force3D, willChange)
- ✅ Hover events throttle edildi (requestAnimationFrame)
- ✅ Arkaplan geçişleri 12 saniyeye çıkarıldı
- ✅ Mobilde görsel kalitesi %75'e düşürüldü
- ✅ Framer Motion → CSS animasyonları

### AI Chat Düzeltmeleri:
- ✅ Session'lar kullanıcıya özel (browser fingerprinting)
- ✅ Dev ortamı geçmişi production'da gözükmüyor

### Medya Dosyaları:
- ✅ Tüm ilan ve proje resimleri eklendi
- ✅ Video ve portal background dosyaları eklendi

---

## 📝 Deployment Checklist

Yeni deployment öncesi:
1. [ ] `npm run build` - Local'de build test et
2. [ ] Hataları kontrol et
3. [ ] Git'e push et: `git push origin master`
4. [ ] Vercel deploy: `vercel --prod`
5. [ ] Production URL'i test et
6. [ ] Environment variables kontrol et

---

## 🆘 Sorun Giderme

### Build hatası alırsanız:
```powershell
# Local build test
npm run build

# Hataları görmek için
vercel logs <deployment-url>
```

### Vercel Dashboard:
https://vercel.com/yigit-can-elmass-projects/irem

---

**Son Güncelleme:** 20 Kasım 2025  
**Deployment Durumu:** ✅ Aktif ve Çalışıyor
