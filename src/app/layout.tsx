import type { Metadata } from "next";
// Silence typescript about process in SSR layout
declare const process: any;
import { Inter, Poppins, Dancing_Script } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import LayoutContent from "@/components/layout/LayoutContent";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const scriptFont = Dancing_Script({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.iremworld.com"),
  title: {
    default: "IREMWORLD | Türkiye'nin En Prestijli Emlak Platformu",
    template: "%s | IREMWORLD Real Estate"
  },
  description: "IREMWORLD REAL ESTATE MARKETING - Türkiye'nin en prestijli emlak pazarlama platformu. Kiralık, satılık arsa, ev, ofis, daire, villa, iş yeri gibi gayrimenkul seçenekleriyle hayalinizdeki mülkü bulun. İstanbul, Ankara, İzmir ve tüm Türkiye'de emlak hizmetleri.",
  keywords: "emlak, gayrimenkul, kiralık daire, satılık ev, arsa, ofis, villa, iş yeri, IREMWORLD, İstanbul emlak, Ankara emlak, İzmir emlak, lüks emlak, prestijli konut, kiralık ofis, satılık arsa, INTERNATIONAL REAL ESTATE MARKETING",
  authors: [{ name: 'IREMWORLD Real Estate' }],
  creator: 'IREMWORLD',
  publisher: 'IREMWORLD Real Estate',
  
  openGraph: {
    title: "IREMWORLD | Türkiye'nin En Prestijli Emlak Platformu",
    description: "IREMWORLD REAL ESTATE MARKETING - Türkiye'nin en prestijli emlak pazarlama platformu. Kiralık, satılık arsa, ev, ofis, daire, villa, iş yeri gibi gayrimenkul seçenekleriyle hayalinizdeki mülkü bulun.",
    url: "https://www.iremworld.com",
    siteName: "IREMWORLD REAL ESTATE MARKETING",
    images: [
      {
        url: "https://www.iremworld.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "IREMWORLD REAL ESTATE MARKETING",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "IREMWORLD | Türkiye'nin En Prestijli Emlak Platformu",
    description: "IREMWORLD REAL ESTATE MARKETING - Türkiye'nin en prestijli emlak pazarlama platformu. Kiralık, satılık arsa, ev, ofis, daire, villa, iş yeri gibi gayrimenkul seçenekleriyle hayalinizdeki mülkü bulun.",
    images: ["https://www.iremworld.com/twitter-image.jpg"],
    site: "@iremworld",
    creator: "@iremworld",
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  
  manifest: "/manifest.json",
  
  alternates: {
    canonical: "https://www.iremworld.com",
    languages: {
      'tr-TR': 'https://www.iremworld.com',
      'en-US': 'https://www.iremworld.com/en',
    },
  },
  
  verification: {
    google: 'google-site-verification-code-here',
    yandex: 'yandex-verification-code-here',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Resource Hints - Performance Optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.iremworld.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.google.com.tr" />
        
        {/* Content Policy */}
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta httpEquiv="Content-Language" content="tr" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="1 Days" />
        
        {/* Translation Control */}
        <meta name="google" content="notranslate" />
        <meta name="google-translate-customization" content="true" />
        
        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Dancing+Script:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Favicon */}
        <link rel="icon" href="/icon.png" sizes="any" />
        <link rel="shortcut icon" href="/icon.png" type="image/x-icon" />
        
        {/* 360 Viewer */}
        <script src="https://cdn.jsdelivr.net/npm/marzipano@0.10.2/dist/marzipano.min.js" async></script>
        {/* Dev-only: detect and log any script tags that accidentally load CSS (helps debug MIME type errors). Only runs in non-production. */}
        {process.env.NODE_ENV !== 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{document.querySelectorAll('script').forEach(s =>{ if(s.src && s.src.split('?')[0].endsWith('.css')) { console.warn('Possible incorrect script loading CSS:', s.src, s); } }); } catch(e) { /* ignore */ }})();`,
            }}
          />
        )}
        {/* Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "IREMWORLD REAL ESTATE MARKETING",
              "alternateName": "IREMWORLD",
              "url": "https://iremworld.com",
              "logo": "https://iremworld.com/icon.png",
              "description": "IREMWORLD REAL ESTATE MARKETING - INTERNATIONAL REAL ESTATE MARKETING. Türkiye'nin en prestijli emlak pazarlama platformu.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Turkey",
                "addressCountry": "TR"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "telephone": "+90-xxx-xxx-xxxx",
                "email": "info@iremworld.com"
              },
              "sameAs": [
                "https://www.facebook.com/iremworld",
                "https://www.instagram.com/iremworld",
                "https://www.linkedin.com/company/iremworld"
              ],
              "serviceArea": {
                "@type": "Country",
                "name": "Turkey"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Emlak Hizmetleri",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Kiralık Emlak",
                      "description": "Kiralık daire, villa, ofis, iş yeri hizmetleri"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Satılık Emlak",
                      "description": "Satılık ev, daire, villa, arsa, ofis hizmetleri"
                    }
                  }
                ]
              }
            }),
          }}
        />
      </head>
  <body className={`${inter.className} ${poppins.variable} ${scriptFont.variable} min-h-screen flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
