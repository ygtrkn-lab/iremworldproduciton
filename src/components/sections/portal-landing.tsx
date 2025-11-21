'use client';

import { useState, useEffect, useRef, useMemo, useLayoutEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ReactCountryFlag from 'react-country-flag';
// @ts-ignore - world-countries type definitions may not be available
import countries from 'world-countries';
import AboutUsPopup from './about-us-popup';
import consultantsData from '@/data/consultants.json';
import LanguageSelector from '@/components/ui/language-selector';
import { consultantTypes } from '@/data/consultant-types';
import { AiSession } from '@/types/ai';

const PORTAL_BACKGROUND_IMAGE_FILES = [
  "/videos/portal-bg/iremworld-background (1).jpg",
  "/videos/portal-bg/iremworld-background (2).jpg",
  "/videos/portal-bg/iremworld-background (3).jpg",
  "/videos/portal-bg/iremworld-background (4).jpg",
  "/videos/portal-bg/iremworld-background (5).jpg",
  "/videos/portal-bg/iremworld-background (6).jpg",
  "/videos/portal-bg/iremworld-background (7).jpg",
  "/videos/portal-bg/iremworld-background (8).jpg",
  "/videos/portal-bg/iremworld-background (9).jpg",
  "/videos/portal-bg/iremworld-background (10).jpg",
  "/videos/portal-bg/iremworld-background (11).jpg",
  "/videos/portal-bg/iremworld-background (12).jpg",
  "/videos/portal-bg/iremworld-background (13).jpg",
  "/videos/portal-bg/iremworld-background (14).jpg",
  "/videos/portal-bg/iremworld-background (15).jpg",
  "/videos/portal-bg/iremworld-background (16).jpg",
  "/videos/portal-bg/iremworld-background (17).jpg",
  "/videos/portal-bg/iremworld-background (18).jpg",
  "/videos/portal-bg/iremworld-background (19).jpg",
  "/videos/portal-bg/iremworld-background (20).jpg",
] as const;

const PORTAL_BACKGROUND_IMAGES = PORTAL_BACKGROUND_IMAGE_FILES.map((src) => encodeURI(src));

const getRandomBackgroundIndex = (excludeIndex?: number) => {
  const total = PORTAL_BACKGROUND_IMAGES.length;
  if (total <= 1) {
    return 0;
  }

  let candidate = Math.floor(Math.random() * total);
  if (typeof excludeIndex === 'number' && !Number.isNaN(excludeIndex)) {
    const normalizedExclude = ((excludeIndex % total) + total) % total;
    while (candidate === normalizedExclude) {
      candidate = Math.floor(Math.random() * total);
    }
  }
  return candidate;
};

// Ülkeleri formatla
const formattedCountries = countries.map((country: any) => {
  const nativeNameObj: any = country.name.native ? Object.values(country.name.native)[0] : null;
  
  return {
    code: country.cca2,
    name: country.name.common,
    nativeName: nativeNameObj?.common || country.name.common,
  };
}).sort((a: any, b: any) => a.name.localeCompare(b.name));

// Ülke seçici komponenti
const CountrySelector = ({
  selectedCountry,
  onSelect,
}: {
  selectedCountry: typeof formattedCountries[0] | null;
  onSelect: (country: typeof formattedCountries[0]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountries = formattedCountries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (country.nativeName && country.nativeName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-left flex items-center justify-between hover:border-[#f07f38] hover:bg-[#fff7f2] transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          {selectedCountry ? (
            <>
              <ReactCountryFlag
                countryCode={selectedCountry.code}
                svg
                style={{
                  width: '1.75em',
                  height: '1.75em',
                  borderRadius: '0.375rem',
                }}
                title={selectedCountry.code}
              />
              <span className="text-gray-900 font-medium">{selectedCountry.name}</span>
              <span className="text-gray-500 text-sm">({selectedCountry.code})</span>
            </>
          ) : (
            <span className="text-gray-500">Ülke Seçin</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-100 sticky top-0 bg-white z-[9999]">
            <input
              type="text"
              placeholder="Ülke ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#f07f38] focus:ring-2 focus:ring-[#f07f38]/20 text-sm"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto max-h-80">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onSelect(country);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#fff0e5] transition-colors text-left border-b border-gray-50 last:border-b-0"
                >
                  <ReactCountryFlag
                    countryCode={country.code}
                    svg
                    style={{
                      width: '1.75em',
                      height: '1.75em',
                      borderRadius: '0.375rem',
                    }}
                    title={country.code}
                  />
                  <div className="flex-1">
                    <div className="text-gray-900 font-medium text-sm">{country.name}</div>
                    {country.nativeName !== country.name && (
                      <div className="text-xs text-gray-500">{country.nativeName}</div>
                    )}
                  </div>
                  <span className="text-gray-400 text-xs font-medium">{country.code}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-12 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm">Ülke bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

type ShopMode = 'property' | 'project';

const shopModeMeta: Record<ShopMode, {
  label: string;
  description: string;
  subtitle: string;
  ctaLabel: string;
}> = {
  property: {
    label: 'Investment',
    description: 'Satılık ve kiralık seçkin portföyümüzle yaşam ve yatırım hedeflerinize ulaşın.',
    subtitle: 'Premıum Gayrimenkuller',
    ctaLabel: 'Gayrimenkulleri Ara',
  },
  project: {
    label: 'Proje Ara',
    description: 'Markalı projeleri lansmandan önce keşfedin, global yatırım fırsatlarına erişin.',
    subtitle: 'Global Proje Portföyü',
    ctaLabel: 'Projeleri Keşfet',
  },
};

// Devlet (Kamu) alt kategorileri
const governmentSubCategories = [
  { id: 'gov_ministry', name: 'Bakanlık', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'gov_municipality', name: 'Belediye', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'gov_courthouse', name: 'Adliye', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
  { id: 'gov_security', name: 'Güvenlik Birimleri', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'gov_school', name: 'Okul', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { id: 'gov_university', name: 'Üniversite', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { id: 'gov_hospital', name: 'Şehir/Devlet Hastanesi', icon: 'M4.5 12.75l6 6 9-13.5' },
  { id: 'gov_museum', name: 'Müze', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { id: 'gov_sports', name: 'Spor Tesisi', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'gov_culture', name: 'Kültür Merkezi', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { id: 'gov_bridge', name: 'Köprü', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'gov_road', name: 'Yol', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { id: 'gov_tunnel', name: 'Tünel', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'gov_railway', name: 'Demiryolu', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'gov_airport', name: 'Havalimanı', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
  { id: 'gov_dam', name: 'Baraj', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'gov_energy', name: 'Enerji Santrali', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'gov_treasury', name: 'Hazine Arazisi', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'gov_forest', name: 'Orman Arazisi', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { id: 'gov_pasture', name: 'Mera', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

// Real Estate alt kategorileri
const realEstateSubCategories = [
  { id: 're_apartment', name: 'Daire', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 're_villa', name: 'Villa', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 're_residence', name: 'Rezidans', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 're_student_housing', name: 'Öğrenci Konutu', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { id: 're_office', name: 'Ofis', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 're_mall', name: 'AVM', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { id: 're_hotel', name: 'Otel', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 're_warehouse', name: 'Depo', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 're_logistics', name: 'Lojistik', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  { id: 're_factory', name: 'Fabrika', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 're_osb', name: 'OSB Parseli', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 're_zoned_land', name: 'İmarlı Arsa', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { id: 're_field', name: 'Tarla', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 're_development_land', name: 'Geliştirme Alanı', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
];

// Yatırım Projeleri alt kategorileri
const investmentSubCategories = [
  { id: 'inv_residential_dev', name: 'Konut Geliştirme', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'inv_luxury_dev', name: 'Lüks Proje', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { id: 'inv_mixed_use', name: 'Karma Kullanım', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'inv_urban_renewal', name: 'Kentsel Dönüşüm', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { id: 'inv_reit', name: 'GYO', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'inv_commercial_rental', name: 'Kiralık Ticari', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
  { id: 'inv_coworking', name: 'Coworking', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'inv_logistics_center', name: 'Lojistik Merkezi', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  { id: 'inv_student_housing', name: 'Student Housing', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
  { id: 'inv_senior_living', name: 'Senior Living', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'inv_health_campus', name: 'Sağlık Kampüsü', icon: 'M4.5 12.75l6 6 9-13.5' },
  { id: 'inv_data_center', name: 'Data Center', icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01' },
  { id: 'inv_tourism', name: 'Turizm Tesisi', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'inv_dev_land', name: 'Geliştirilebilir Arsa', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { id: 'inv_land_banking', name: 'Land Banking', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

type ShopCategory = {
  id: string;
  name: string;
  icon: string;
  description?: string;
  children?: Array<{ id: string; name: string; icon: string }>;
};

const shopCategoryOptions: Record<ShopMode, Array<ShopCategory>> = {
  project: [
    {
      id: 'government',
      name: 'Devlet',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      description: 'Devlet (Kamu) Gayrimenkulleri & Altyapı',
      children: governmentSubCategories,
    },
    {
      id: 'realestate',
      name: 'Real Estate',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      description: 'Özel Sektör Gayrimenkulleri',
      children: realEstateSubCategories,
    },
    {
      id: 'investment',
      name: 'Yatırım Projeleri',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      description: 'Yatırım Projeleri',
      children: investmentSubCategories,
    },
  ],
  property: [
    {
      id: 'government',
      name: 'Devlet',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      description: 'Devlet (Kamu) Gayrimenkulleri & Altyapı',
      children: governmentSubCategories,
    },
    {
      id: 'realestate',
      name: 'Real Estate',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      description: 'Özel Sektör Gayrimenkulleri',
      children: realEstateSubCategories,
    },
    {
      id: 'investment',
      name: 'Yatırım Projeleri',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      description: 'Yatırım Projeleri',
      children: investmentSubCategories,
    },
  ],
};

// Ticari alt kategorileri
const commercialSubCategories = [
  { id: 'hospital', name: 'Hastane', icon: 'M4.5 12.75l6 6 9-13.5' },
  { id: 'clinic', name: 'Klinik', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'shop', name: 'Dükkan', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  { id: 'office', name: 'Ofis', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'mall', name: 'AVM', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'hotel', name: 'Otel', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'restaurant', name: 'Restoran', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { id: 'warehouse', name: 'Depo/Fabrika', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const shopCardTags: Record<ShopMode, string[]> = {
  property: ['Devlet', 'Real Estate', 'Yatırım'],
  project: ['Devlet', 'Real Estate', 'Yatırım'],
};

const shopModes: ShopMode[] = ['property', 'project'];


type InsightMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const INSIGHT_HISTORY_LIMIT = 8;

const countryExtendedInsights: Record<
  string,
  {
    dominantReligion: string;
    avgPrimePrice: string;
    marketMomentum: string;
    riskSignal: string;
    highlight: string;
  }
> = {
  TR: {
    dominantReligion: 'İslam',
    avgPrimePrice: '₺120.000 - ₺210.000 /m²',
    marketMomentum: 'Yükselişte',
    riskSignal: 'Orta',
    highlight: 'İstanbul ve kıyı bölgelerinde üst segment talep artışı sürüyor.',
  },
  AE: {
    dominantReligion: 'İslam',
    avgPrimePrice: 'AED 40.000 - AED 55.000 /m²',
    marketMomentum: 'Stabil',
    riskSignal: 'Düşük',
    highlight: 'Dubai prime konut pazarında yabancı yatırımcı ilgisi yüksek.',
  },
  US: {
    dominantReligion: 'Hristiyanlık',
    avgPrimePrice: '$18.000 - $30.000 /m²',
    marketMomentum: 'Hafif Yükseliş',
    riskSignal: 'Orta',
    highlight: 'Miami ve Austin gibi pazarlarda premium projelere talep hızlandı.',
  },
  GB: {
    dominantReligion: 'Hristiyanlık',
    avgPrimePrice: '£22.000 - £35.000 /m²',
    marketMomentum: 'Toparlanma',
    riskSignal: 'Düşük',
    highlight: 'Londra merkezinde prime arz kısıtlı, fiyatlar dirençli.',
  },
  DE: {
    dominantReligion: 'Hristiyanlık',
    avgPrimePrice: '€14.000 - €22.000 /m²',
    marketMomentum: 'Dengede',
    riskSignal: 'Düşük',
    highlight: 'Berlin ve Münih premium segmentte sınırlı stok avantaj sağlıyor.',
  },
  SA: {
    dominantReligion: 'İslam',
    avgPrimePrice: 'SAR 25.000 - SAR 36.000 /m²',
    marketMomentum: 'Yükselişte',
    riskSignal: 'Orta',
    highlight: 'Vision 2030 projeleriyle Riyad konut talebi ivme kazanıyor.',
  },
  QA: {
    dominantReligion: 'İslam',
    avgPrimePrice: 'QAR 28.000 - QAR 38.000 /m²',
    marketMomentum: 'Stabil',
    riskSignal: 'Düşük',
    highlight: 'Lusail ve Pearl bölgelerinde uluslararası yatırımcı ilgisi sürüyor.',
  },
};

const defaultExtendedInsight = {
  dominantReligion: 'Veri hazırlanıyor',
  avgPrimePrice: 'Bilgi yakında',
  marketMomentum: 'İzleniyor',
  riskSignal: 'Orta',
  highlight: 'Bu ülke için pazar içgörüleri kısa süre içinde eklenecek.',
};

export default function PortalLanding({ onEnter }: { onEnter: () => void }) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<'portal' | 'shop' | 'consultant' | 'insight'>('portal');
  const [shopMode, setShopMode] = useState<ShopMode>('property');
  const [selectedShopCategory, setSelectedShopCategory] = useState('government');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedTransactionType, setSelectedTransactionType] = useState<'sale' | 'rent'>('sale');
  const [selectedCountry, setSelectedCountry] = useState<typeof formattedCountries[0] | null>(
    formattedCountries.find(c => c.code === 'TR') || formattedCountries[0]
  );
  const [selectedConsultantType, setSelectedConsultantType] = useState(consultantTypes[0].id);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const selectedConsultant = useMemo(
    () => consultantTypes.find(type => type.id === selectedConsultantType) ?? consultantTypes[0],
    [selectedConsultantType]
  );
  const consultantCountryMap = useMemo(() => {
    const map = new Map<string, string>();
    consultantsData.forEach(record => {
      if (!map.has(record.country)) {
        map.set(record.country, record.countryName);
      }
    });
    return map;
  }, []);
  const supportedConsultantCountryNames = useMemo(
    () => Array.from(consultantCountryMap.values()).sort(),
    [consultantCountryMap]
  );
  const { user } = useAuth();

  // AI Chat messages - load from localStorage on mount
  const [insightMessages, setInsightMessages] = useState<InsightMessage[]>(() => {
    // Server-side render guard
    if (typeof window === 'undefined') {
      return [{
        id: 'welcome',
        role: 'assistant',
        content: "Ben IREMWORLD'ün yapay zeka asistanıyım. Seçtiğiniz ülke hakkında gayrimenkul, yatırım ve yaşam bilgileri için sorularınızı yanıtlamaya hazırım.",
        timestamp: new Date().toISOString(),
      }];
    }

    try {
      const saved = localStorage.getItem('irem_ai_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }

    return [{
      id: 'welcome',
      role: 'assistant',
      content: "Ben IREMWORLD'ün yapay zeka asistanıyım. Seçtiğiniz ülke hakkında gayrimenkul, yatırım ve yaşam bilgileri için sorularınızı yanıtlamaya hazırım.",
      timestamp: new Date().toISOString(),
    }];
  });
  const [insightInput, setInsightInput] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSessionsDrawerOpen, setIsSessionsDrawerOpen] = useState(false);
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullTitle = 'Kalıcı Değer, Güvenli Yatırım';
  const titleRef = useRef<HTMLHeadingElement>(null);
  const portalRootRef = useRef<HTMLDivElement>(null);
  const shopCardRef = useRef<HTMLDivElement | null>(null);
  const consultantCardRef = useRef<HTMLDivElement | null>(null);
  const insightCardRef = useRef<HTMLDivElement | null>(null);
  const shopOverlayRef = useRef<HTMLDivElement | null>(null);
  const consultantOverlayRef = useRef<HTMLDivElement | null>(null);
  const insightOverlayRef = useRef<HTMLDivElement | null>(null);
  const shopCtaRef = useRef<HTMLDivElement | null>(null);
  const consultantCtaRef = useRef<HTMLDivElement | null>(null);
  const insightCtaRef = useRef<HTMLDivElement | null>(null);
  const shopPanelRef = useRef<HTMLDivElement | null>(null);
  const consultantPanelRef = useRef<HTMLDivElement | null>(null);
  const insightPanelRef = useRef<HTMLDivElement | null>(null);
  const filteredConsultants = useMemo(() => {
    return consultantsData.filter(record => {
      const matchesCountry = selectedCountry ? record.country === selectedCountry.code : true;
      const matchesCategory = selectedConsultantType
        ? record.category === selectedConsultantType
        : true;
      return matchesCountry && matchesCategory;
    });
  }, [selectedCountry, selectedConsultantType]);

  const previewConsultants = useMemo(() => filteredConsultants.slice(0, 3), [filteredConsultants]);
  const insightChatScrollerRef = useRef<HTMLDivElement | null>(null);
  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('irem_ai_chat_history', JSON.stringify(insightMessages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [insightMessages]);

  const cardTiltCleanupRef = useRef<Array<() => void>>([]);

  // Responsive: pointer türü ve partikül yoğunluğu
  const [isCoarsePointer, setIsCoarsePointer] = useState<boolean>(false);
  const [starConfig, setStarConfig] = useState<{ big: number; small: number }>({ big: 25, small: 40 });

  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const activeBackground = PORTAL_BACKGROUND_IMAGES[backgroundIndex];

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || PORTAL_BACKGROUND_IMAGES.length <= 1) {
      return;
    }

    try {
      const lastIndexRaw = window.localStorage.getItem('portal-bg-last-index');
      const lastIndex = lastIndexRaw ? parseInt(lastIndexRaw, 10) : undefined;
      const nextIndex = getRandomBackgroundIndex(lastIndex);
      setBackgroundIndex(nextIndex);
      window.localStorage.setItem('portal-bg-last-index', String(nextIndex));
    } catch {
      setBackgroundIndex(prev => getRandomBackgroundIndex(prev));
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Dokunmatik cihaz tespiti (coarse pointer)
    try {
      const mq = window.matchMedia('(pointer: coarse)');
      setIsCoarsePointer(mq.matches);
      
      // Ekran boyutuna göre yıldız partikül sayısı - mobilde minimal
      const computeStars = () => {
        const w = window.innerWidth;
        // Mobilde minimal partikül - maksimum performans
        if (w < 480) {
          setStarConfig({ big: 4, small: 6 }); // Çok hafif - sadece efekt için
        } else if (w < 768) {
          setStarConfig({ big: 6, small: 10 }); // Tablet - orta seviye
        } else if (w < 1280) {
          setStarConfig({ big: 12, small: 18 }); // Laptop - normal
        } else {
          setStarConfig({ big: 15, small: 22 }); // Desktop - tam deneyim
        }
      };
      computeStars();
      window.addEventListener('resize', computeStars);
      return () => window.removeEventListener('resize', computeStars);
    } catch {
      // Sessizce geç
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('portal-bg-last-index', String(backgroundIndex));
    } catch {
      // storage unavailable
    }
  }, [backgroundIndex]);

  const numberFormatter = useMemo(() => new Intl.NumberFormat('tr-TR'), []);

  const selectedCountryData = useMemo(() => {
    if (!selectedCountry) {
      return null;
    }

    return (
      countries.find((country: any) => country.cca2 === selectedCountry.code) || null
    );
  }, [selectedCountry]) as any;

  const extendedInsight = useMemo(() => {
    if (!selectedCountry?.code) {
      return defaultExtendedInsight;
    }

    return countryExtendedInsights[selectedCountry.code] || defaultExtendedInsight;
  }, [selectedCountry]);

  const populationDisplay = selectedCountryData?.population
    ? `${numberFormatter.format(selectedCountryData.population)} kişi`
    : 'Veri bekleniyor';

  const capitalDisplay = selectedCountryData?.capital?.[0] || 'Belirleniyor';

  const regionDisplay = selectedCountryData?.region || 'Tanımsız';
  const subRegionDisplay = selectedCountryData?.subregion || '';

  const currencyDisplay = selectedCountryData?.currencies
    ? Object.values(selectedCountryData.currencies)
        .map((currency: any) => `${currency.name}${currency.symbol ? ` (${currency.symbol})` : ''}`)
        .join(', ')
    : 'Belirleniyor';

  const languageDisplay = selectedCountryData?.languages
    ? Object.values(selectedCountryData.languages).join(', ')
    : 'Bilgi bekleniyor';

  const areaDisplay = selectedCountryData?.area
    ? `${numberFormatter.format(Math.round(selectedCountryData.area))} km²`
    : 'Belirleniyor';

  const densityDisplay =
    selectedCountryData?.population && selectedCountryData?.area
      ? `${numberFormatter.format(
          Math.round(selectedCountryData.population / selectedCountryData.area)
        )} kişi/km²`
      : 'Bilgi bekleniyor';

  const canSendInsight = insightInput.trim().length > 0 && !isInsightLoading;

  useEffect(() => {
    if (PORTAL_BACKGROUND_IMAGES.length <= 1) {
      return;
    }

    // İlk geçişten önce bekleme - daha uzun süre aynı görsel (performans)
    const initialDelay = setTimeout(() => {
      setBackgroundIndex(prev => (prev + 1) % PORTAL_BACKGROUND_IMAGES.length);
      
      // Sonraki geçişler için düzenli interval
      const timer = window.setInterval(() => {
        setBackgroundIndex(prev => (prev + 1) % PORTAL_BACKGROUND_IMAGES.length);
      }, 12000); // 12 saniyede bir geçiş - daha uzun süre (performans için)

      return () => window.clearInterval(timer);
    }, 8000); // İlk 8 saniye aynı görsel kalır

    return () => clearTimeout(initialDelay);
  }, []);

  // Daktilo animasyonu - el yazısı gibi
  useEffect(() => {
    let currentIndex = 0;
    const typingSpeed = () => Math.random() * 80 + 40; // 40-120ms arası değişken hız
    
    const typeNextCharacter = () => {
      if (currentIndex < fullTitle.length) {
        setDisplayedTitle(fullTitle.slice(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextCharacter, typingSpeed());
      } else {
        // Animasyon bitince cursor'u 1 saniye sonra kaldır
        setTimeout(() => setShowCursor(false), 1000);
      }
    };

    // Başlamadan önce küçük bir gecikme
    const startTimeout = setTimeout(typeNextCharacter, 300);

    return () => {
      clearTimeout(startTimeout);
    };
  }, []);

  useEffect(() => {
    // Mobil panel açıldığında arka plan kaydırmasını kilitle
    if (typeof document !== 'undefined' && isCoarsePointer) {
      const shouldLock = activePanel !== 'portal';
      const prevOverflow = document.body.style.overflow;
      const prevTouchAction = document.body.style.touchAction;
      if (shouldLock) {
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      }
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouchAction;
      };
    }
  }, [activePanel, isCoarsePointer]);

  useEffect(() => {
    const modeCategories = shopCategoryOptions[shopMode];

    if (modeCategories.length && !modeCategories.some(category => category.id === selectedShopCategory)) {
      setSelectedShopCategory(modeCategories[0].id);
    }

    if (!modeCategories.length && selectedShopCategory) {
      setSelectedShopCategory('');
    }
  }, [shopMode, selectedShopCategory]);

  // Kategori değiştiğinde ticari alt kategoriyi sıfırla
  useEffect(() => {
    // Eğer kullanıcının seçimi ticari, devlet ya da yatırım alt kategorileri değilse sıfırla
    if (!['commercial', 'government', 'investment'].includes(selectedShopCategory)) {
      setSelectedSubCategory('');
    }
  }, [selectedShopCategory]);

  useEffect(() => {
    const portalRoot = portalRootRef.current;
    const shopCard = shopCardRef.current;
    const consultantCard = consultantCardRef.current;
    const insightCard = insightCardRef.current;

    if (activePanel !== 'portal' || !portalRoot || !shopCard || !consultantCard || !insightCard) {
      return;
    }

    // Her kartın başlangıçta görünür olduğundan emin olalım
    gsap.set([shopCard, consultantCard, insightCard], { 
      opacity: 1, 
      y: 0, 
      rotate: 0,
      scale: 1,
      clearProps: 'all'
    });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // Premium paralax efekti ile kartları sırayla göster
      tl.fromTo(
        shopCard,
        { 
          y: 100, 
          opacity: 0, 
          scale: 0.85,
          rotateX: 25,
          transformPerspective: 1000,
          boxShadow: '0px 0px 0px rgba(0,0,0,0)'
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          rotateX: isCoarsePointer ? 0 : 8,
          rotateY: isCoarsePointer ? 0 : 15,
          z: 0,
          duration: isCoarsePointer ? 0.9 : 1.2,
          boxShadow: '-15px 25px 70px -35px rgba(17, 24, 39, 0.3)',
          ease: 'expo.out'
        },
        0.1
      )
      .fromTo(
        shopCard.querySelector('.portal-card-icon'),
        { scale: 0, rotate: -180 },
        { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' },
        0.4
      )
      .fromTo(
        consultantCard,
        { 
          y: 100, 
          opacity: 0, 
          scale: 0.85,
          rotateX: 25,
          transformPerspective: 1000,
          boxShadow: '0px 0px 0px rgba(0,0,0,0)'
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          rotateX: isCoarsePointer ? 0 : 8,
          rotateY: 0,
          z: isCoarsePointer ? 0 : 30,
          duration: isCoarsePointer ? 0.9 : 1.2,
          boxShadow: '0px 40px 100px -25px rgba(17, 24, 39, 0.4)',
          ease: 'expo.out'
        },
        0.25
      )
      .fromTo(
        consultantCard.querySelector('.portal-card-icon'),
        { scale: 0, rotate: 180 },
        { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' },
        0.55
      )
      .fromTo(
        insightCard,
        { 
          y: 100, 
          opacity: 0, 
          scale: 0.85,
          rotateX: 25,
          transformPerspective: 1000,
          boxShadow: '0px 0px 0px rgba(0,0,0,0)'
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          rotateX: isCoarsePointer ? 0 : 8,
          rotateY: isCoarsePointer ? 0 : -15,
          z: 0,
          duration: isCoarsePointer ? 0.9 : 1.2,
          boxShadow: '15px 25px 70px -35px rgba(17, 24, 39, 0.3)',
          ease: 'expo.out'
        },
        0.4
      )
      .fromTo(
        insightCard.querySelector('.portal-card-icon'),
        { scale: 0, rotate: -180 },
        { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' },
        0.7
      )
      
      // Badge'leri dalga efektiyle göster
      const allBadges = [
        ...shopCard.querySelectorAll('.portal-card-badge'),
        ...consultantCard.querySelectorAll('.portal-card-badge'),
        ...insightCard.querySelectorAll('.portal-card-badge')
      ];
      
      tl.fromTo(
        allBadges,
        { 
          y: 20, 
          opacity: 0, 
          scale: 0.8,
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.5)',
          stagger: { 
            each: 0.04,
            from: 'start'
          }
        },
        0.8
      )
      
      // CTA'ları pulse efektiyle göster
      .fromTo(
        [shopCtaRef.current, consultantCtaRef.current, insightCtaRef.current],
        { 
          opacity: 0, 
          scale: 0.9,
          x: -20
        },
        { 
          opacity: 1, 
          scale: 1,
          x: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1
        },
        1.0
      );
    }, portalRoot);

    return () => {
      // Cleanup yaparken kartların görünür kalmasını sağla
      ctx.revert();
      if (shopCard && consultantCard && insightCard) {
        gsap.set([shopCard, consultantCard, insightCard], { 
          opacity: 1, 
          y: 0, 
          rotate: 0,
          clearProps: 'transform'
        });
      }
    };
  }, [activePanel, isCoarsePointer]);

  useEffect(() => {
    if (activePanel !== 'shop' || !shopPanelRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.55 } });

      tl.from('[data-anim="shop-heading"]', {
        y: 36,
        opacity: 0,
      })
        .from(
          '[data-anim="shop-toggle"] .shop-toggle-item',
          {
            opacity: 0,
            y: 26,
            duration: 0.45,
            ease: 'back.out(1.4)',
            stagger: { each: 0.08, from: 'center' },
          },
          '-=0.32'
        )
        .from(
          '[data-anim="shop-country"]',
          {
            y: 24,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.32'
        )
        .from(
          '[data-anim="shop-categories"] .shop-category-item',
          {
            y: 22,
            opacity: 0,
            duration: 0.45,
            ease: 'back.out(1.6)',
            stagger: { each: 0.05, from: 'center' },
          },
          '-=0.28'
        )
        .from(
          '[data-anim="shop-intents"] .shop-intent-item',
          {
            y: 20,
            opacity: 0,
            duration: 0.45,
            ease: 'back.out(1.6)',
            stagger: { each: 0.06, from: 'edges' },
          },
          '-=0.3'
        )
        .from(
          '[data-anim="shop-cta"]',
          {
            opacity: 0,
            y: 18,
            scale: 0.96,
            duration: 0.4,
            stagger: 0.1,
          },
          '-=0.25'
        );
    }, shopPanelRef);

    return () => ctx.revert();
  }, [activePanel]);

  useEffect(() => {
    if (activePanel !== 'consultant' || !consultantPanelRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.55 } });

      tl.from('[data-anim="consultant-heading"]', {
        y: 34,
        opacity: 0,
      })
        .from(
          '[data-anim="consultant-country"]',
          {
            y: 24,
            opacity: 0,
            duration: 0.5,
          },
          '-=0.3'
        )
        .from(
          '[data-anim="consultant-grid"] .consultant-type-item',
          {
            y: 22,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(1.7)',
            stagger: { each: 0.06, from: 'center' },
          },
          '-=0.25'
        )
        .from(
          '[data-anim="consultant-detail"]',
          {
            y: 20,
            opacity: 0,
            duration: 0.45,
          },
          '-=0.24'
        )
        .from(
          '[data-anim="consultant-cta"]',
          {
            opacity: 0,
            y: 18,
            scale: 0.95,
            duration: 0.4,
            stagger: 0.12,
          },
          '-=0.22'
        );
    }, consultantPanelRef);

    return () => ctx.revert();
  }, [activePanel]);

  useEffect(() => {
    if (activePanel !== 'insight' || !insightPanelRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.55 } });

      tl.from('[data-anim="insight-heading"]', {
        y: 34,
        opacity: 0,
      })
        .from(
          '[data-anim="insight-selector"]',
          {
            y: 24,
            opacity: 0,
            duration: 0.45,
          },
          '-=0.28'
        )
        .from(
          '[data-anim="insight-stats"] .insight-stat-card',
          {
            y: 28,
            opacity: 0,
            duration: 0.45,
            ease: 'back.out(1.6)',
            stagger: { each: 0.08, from: 'center' },
          },
          '-=0.3'
        )
        .from(
          '[data-anim="insight-highlight"]',
          {
            y: 24,
            opacity: 0,
            duration: 0.45,
          },
          '-=0.26'
        )
        .from(
          '[data-anim="insight-cta"]',
          {
            opacity: 0,
            y: 18,
            scale: 0.96,
            duration: 0.4,
          },
          '-=0.2'
        );
    }, insightPanelRef);

    return () => ctx.revert();
  }, [activePanel, selectedCountry]);

  useEffect(() => {
    if (!insightChatScrollerRef.current) {
      return;
    }

    insightChatScrollerRef.current.scrollTo({
      top: insightChatScrollerRef.current.scrollHeight,
      behavior: insightMessages.length > 1 ? 'smooth' : 'auto',
    });
  }, [insightMessages]);

  // Benzersiz kullanıcı ID'si oluştur - browser fingerprint bazlı
  const getUserId = () => {
    if (user?.id) return user.id;
    
    // Browser'da benzersiz ID oluştur ve sakla
    if (typeof window !== 'undefined') {
      let browserId = localStorage.getItem('irem_browser_id');
      if (!browserId) {
        browserId = `browser_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem('irem_browser_id', browserId);
      }
      return browserId;
    }
    
    return 'anonymous';
  };

  useEffect(() => {
    async function loadSessions() {
      try {
        const userId = getUserId();
        const res = await fetch('/api/ai/sessions', {
          headers: {
            'x-user-id': userId,
            'x-user-name': user?.name || 'Anonymous',
            'x-user-email': user?.email || '',
          },
        });
        if (!res.ok) return;
        const json = await res.json();
        setSessions(json.sessions || []);
      } catch (err) {
        // ignore; sessions are optional
      }
    }

    loadSessions();
  }, [user?.id, user?.name, user?.email]);

  useEffect(() => {
    cardTiltCleanupRef.current.forEach(cleanup => cleanup());
    cardTiltCleanupRef.current = [];

    if (activePanel !== 'portal') {
      return;
    }

    // Throttle helper - performans için hover event'leri azalt
    let rafId: number | null = null;
    const throttledHover = (callback: () => void) => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        callback();
        rafId = null;
      });
    };

    const tiltConfigs: Array<{
      card: HTMLDivElement;
      base: { rotationX: number; rotationY: number };
    }> = [];

    // Sol kart (Shop) - mobilde 3D kapalı
    if (shopCardRef.current) {
      tiltConfigs.push({ card: shopCardRef.current, base: { rotationX: isCoarsePointer ? 0 : 8, rotationY: isCoarsePointer ? 0 : 15 } });
    }

    // Orta kart (Consultant) - diğer kartlarla aynı seviyede geriye yatık, öne doğru çıkıyor
    if (consultantCardRef.current) {
      gsap.set(consultantCardRef.current, {
        transformPerspective: 1200,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center',
        rotationX: isCoarsePointer ? 0 : 8,
        rotationY: 0,
        z: isCoarsePointer ? 0 : 30,
      });
    }

    // Sağ kart (Insight) - mobilde 3D kapalı
    if (insightCardRef.current) {
      tiltConfigs.push({ card: insightCardRef.current, base: { rotationX: isCoarsePointer ? 0 : 8, rotationY: isCoarsePointer ? 0 : -15 } });
    }

    // Orta kart için özel mouse handler (mobilde performans için kapalı)
    // Sadece desktop'ta aktif (pointer: fine ve min-width: 1024px)
    const isDesktop = !isCoarsePointer && typeof window !== 'undefined' && window.innerWidth >= 1024;
    if (consultantCardRef.current && isDesktop) {
      const consultantCard = consultantCardRef.current;
      
      gsap.set(consultantCard, {
        transformPerspective: 1200,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center',
        force3D: true, // GPU acceleration
      });
      
      const handleConsultantMove = (event: MouseEvent) => {
        throttledHover(() => {
          const rect = consultantCard.getBoundingClientRect();
          const offsetX = event.clientX - rect.left;
          const offsetY = event.clientY - rect.top;
          
          // Orta kart için daha subtle hareket
          const tiltY = ((offsetX / rect.width) - 0.5) * 18;
          const tiltX = ((offsetY / rect.height) - 0.5) * -12;
          
          const icon = consultantCard.querySelector('.portal-card-icon') as HTMLElement;
          const badges = consultantCard.querySelectorAll('.portal-card-badge') as NodeListOf<HTMLElement>;
          
          gsap.to(consultantCard, {
            rotationY: tiltY,
            rotationX: 8 + tiltX,
            z: 35,
            duration: 0.4, // Daha hızlı
            ease: 'power2.out',
            boxShadow: `${tiltY}px ${tiltX + 15}px 90px -20px rgba(240,127,56,0.45)`,
            force3D: true,
          });
          
          if (icon) {
            gsap.to(icon, {
              x: -tiltY * 0.4,
              y: -tiltX * 0.4,
              duration: 0.4,
              ease: 'power2.out',
              force3D: true,
            });
          }
          
          if (badges.length) {
            badges.forEach((badge, index) => {
              gsap.to(badge, {
                x: -tiltY * (0.25 + index * 0.08),
                y: -tiltX * (0.25 + index * 0.08),
                duration: 0.4,
                ease: 'power2.out',
                force3D: true,
              });
            });
          }
        });
      };
      
      const handleConsultantLeave = () => {
        const icon = consultantCard.querySelector('.portal-card-icon') as HTMLElement;
        const badges = consultantCard.querySelectorAll('.portal-card-badge') as NodeListOf<HTMLElement>;
        
        gsap.to(consultantCard, {
          rotationY: 0,
          rotationX: 8,
          z: 30,
          duration: 0.6, // Daha hızlı
          ease: 'power2.out',
          boxShadow: '0px 40px 100px -25px rgba(17, 24, 39, 0.4)',
          force3D: true,
        });
        
        if (icon) {
          gsap.to(icon, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            force3D: true,
          });
        }
        
        if (badges.length) {
          gsap.to(badges, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            force3D: true,
          });
        }
      };
      
      consultantCard.addEventListener('mousemove', handleConsultantMove);
      consultantCard.addEventListener('mouseleave', handleConsultantLeave);
      consultantCard.addEventListener('mouseenter', handleConsultantMove);
      
      cardTiltCleanupRef.current.push(() => {
        consultantCard.removeEventListener('mousemove', handleConsultantMove);
        consultantCard.removeEventListener('mouseleave', handleConsultantLeave);
        consultantCard.removeEventListener('mouseenter', handleConsultantMove);
      });
    }

    tiltConfigs.forEach(({ card, base }) => {
      // Mobil ve tablet cihazlarda 3D animasyonları kapat - performans için
      const isDesktop = !isCoarsePointer && typeof window !== 'undefined' && window.innerWidth >= 1024;
      if (!isDesktop) {
        return; // Mobilde hiç 3D animasyon yapma
      }

      gsap.set(card, {
        transformPerspective: 1200,
        transformStyle: 'preserve-3d',
        transformOrigin: 'center',
        rotationX: base.rotationX,
        rotationY: base.rotationY,
        z: 0,
        force3D: true, // GPU acceleration
      });

      const handleMove = (event: MouseEvent) => {
        throttledHover(() => {
          const rect = card.getBoundingClientRect();
          const offsetX = event.clientX - rect.left;
          const offsetY = event.clientY - rect.top;
          
          // Daha belirgin 3D tilt efekti
          const tiltY = ((offsetX / rect.width) - 0.5) * 20;
          const tiltX = ((offsetY / rect.height) - 0.5) * -15;
          
          // Paralax efekti için içerik elementlerini hareket ettir
          const icon = card.querySelector('.portal-card-icon') as HTMLElement;
          const badges = card.querySelectorAll('.portal-card-badge') as NodeListOf<HTMLElement>;
          
          gsap.to(card, {
            rotationY: base.rotationY + tiltY,
            rotationX: base.rotationX + tiltX,
            duration: 0.4, // Daha hızlı
            ease: 'power2.out',
            boxShadow: `${tiltY * 2}px ${tiltX * 2}px 80px -20px rgba(240,127,56,0.4)`,
            force3D: true,
          });
          
          // İçerik elementlerine ters yönde hafif hareket (paralax)
          if (icon) {
            gsap.to(icon, {
              x: -tiltY * 0.5,
              y: -tiltX * 0.5,
              duration: 0.4,
              ease: 'power2.out',
              force3D: true,
            });
          }
          
          if (badges.length) {
            badges.forEach((badge, index) => {
              gsap.to(badge, {
                x: -tiltY * (0.3 + index * 0.1),
                y: -tiltX * (0.3 + index * 0.1),
                duration: 0.4,
                ease: 'power2.out',
                force3D: true,
              });
            });
          }
        });
      };

      const handleLeave = () => {
        const icon = card.querySelector('.portal-card-icon') as HTMLElement;
        const badges = card.querySelectorAll('.portal-card-badge') as NodeListOf<HTMLElement>;
        
        gsap.to(card, {
          rotationY: base.rotationY,
          rotationX: base.rotationX,
          duration: 0.6, // Daha hızlı
          ease: 'power2.out',
          boxShadow: '0px 22px 60px -40px rgba(17, 24, 39, 0.25)',
          force3D: true,
        });
        
        // İçerikleri de orijinal konumlarına döndür
        if (icon) {
          gsap.to(icon, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            force3D: true,
          });
        }
        
        if (badges.length) {
          gsap.to(badges, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            force3D: true,
          });
        }
      };

      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);
      card.addEventListener('mouseenter', handleMove);

      cardTiltCleanupRef.current.push(() => {
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', handleLeave);
        card.removeEventListener('mouseenter', handleMove);
      });
    });

    return () => {
      cardTiltCleanupRef.current.forEach(cleanup => cleanup());
      cardTiltCleanupRef.current = [];
    };
  }, [activePanel, isCoarsePointer]);

  const handleCardHover = (
    card: 'shop' | 'consultant' | 'insight',
    isHovering: boolean
  ) => {
    // Dokunmatik cihazlarda hover animasyonları kapalı
    if (isCoarsePointer) return;

    let cardRef: HTMLDivElement | null = null;
    let overlayRef: HTMLDivElement | null = null;
    let ctaRef: HTMLDivElement | null = null;

    if (card === 'shop') {
      cardRef = shopCardRef.current;
      overlayRef = shopOverlayRef.current;
      ctaRef = shopCtaRef.current;
    } else if (card === 'consultant') {
      cardRef = consultantCardRef.current;
      overlayRef = consultantOverlayRef.current;
      ctaRef = consultantCtaRef.current;
    } else {
      cardRef = insightCardRef.current;
      overlayRef = insightOverlayRef.current;
      ctaRef = insightCtaRef.current;
    }

    if (!cardRef) {
      return;
    }

    gsap.killTweensOf(cardRef);
    
    // Premium lift efekti - daha belirgin ve etkileyici
    gsap.to(cardRef, {
      y: isHovering ? -20 : 0,
      scale: isHovering ? 1.03 : 1,
      boxShadow: isHovering
        ? '0px 50px 120px -30px rgba(240,127,56,0.6), 0px 20px 60px -15px rgba(240,127,56,0.3)'
        : '0px 22px 60px -40px rgba(17, 24, 39, 0.25)',
      duration: 0.7,
      ease: 'power4.out',
      zIndex: isHovering ? 10 : 1,
    });

    if (overlayRef) {
      gsap.killTweensOf(overlayRef);
      gsap.to(overlayRef, {
        opacity: isHovering ? 1 : 0,
        scale: isHovering ? 1.05 : 1,
        duration: 0.6,
        ease: 'power3.out',
      });
    }

    const iconEl = cardRef.querySelector('.portal-card-icon');
    const badgeEls = cardRef.querySelectorAll('.portal-card-badge');
    const headlineEls = cardRef.querySelectorAll('.portal-card-headline');
    const descEl = cardRef.querySelector('p');

    if (iconEl) {
      gsap.killTweensOf(iconEl);
      
      // İkona 3D rotasyon ve parıltı efekti
      gsap.to(iconEl, {
        scale: isHovering ? 1.25 : 1,
        rotate: isHovering ? 360 : 0,
        duration: isHovering ? 0.8 : 0.6,
        ease: isHovering ? 'back.out(1.5)' : 'power3.out',
      });
      
      // İkon içindeki SVG'yi de animasyon yap
      const svgEl = iconEl.querySelector('svg');
      if (svgEl) {
        gsap.to(svgEl, {
          filter: isHovering ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none',
          duration: 0.5,
        });
      }
    }

    if (badgeEls.length) {
      gsap.killTweensOf(badgeEls);
      
      // Badge'leri dalga efektiyle yukarı kaldır
      gsap.to(badgeEls, {
        y: isHovering ? -4 : 0,
        opacity: isHovering ? 1 : 0.85,
        scale: isHovering ? 1.08 : 1,
        backgroundColor: isHovering ? 'rgba(255,240,229,1)' : 'rgba(255,240,229,0.8)',
        duration: 0.6,
        ease: 'power3.out',
        stagger: { 
          each: 0.06, 
          from: 'start',
          ease: 'power2.inOut'
        },
      });
    }

    if (headlineEls.length) {
      gsap.killTweensOf(headlineEls);
      
      // Başlığa premium glow efekti
      gsap.to(headlineEls, {
        y: isHovering ? -4 : 0,
        scale: isHovering ? 1.02 : 1,
        color: isHovering ? '#f07f38' : '#111827',
        textShadow: isHovering ? '0 4px 12px rgba(240,127,56,0.3)' : 'none',
        duration: 0.6,
        ease: 'power3.out',
      });
    }
    
    // Açıklama metnine subtle animasyon
    if (descEl && descEl.classList.contains('text-gray-600')) {
      gsap.to(descEl, {
        y: isHovering ? -2 : 0,
        color: isHovering ? '#4b5563' : '#6b7280',
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    if (ctaRef) {
      gsap.killTweensOf(ctaRef);
      const arrowEl = ctaRef.querySelector('svg');
      if (arrowEl) {
        gsap.killTweensOf(arrowEl);
      }

      if (isHovering) {
        // CTA'ya daha belirgin hareket ve glow efekti
        gsap.to(ctaRef, {
          x: 12,
          scale: 1.08,
          textShadow: '0 2px 8px rgba(240,127,56,0.4)',
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
          repeat: -1,
          yoyo: true,
          repeatDelay: 0.3,
        });

        if (arrowEl) {
          // Ok ikonuna sürekli ileri-geri hareket
          gsap.to(arrowEl, {
            x: 8,
            scale: 1.2,
            rotation: 0,
            filter: 'drop-shadow(0 0 6px rgba(240,127,56,0.6))',
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)',
            repeat: -1,
            yoyo: true,
            repeatDelay: 0.3,
          });
        }
      } else {
        gsap.to(ctaRef, {
          x: 0,
          scale: 1,
          textShadow: 'none',
          duration: 0.5,
          ease: 'power3.out',
        });

        if (arrowEl) {
          gsap.to(arrowEl, {
            x: 0,
            scale: 1,
            rotation: 0,
            filter: 'none',
            duration: 0.5,
            ease: 'power3.out',
          });
        }
      }
    }
  };

  useEffect(() => {
    if (!titleRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const titleElement = titleRef.current;
      if (!titleElement) return;

      // Epic giriş animasyonu - sinematik 3D depth
      gsap.fromTo(
        titleElement,
        { 
          y: 100, 
          opacity: 0, 
          scale: 0.8,
          rotationX: -30,
          rotationY: -15,
          z: -300,
          transformPerspective: 1500,
          filter: 'blur(15px) brightness(0.4)',
        },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          rotationX: 0,
          rotationY: 0,
          z: 0,
          filter: 'blur(0px) brightness(1)',
          duration: 2.2, 
          ease: 'expo.out',
          delay: 0.3,
        }
      );

      // Hafif subtle parıltı - smooth
      gsap.to(titleElement, {
        filter: 'brightness(1.05)',
        textShadow: '0 4px 20px rgba(240,127,56,0.15), 0 2px 10px rgba(255,255,255,0.2)',
        duration: 5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 3,
      });

      // Glow backdrop pulse - magical atmosphere
      const titleParent = titleElement.parentElement;
      if (titleParent) {
        const glowElements = titleParent.querySelectorAll('.absolute.inset-0');
        
        glowElements.forEach((glow, index) => {
          gsap.to(glow, {
            opacity: index === 0 ? 0.8 : 0.7,
            scale: 1.3 + (index * 0.1),
            duration: 5 + (index * 0.5),
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 2.5 + (index * 0.3),
          });
        });

        // Yıldız tozu container animasyonu
        const stardust = titleParent.querySelector('.overflow-visible');
        if (stardust) {
          gsap.to(stardust, {
            scale: 1.05,
            rotation: 2,
            duration: 10,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: 3,
          });
        }
      }

    }, titleRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!portalRootRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Alt başlık animasyonu - prestige giriş
      const subtitle = portalRootRef.current?.querySelector('.text-base.xs\\:text-lg');
      if (subtitle) {
        gsap.fromTo(
          subtitle,
          {
            opacity: 0,
            y: 30,
            scale: 0.95,
            filter: 'blur(5px)',
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'expo.out',
            delay: 0.8,
          }
        );

        // Sürekli subtle hareket - kurumsal zarif
        gsap.to(subtitle, {
          y: -5,
          duration: 4.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 2.5,
        });

        // Letter spacing animasyonu - lüks his
        gsap.to(subtitle, {
          letterSpacing: '0.08em',
          duration: 5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 3,
        });
      }

      // Kart ikonları - premium cascade
      tl.from('.portal-card-icon', {
        opacity: 0,
        y: 28,
        scale: 0.8,
        rotation: -180,
        duration: 0.7,
        stagger: 0.1,
        delay: 0.25,
        ease: 'back.out(1.5)',
      })
        .from(
          '.portal-card-badge',
          {
            opacity: 0,
            y: 24,
            duration: 0.55,
            ease: 'back.out(1.6)',
            stagger: { each: 0.06, from: 'start' },
          },
          '-=0.35'
        );
    }, portalRootRef);

    return () => ctx.revert();
  }, []);

  const handleShopSearch = () => {
    // Government category routing - redirect to dedicated /government page
    if (selectedShopCategory === 'government') {
      const params = new URLSearchParams();
      
      if (selectedSubCategory) {
        params.set('category', selectedSubCategory);
      }
      
      
      const queryString = params.toString();
      router.push(queryString ? `/government?${queryString}` : '/government');
      return;
    }

    const params = new URLSearchParams();
    
    // Ülke parametresi
    if (selectedCountry?.code) {
      params.set('country', selectedCountry.code);
    }

    // Transaction type (sale/rent)
    params.set('type', selectedTransactionType);

    // Kategori - map UI category/grouping to backend property/project category
    if (selectedShopCategory) {
      const mapCategoryForQuery = (main: string, sub: string | null | undefined) => {
        // Default mapping - fallback to provided ids if no clear mapping
        if (main === 'government') {
          return { main: 'Devlet', sub: sub || undefined };
        }
        if (main === 'realestate') {
          // Map private sector children to existing PropertyMainCategory
          if (!sub) return null; // If no child selected, don't filter by category
          if (sub === 'residential') return { main: 'Konut', sub: 'Konut' };
          if (sub === 'commercial') return { main: 'İş Yeri', sub: 'Ticari' };
          if (sub === 'industrial') return { main: 'İş Yeri', sub: 'Sanayi' };
          if (sub === 'land') return { main: 'Arsa', sub: 'Arsa' };
          // If no child selected, just return Real Estate generic
          return { main: 'Konut', sub: undefined };
        }
        if (main === 'investment') {
          // keep ID stable for projects page to detect 'investment' filters
          return { main: 'investment', sub: sub || undefined };
        }

        // The previous single-level category ids (residential/commercial) are still supported
        if (main === 'residential') return { main: 'Konut', sub: undefined };
        if (main === 'commercial') return { main: 'İş Yeri', sub: undefined };
        if (main === 'industrial') return { main: 'İş Yeri', sub: undefined };
        if (main === 'land') return { main: 'Arsa', sub: undefined };

        return { main, sub: sub || undefined };
      };

      const categoryObj = mapCategoryForQuery(selectedShopCategory, selectedSubCategory || undefined);
      if (categoryObj) {
        params.set('category', JSON.stringify(categoryObj));
      }
    }

    if (shopMode === 'project') {
      // Proje aramaları için projects sayfası
      params.set('mode', 'project');
      router.push(`/projects?${params.toString()}`);
    } else {
      // Gayrimenkul aramaları için property sayfası (harita görünümü)
      router.push(`/property?${params.toString()}`);
    }
  };

  const handleConsultantSearch = () => {
    const params = new URLSearchParams();
    if (selectedCountry?.code) {
      params.set('country', selectedCountry.code);
    }
    if (selectedConsultantType) {
      params.set('specialty', selectedConsultantType);
    }

    router.push(`/consultants${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleInsightMessageSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = insightInput.trim();
    if (!trimmed || isInsightLoading) {
      return;
    }

    // Client-side guard: refuse if the question is not about the selected country.
    // However allow queries about common country-level topics (taxes, population, investment etc.) if a country is selected.
    const normalizedMsg = trimmed.toLowerCase();
    const cNameLower = selectedCountry?.name?.toLowerCase() ?? '';
    const allowedCountryPhrases = [
      'bu ülke',
      'seçilen ülke',
      'seçtiğim ülke',
      'seçtiğiniz ülke',
      'seçtiğimiz ülke',
      'buradaki ülke',
      'this country',
      'selected country',
      'the selected country',
    ];

    const mentionsCountryName = !!cNameLower && normalizedMsg.includes(cNameLower);
    const containsCountryPhrase = allowedCountryPhrases.some(p => normalizedMsg.includes(p));
    const mentionedPreviously = insightMessages.some(m => (m.content || '').toLowerCase().includes(cNameLower));

    const allowedTopics = [
      'vergi','vergi sistemi','vergi oranı','tax','taxation',
      'nüfus','population','din','religion','inanç',
      'yatırım','investment','yatırım bölgeleri','yaşam','yaşam kalitesi','life quality',
      'kira','kiralar','kira fiyatı','kira fiyatları','rent','rental','ipotek','mortgage','konut kredisi'
    ];

    const normalizeText = (s?: string | null) => {
      try {
        if (!s) return '';
        return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[\p{P}\p{S}]/gu, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      } catch {
        return (s || '').toLowerCase();
      }
    };

    const containsAllowedTopic = (text: string | undefined | null) => {
      const norm = normalizeText(text);
      if (!norm) return false;
      return allowedTopics.some(t => norm.includes(t));
    };

    // Allowed if the message contains an allowed topic and either mentions the country
    // explicitly OR selectedCountry is set. This prevents unrelated country mentions.
    const mentionsCountryAndTopic = mentionsCountryName && containsAllowedTopic(trimmed);
    if (!(mentionsCountryAndTopic || containsCountryPhrase || mentionedPreviously || (selectedCountry && containsAllowedTopic(trimmed)))) {
            const assistantReply = `Ben IREMWORLD’ün yapay zeka asistanıyım. Sadece seçilen ülke hakkında soru sorabilirsiniz: ${selectedCountry?.name || 'Ülke seçiniz'}.`;
      const assistantMsg: InsightMessage = {
        id: `assistant-${new Date().toISOString()}`,
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date().toISOString(),
      };

      setInsightMessages(prev => [...prev, assistantMsg]);
      setInsightInput('');
      return;
    }

    const timestamp = new Date().toISOString();
    const userMessage: InsightMessage = {
      id: `user-${timestamp}`,
      role: 'user',
      content: trimmed,
      timestamp,
    };

    const pendingMessage: InsightMessage = {
      id: `assistant-${timestamp}`,
      role: 'assistant',
      content: 'Yanıt hazırlanıyor...',
      timestamp,
    };

    const conversationPayload = [...insightMessages, userMessage]
      .slice(-INSIGHT_HISTORY_LIMIT)
      .map(({ role, content }) => ({ role, content }));

    setInsightMessages(prev => [...prev, userMessage, pendingMessage]);
    setInsightInput('');
    setInsightError(null);
    setIsInsightLoading(true);

    try {
      // NOTE: The client-side classifier was removed to avoid exposing
      // `/api/ai/classify` in browser DevTools. Classification and blocking
      // are performed server-side in `/api/ai/insight` for security and to
      // keep endpoint names hidden from the client. The server also logs
      // blocked/allowed events; no client-side logging is needed.
      const response = await fetch('/api/ai/insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'anonymous',
          'x-user-name': user?.name || 'Anonymous',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify({
          message: trimmed,
          countryCode: selectedCountry?.code,
          countryName: selectedCountry?.name,
          countryContext: {
            capital: capitalDisplay,
            population: populationDisplay,
            region: regionDisplay,
            subRegion: subRegionDisplay,
            currency: currencyDisplay,
            language: languageDisplay,
            area: areaDisplay,
            density: densityDisplay,
            dominantReligion: extendedInsight.dominantReligion,
            avgPrimePrice: extendedInsight.avgPrimePrice,
            marketMomentum: extendedInsight.marketMomentum,
            riskSignal: extendedInsight.riskSignal,
            highlight: extendedInsight.highlight,
          },
          conversation: conversationPayload,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || 'AI servisi şu anda yanıt veremiyor.');
      }

      const data = await response.json();
      const assistantReply =
        typeof data?.answer === 'string' && data.answer.trim()
          ? data.answer.trim()
          : 'Yanıt oluşturulamadı. Lütfen tekrar deneyin.';

      setInsightMessages(prev =>
        prev.map(message =>
          message.id === pendingMessage.id
            ? { ...message, content: assistantReply, timestamp: new Date().toISOString() }
            : message
        )
      );

      // Save or update current session for the user so it appears in history
      try {
        const userId = getUserId();
        const toSave = [...insightMessages, userMessage, { ...pendingMessage, content: assistantReply, timestamp: new Date().toISOString() }];
        const resSession = await fetch('/api/ai/sessions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': userId,
            'x-user-name': user?.name || 'Anonymous',
            'x-user-email': user?.email || '',
          },
          body: JSON.stringify({ id: activeSessionId, title: selectedCountry?.name ? `${selectedCountry.name} - Sohbet` : undefined, messages: toSave }),
        });

        if (resSession.ok) {
          const json = await resSession.json();
          setActiveSessionId(json.session?.id || activeSessionId);
          // Make sure list is up to date
          setSessions(prev => {
            const updated = prev.filter(s => s.id !== json.session.id);
            return [json.session, ...updated];
          });
        }
      } catch (err) {
        // ignore session save errors
      }
    } catch (error) {
      console.error('Insight assistant error:', error);
      const fallbackMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Beklenmeyen bir hata oluştu.';
      setInsightError(fallbackMessage);
      setInsightMessages(prev =>
        prev.map(message =>
          message.id === pendingMessage.id
            ? {
                ...message,
                content: 'Şu anda yanıt veremiyorum. Lütfen biraz sonra tekrar deneyin.',
                timestamp: new Date().toISOString(),
              }
            : message
        )
      );
        // Save the conversation even on fallback so we keep the user's message
        try {
          const userId = getUserId();
          const toSaveFallback = [...insightMessages, userMessage, { ...pendingMessage, content: 'Şu anda yanıt veremiyorum. Lütfen biraz sonra tekrar deneyin.', timestamp: new Date().toISOString() }];
          await fetch('/api/ai/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId,
              'x-user-name': user?.name || 'Anonymous',
              'x-user-email': user?.email || '',
            },
            body: JSON.stringify({ id: activeSessionId, title: selectedCountry?.name ? `${selectedCountry.name} - Sohbet` : undefined, messages: toSaveFallback }),
          });
        } catch (err) {
          // ignore save errors
        }
    } finally {
      setIsInsightLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50 via-white to-orange-50 overflow-auto"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
        paddingBottom: 'env(safe-area-inset-bottom)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Background image layer - Optimized GPU Accelerated Transitions */}
      <div className="fixed inset-0 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-slate-900">
          <AnimatePresence initial={false}>
            <motion.div
              key={activeBackground}
              className="absolute inset-0 pointer-events-none"
              style={{ willChange: 'opacity' }}
              initial={{ 
                opacity: 0,
              }}
              animate={{ 
                opacity: 1, 
              }}
              exit={{ 
                opacity: 0,
              }}
              transition={{
                duration: 1.2, // Daha hızlı geçiş
                ease: 'easeInOut',
              }}
            >
              {/* Ken Burns efekti - GPU accelerated, daha az hareket */}
              <motion.div
                className="relative h-full w-full"
                style={{ willChange: 'transform' }}
                animate={isCoarsePointer ? {
                  scale: [1, 1.02, 1.01],
                  x: [0, -2, -1],
                  y: [0, -1.5, -0.5]
                } : {
                  scale: [1, 1.05, 1.03],
                  x: [0, -10, -5],
                  y: [0, -5, -2]
                }}
                transition={{
                  duration: isCoarsePointer ? 20 : 24, // Daha yavaş hareket - daha az GPU kullanımı
                  repeat: Infinity,
                  ease: 'linear',
                  times: [0, 0.5, 1]
                }}
              >
                <Image
                  src={activeBackground}
                  alt="IREMWORLD portal arka plan"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="100vw"
                  quality={isCoarsePointer ? 75 : 85} // Mobilde daha düşük kalite
                  loading="eager"
                />
              </motion.div>
              
              {/* Gradient overlays - GPU accelerated */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/35 via-transparent to-slate-900/45" style={{ willChange: 'auto' }} />
              <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-slate-900/70 via-slate-900/30 to-transparent" style={{ willChange: 'auto' }} />
              <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-900/80 via-slate-900/35 to-transparent" style={{ willChange: 'auto' }} />
              

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Header - Minimal modern header - Mobil Uyumlu */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-20 bg-transparent"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="container mx-auto px-3 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo - Mobil optimize */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer flex-shrink-0"
              onClick={() => setActivePanel('portal')}
            >
              <Image
                src="/images/kurumsal-logo/iremworld-logo.png"
                alt="IREMWORLD Logo"
                width={140}
                height={42}
                className="h-8 sm:h-12 w-auto opacity-90 hover:opacity-100 transition-opacity"
                priority
              />
            </motion.div>
            
            {/* Action Buttons - Mobil optimize */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/contact')}
                className="px-3 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#f07f38] to-[#ff8c4a] hover:from-[#ff8c4a] hover:to-[#ff9a5c] text-white rounded-full transition-all font-medium shadow-lg shadow-[#f07f38]/25 hover:shadow-xl hover:shadow-[#f07f38]/35 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden xs:inline">İletişim</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

    <div 
      ref={portalRootRef} 
      className={`relative z-10 min-h-screen flex ${activePanel !== 'portal' ? 'items-center justify-center px-3 sm:px-4 pt-0 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] mt-[4rem] md:mt-[5rem]' : 'flex-col items-center justify-center px-3 sm:px-4 pt-16 sm:pt-20'} pb-20 sm:pb-16`}
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 4rem)'
      }}
      onClick={(e) => {
        // Eğer tıklanan element ana container ise (boş alan) ve panel açıksa, portala dön
        if (e.target === portalRootRef.current && activePanel !== 'portal') {
          setActivePanel('portal');
        }
      }}
    >
        <AnimatePresence mode="wait">
          {activePanel === 'portal' && (
            <motion.div
              key="portal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-3 sm:px-4 md:px-6"
              >
                <div className="relative inline-block mb-3 sm:mb-4 md:mb-6">
                  {/* Beyaz backlight - arkadan ışık vurması efekti */}
                  <div className="absolute inset-0 -inset-x-20 -inset-y-12 pointer-events-none">
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 30%, transparent 70%)',
                        filter: 'blur(40px)'
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 0.8, 0.6]
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(ellipse 70% 90% at 50% 50%, rgba(255, 255, 255, 0.3) 0%, rgba(240, 250, 255, 0.15) 40%, transparent 70%)',
                        filter: 'blur(50px)'
                      }}
                      animate={{
                        scale: [1.05, 1.15, 1.05],
                        opacity: [0.5, 0.7, 0.5]
                      }}
                      transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1
                      }}
                    />
                  </div>
                  
                  {/* Rüya gibi yıldız tozu kümesi - CSS animasyon (GPU accelerated) */}
                  <div className="absolute inset-0 -inset-x-32 -inset-y-16 pointer-events-none overflow-visible">
                    <style jsx>{`
                      @keyframes starFloat {
                        0%, 100% { opacity: 0; transform: translate3d(0, 0, 0) scale(0); }
                        25% { opacity: 0.8; transform: translate3d(var(--tx1), -20px, 0) scale(1.2); }
                        50% { opacity: 0.3; transform: translate3d(var(--tx2), -10px, 0) scale(0.8); }
                        75% { opacity: 0.9; transform: translate3d(var(--tx3), -30px, 0) scale(1.3); }
                      }
                      @keyframes sparkle {
                        0%, 100% { opacity: 0; transform: scale(0); }
                        25%, 75% { opacity: 1; transform: scale(1.2); }
                        50% { opacity: 0.5; transform: scale(0.8); }
                      }
                      .star-particle {
                        will-change: transform, opacity;
                        transform: translate3d(0, 0, 0);
                      }
                    `}</style>
                    {/* Büyük yıldız parçacıkları - CSS animasyonlu */}
                    {[...Array(starConfig.big)].map((_, i) => {
                      const randomX = Math.random() * 100;
                      const randomY = Math.random() * 100;
                      const randomDelay = Math.random() * 5;
                      const randomDuration = 3 + Math.random() * 4;
                      const randomSize = 2 + Math.random() * 4;
                      const tx1 = Math.sin(i) * 10;
                      const tx2 = Math.cos(i) * 8;
                      const tx3 = Math.sin(i) * 15;
                      
                      return (
                        <div
                          key={`star-${i}`}
                          className="absolute rounded-full bg-white star-particle"
                          style={{
                            width: `${randomSize}px`,
                            height: `${randomSize}px`,
                            left: `${randomX}%`,
                            top: `${randomY}%`,
                            filter: 'blur(1px)',
                            boxShadow: '0 0 8px rgba(255, 255, 255, 0.8), 0 0 12px rgba(240, 127, 56, 0.4)',
                            animation: `starFloat ${randomDuration}s ease-in-out ${randomDelay}s infinite`,
                            ['--tx1' as any]: `${tx1}px`,
                            ['--tx2' as any]: `${tx2}px`,
                            ['--tx3' as any]: `${tx3}px`,
                          }}
                        />
                      );
                    })}
                    
                    {/* Küçük ışıltılı noktalar - CSS animasyonlu */}
                    {[...Array(starConfig.small)].map((_, i) => {
                      const randomX = Math.random() * 100;
                      const randomY = Math.random() * 100;
                      const randomDelay = Math.random() * 6;
                      const randomDuration = 2 + Math.random() * 3;
                      
                      return (
                        <div
                          key={`sparkle-${i}`}
                          className="absolute w-1 h-1 rounded-full bg-gradient-to-br from-white via-orange-200 to-orange-300 star-particle"
                          style={{
                            left: `${randomX}%`,
                            top: `${randomY}%`,
                            filter: 'blur(0.5px)',
                            boxShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
                            animation: `sparkle ${randomDuration}s ease-in-out ${randomDelay}s infinite`
                          }}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Arka plan glow efekti */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f07f38]/20 via-[#ff8c4a]/30 to-[#f07f38]/20 blur-3xl opacity-0 animate-pulse" 
                       style={{ animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} 
                  />
                  
                  <h1
                    ref={titleRef}
                    className="relative text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent px-2 sm:px-4 leading-tight"
                    style={{ 
                      fontFamily: 'Dancing Script, cursive', 
                      fontWeight: 700,
                      textShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      WebkitTextStroke: '0.5px rgba(17, 24, 39, 0.1)',
                      lineHeight: '1.3'
                    }}
                  >
                    {displayedTitle}
                    {showCursor && (
                      <span className="inline-block w-0.5 sm:w-1 h-6 xs:h-8 sm:h-10 md:h-14 lg:h-16 xl:h-20 bg-gradient-to-b from-[#f07f38] to-[#ff8c4a] ml-0.5 sm:ml-1 animate-pulse" 
                            style={{ animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                      />
                    )}
                  </h1>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="relative inline-block max-w-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f07f38]/10 to-transparent blur-xl" />
                  <p className="relative text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-light tracking-wide px-3 sm:px-4 md:px-6 bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 bg-clip-text text-transparent leading-relaxed">
                    Premium Gayrimenkul Platformu
                  </p>
                </motion.div>
                
                {/* Biz Kimiz Button - Mobil Uyumlu */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  onClick={() => setIsAboutUsOpen(true)}
                  className="mt-4 sm:mt-6 md:mt-8 px-4 xs:px-5 sm:px-6 md:px-8 py-2.5 xs:py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-[#f07f38] to-[#ff8c4a] text-white font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 mx-auto group text-xs xs:text-sm sm:text-base"
                >
                  <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="whitespace-nowrap">Biz Kimiz?</span>
                </motion.button>
              </motion.div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-7xl mx-auto mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-3 sm:px-4 md:px-6 mt-0"
              >
                <motion.div
                  onMouseEnter={() => handleCardHover('shop', true)}
                  onMouseLeave={() => handleCardHover('shop', false)}
                  className="relative group cursor-pointer h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f07f38]/40 rounded-xl"
                  onClick={() => setActivePanel('shop')}
                  whileTap={isCoarsePointer ? { scale: 0.985 } : undefined}
                  role="button"
                  aria-label="Portföy Keşfet panelini aç"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActivePanel('shop'); } }}
                >
                  <div
                    ref={shopCardRef}
                    className="relative bg-gradient-to-br from-white to-orange-50/60 md:backdrop-blur-2xl border border-[#ffe1ce] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 overflow-hidden shadow-lg md:shadow-xl transition-all duration-500 h-full flex flex-col min-h-[200px] xs:min-h-[220px] sm:min-h-[240px] md:min-h-[400px]"
                    style={{ opacity: 1 }}
                  >
                    <div
                      ref={shopOverlayRef}
                      className="absolute inset-0 bg-gradient-to-br from-[#f07f38]/10 via-[#ffb37e]/15 to-[#ffe7d3]/35 opacity-0"
                      style={{ pointerEvents: 'none' }}
                    />
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Mobilde yatay (icon+title), PC'de dikey */}
                      <div className="md:flex md:flex-col">
                        <div className="flex md:block items-center md:items-start gap-3 md:gap-0 mb-2 sm:mb-3 md:mb-0">
                          <div className="portal-card-icon w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#f07f38] to-[#ff8c4a] rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center md:mb-6 shadow-lg shadow-[#f07f38]/30 flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0 md:w-full">
                            <span className="block text-[0.6rem] xs:text-[0.65rem] sm:text-xs font-semibold uppercase tracking-[0.15em] xs:tracking-[0.2em] sm:tracking-[0.25em] text-[#f07f38] mb-0.5 md:mb-3 leading-[1.7]">
                              {shopModeMeta[shopMode].label}
                            </span>
                            <h2 className="portal-card-headline text-lg xs:text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-0 md:mb-2 tracking-tight leading-[1.7]">
                              Portföy Keşfet
                            </h2>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs xs:text-sm sm:text-base mb-2 xs:mb-2.5 sm:mb-3 md:mb-6 font-light leading-[1.7] md:flex-grow">
                        {shopModeMeta[shopMode].description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1.5 xs:mb-2 sm:mb-2 md:mb-6">
                        {shopCardTags[shopMode].map(tag => (
                          <span
                            key={tag}
                            className="portal-card-badge px-1.5 xs:px-2 sm:px-3 py-0.5 sm:py-1 bg-[#fff0e5] text-[#f07f38] rounded-full text-[0.6rem] xs:text-[0.65rem] sm:text-xs font-medium whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div
                        ref={shopCtaRef}
                        className="inline-flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-[#f07f38] font-medium text-xs xs:text-sm sm:text-base mt-auto"
                      >
                        <span>{shopModeMeta[shopMode].ctaLabel}</span>
                        <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  onMouseEnter={() => handleCardHover('consultant', true)}
                  onMouseLeave={() => handleCardHover('consultant', false)}
                  className="relative group cursor-pointer h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f07f38]/40 rounded-xl"
                  onClick={() => setActivePanel('consultant')}
                  whileTap={isCoarsePointer ? { scale: 0.985 } : undefined}
                  role="button"
                  aria-label="Danışman Ara panelini aç"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActivePanel('consultant'); } }}
                >
                  <div
                    ref={consultantCardRef}
                    className="relative bg-gradient-to-br from-white via-[#fff6ef] to-[#ffe3cf] border border-[#ffd7ba] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 overflow-hidden shadow-lg md:shadow-xl transition-all duration-500 h-full flex flex-col min-h-[200px] xs:min-h-[220px] sm:min-h-[240px] md:min-h-[400px]"
                    style={{ opacity: 1 }}
                  >
                    <div
                      ref={consultantOverlayRef}
                      className="absolute inset-0 bg-gradient-to-br from-[#f07f38]/8 via-[#ffb37e]/18 to-[#ffe6d2]/40 opacity-0"
                      style={{ pointerEvents: 'none' }}
                    />
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Mobilde yatay (icon+title), PC'de dikey */}
                      <div className="md:flex md:flex-col">
                        <div className="flex md:block items-center md:items-start gap-3 md:gap-0 mb-2 sm:mb-3 md:mb-0">
                          <div className="portal-card-icon w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#f07f38] to-[#ff9a5c] rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center md:mb-6 shadow-lg shadow-[#f07f38]/20 flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4s-3 1.567-3 3.5S10.343 11 12 11zM5.5 20a6.5 6.5 0 0113 0" />
                            </svg>
                          </div>
                          <div className="min-w-0 md:w-full">
                            <p className="portal-card-badge text-[0.6rem] xs:text-[0.65rem] sm:text-xs uppercase tracking-[0.1em] xs:tracking-[0.15em] sm:tracking-[0.2em] text-[#f07f38] mb-0.5 md:mb-3 font-semibold leading-[1.7]">
                              PROFESYONEL AĞ
                            </p>
                            <h2 className="portal-card-headline text-lg xs:text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-0 md:mb-2 tracking-tight leading-[1.7]">
                              Danışman Ara
                            </h2>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs xs:text-sm sm:text-base mb-2 xs:mb-2.5 sm:mb-3 md:mb-6 font-light leading-[1.7] md:flex-grow">
                        Avukat, mali müşavir, mimar ve daha fazlasına tek tıkla ulaşın
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1.5 xs:mb-2 sm:mb-2 md:mb-6">
                        {['Hukuk', 'Finans', 'Teknik', 'Analiz'].map(tag => (
                          <span
                            key={tag}
                            className="portal-card-badge px-1.5 xs:px-2 sm:px-3 py-0.5 sm:py-1 bg-[#fff0e5] text-[#f07f38] rounded-full text-[0.6rem] xs:text-[0.65rem] sm:text-xs font-medium whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div
                        ref={consultantCtaRef}
                        className="inline-flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-[#f07f38] font-medium text-xs xs:text-sm sm:text-base mt-auto"
                      >
                        <span>Uzman bul</span>
                        <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  onMouseEnter={() => handleCardHover('insight', true)}
                  onMouseLeave={() => handleCardHover('insight', false)}
                  className="relative group cursor-pointer h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f07f38]/40 rounded-xl"
                  onClick={() => setActivePanel('insight')}
                  whileTap={isCoarsePointer ? { scale: 0.985 } : undefined}
                  role="button"
                  aria-label="AI'dan Yardım panelini aç"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActivePanel('insight'); } }}
                >
                  <div
                    ref={insightCardRef}
                    className="relative bg-gradient-to-br from-white via-[#fff5ed] to-[#ffe3cf] border border-[#ffd7ba] rounded-xl sm:rounded-2xl md:rounded-3xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 overflow-hidden shadow-lg md:shadow-xl transition-all duration-500 h-full flex flex-col min-h-[200px] xs:min-h-[220px] sm:min-h-[240px] md:min-h-[400px]"
                    style={{ opacity: 1 }}
                  >
                    <div
                      ref={insightOverlayRef}
                      className="absolute inset-0 bg-gradient-to-br from-[#f07f38]/10 via-[#ffb37e]/18 to-[#ffe6d2]/45 opacity-0"
                      style={{ pointerEvents: 'none' }}
                    />
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Mobilde yatay (icon+title), PC'de dikey */}
                      <div className="md:flex md:flex-col">
                        <div className="flex md:block items-center md:items-start gap-3 md:gap-0 mb-2 sm:mb-3 md:mb-0">
                          <div className="portal-card-icon w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-[#f07f38] to-[#ff8c4a] rounded-xl sm:rounded-2xl flex items-center justify-center md:mb-6 shadow-lg shadow-[#f07f38]/25 flex-shrink-0">
                            <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4" />
                            </svg>
                          </div>
                          <div className="min-w-0 md:w-full">
                            <span className="block text-[0.6rem] xs:text-[0.65rem] sm:text-xs font-semibold uppercase tracking-[0.15em] xs:tracking-[0.2em] sm:tracking-[0.25em] text-[#f07f38] mb-0.5 md:mb-3 leading-[1.7]">
                              AI Asistan
                            </span>
                            <h2 className="portal-card-headline text-lg xs:text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-0 md:mb-2 tracking-tight leading-[1.7]">
                              AI’dan Yardım Alın
                            </h2>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs xs:text-sm sm:text-base mb-2 xs:mb-2.5 sm:mb-3 md:mb-6 font-light leading-[1.7] md:flex-grow">
                        AI’ya soru sorun, yatırım fırsatları ve yaşam kalitesi hakkında bilgi alın
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-1.5 xs:mb-2 sm:mb-2 md:mb-6">
                        <span className="portal-card-badge inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-[#fff0e5] text-[#f07f38] rounded-full text-[0.65rem] sm:text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Yatırım Bölgeleri
                        </span>
                        <span className="portal-card-badge inline-flex items-center gap-1 px-1.5 xs:px-2 sm:px-3 py-0.5 sm:py-1 bg-[#fff0e5] text-[#f07f38] rounded-full text-[0.6rem] xs:text-[0.65rem] sm:text-xs font-medium whitespace-nowrap">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Vergi Sistemi
                        </span>
                        <span className="portal-card-badge inline-flex items-center gap-1 px-1.5 xs:px-2 sm:px-3 py-0.5 sm:py-1 bg-[#fff0e5] text-[#f07f38] rounded-full text-[0.6rem] xs:text-[0.65rem] sm:text-xs font-medium whitespace-nowrap">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Yaşam Kalitesi
                        </span>
                      </div>
                      <div
                        ref={insightCtaRef}
                        className="inline-flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-[#f07f38] font-medium text-xs xs:text-sm sm:text-base mt-auto"
                      >
                        <span className="hidden xs:inline">Bilgi merkezine gir</span>
                        <span className="xs:hidden">Bilgi Merkezi</span>
                        <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activePanel === 'shop' && (
            <motion.div
              key="shop-search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: -12 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[92vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
              ref={shopPanelRef}
            >
              <div 
                className="bg-white/85 backdrop-blur-2xl border border-gray-200/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl flex flex-col min-h-0 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-5 sm:mb-6 md:mb-8"
                  data-anim="shop-heading"
                >
                  <p className="text-[0.65rem] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] text-[#f07f38] mb-2 sm:mb-3">
                    {shopModeMeta[shopMode].subtitle}
                  </p>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2 sm:mb-3 tracking-tight leading-[1.7]">
                    {shopModeMeta[shopMode].label}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg font-light">
                    {shopModeMeta[shopMode].description}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 sm:mb-5 md:mb-6 relative z-40"
                  data-anim="shop-country"
                >
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Odak Bölge</label>
                  <CountrySelector selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-4 sm:mb-5 md:mb-6"
                  data-anim="shop-categories"
                >
                  <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Ana Kategori</label>
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#f07f38]">
                      3 seçenek
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {shopCategoryOptions[shopMode].map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + index * 0.05 }}
                        onClick={() => {
                          setSelectedShopCategory(category.id);
                          setSelectedSubCategory('');
                        }}
                        className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer ${
                          selectedShopCategory === category.id
                            ? 'bg-gradient-to-br from-[#f07f38] to-[#ff8c4a] text-white shadow-lg shadow-[#f07f38]/30'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${
                            selectedShopCategory === category.id ? 'bg-white/20' : 'bg-white'
                          }`}>
                            <svg className={`w-6 h-6 sm:w-7 sm:h-7 ${selectedShopCategory === category.id ? 'text-white' : 'text-[#f07f38]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <h3 className={`text-sm sm:text-base md:text-lg font-bold mb-1 ${selectedShopCategory === category.id ? 'text-white' : 'text-gray-900'}`}>
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className={`text-[10px] sm:text-xs ${selectedShopCategory === category.id ? 'text-white/80' : 'text-gray-500'}`}>
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Alt Kategoriler */}
                {(() => {
                  const currentCategory = shopCategoryOptions[shopMode].find(c => c.id === selectedShopCategory);
                  return currentCategory?.children && currentCategory.children.length > 0;
                })() && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mb-5 sm:mb-6 md:mb-8"
                    data-anim="subcategories"
                  >
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">{
                      (() => {
                        const currentCategory = shopCategoryOptions[shopMode].find(c => c.id === selectedShopCategory);
                        if (!currentCategory) return 'Alt Kategori';
                        if (currentCategory.name === 'Devlet') return 'Kamu Türü';
                        if (currentCategory.name === 'Yatırım Projeleri' || currentCategory.id === 'investment') return 'Yatırım Türü';
                        if (currentCategory.name === 'Real Estate' || currentCategory.id === 'realestate') return 'Gayrimenkul Türü';
                        return 'Alt Kategori';
                      })()
                    }</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {(() => {
                        const currentCategory = shopCategoryOptions[shopMode].find(c => c.id === selectedShopCategory);
                        return currentCategory?.children || [];
                      })().map((subCat, index) => (
                        <motion.button
                          key={subCat.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + index * 0.03 }}
                          onClick={() => setSelectedSubCategory(subCat.id)}
                          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 text-center ${
                            selectedSubCategory === subCat.id
                              ? 'bg-gray-900 text-white shadow-lg'
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${selectedSubCategory === subCat.id ? 'text-white' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={subCat.icon} />
                            </svg>
                            <p className="font-medium text-[10px] sm:text-xs leading-tight">{subCat.name}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Satılık/Kiralık Seçimi - Sadece Real Estate Kategorisinde */}
                {selectedShopCategory === 'realestate' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.44 }}
                    className="mb-5 sm:mb-6 md:mb-8"
                    data-anim="transaction-type"
                  >
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">İşlem Türü</label>
                    <div className="relative bg-gray-100/80 rounded-2xl p-1.5 inline-flex w-full">
                      <motion.button
                        onClick={() => setSelectedTransactionType('sale')}
                        className={`relative flex-1 px-4 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                          selectedTransactionType === 'sale'
                            ? 'text-white z-10'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Satılık
                        </span>
                      </motion.button>
                      <motion.button
                        onClick={() => setSelectedTransactionType('rent')}
                        className={`relative flex-1 px-4 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                          selectedTransactionType === 'rent'
                            ? 'text-white z-10'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Kiralık
                        </span>
                      </motion.button>
                      <motion.div
                        className="absolute top-1.5 bottom-1.5 left-1.5 bg-gradient-to-br from-[#f07f38] to-[#ff8c4a] rounded-xl shadow-lg shadow-[#f07f38]/30"
                        initial={false}
                        animate={{
                          x: selectedTransactionType === 'sale' ? 0 : '100%',
                          width: 'calc(50% - 6px)',
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                <div className="mt-auto w-full">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.52 }}
                  onClick={handleShopSearch}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-[#f07f38] to-[#ff8c4a] hover:from-[#ff8c4a] hover:to-[#ff9a5c] text-white font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg shadow-[#f07f38]/30 hover:shadow-xl hover:shadow-[#f07f38]/40 mb-2 sm:mb-3"
                  data-anim="shop-cta"
                >
                  {selectedShopCategory === 'government' ? 'Projeleri Keşfet' : shopModeMeta[shopMode].ctaLabel}
                </motion.button>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => setActivePanel('portal')}
                  className="w-full py-2.5 sm:py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-gray-50"
                  data-anim="shop-cta"
                >
                  ← Geri
                </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activePanel === 'insight' && (
            <motion.div
              key="insight-country"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: -12 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[92vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
              ref={insightPanelRef}
            >
              <div 
                className="bg-white border border-gray-200 rounded-xl xs:rounded-2xl sm:rounded-3xl p-3 xs:p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl max-h-[90vh] overflow-y-auto min-h-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Başlık */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-4 xs:mb-5 sm:mb-6 md:mb-8"
                  data-anim="insight-heading"
                >
                  <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight mb-1.5 xs:mb-2 sm:mb-3">
                    AI’ya Sor
                  </h1>
                  <p className="text-gray-600 text-xs xs:text-sm sm:text-base md:text-lg font-light">
                    Seçtiğiniz ülke hakkında merak ettiklerinizi yapay zekaya sorun.
                  </p>
                  {/* Session selector removed: using left sidebar instead */}
                </motion.div>

                {/* Ülke Seçimi */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 xs:mb-5 sm:mb-6 relative z-40"
                  data-anim="insight-selector">
                  <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-2 xs:mb-2.5 sm:mb-3">Ülke Seçin</label>
                  <CountrySelector selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
                </motion.div>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Sidebar: sessions */}
                  <aside className="w-full md:w-60 hidden md:block md:sticky md:top-20 md:self-start">
                    <div className="bg-white border border-gray-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold">Sohbet Geçmişi</h4>
                        <button
                          onClick={async () => {
                            // start a fresh chat
                            setActiveSessionId(null);
                            setInsightMessages([
                              {
                                id: 'welcome',
                                role: 'assistant',
                                content:
                                  "Ben IREMWORLD'ün yapay zeka asistanıyım. Seçtiğiniz ülke hakkında gayrimenkul, yatırım ve yaşam bilgileri için sorularınızı yanıtlamaya hazırım.",
                                timestamp: new Date().toISOString(),
                              },
                            ]);
                          }}
                          className="text-xs px-2 py-1 rounded bg-orange-50 text-orange-600"
                        >
                          Yeni Sohbet
                        </button>
                      </div>
                      <div className="space-y-2 max-h-[44vh] sm:max-h-[52vh] md:max-h-[65vh] overflow-y-auto">
                        {sessions.length === 0 && (
                          <div className="text-xs text-gray-500">Henüz sohbet yok</div>
                        )}
                        {sessions.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setActiveSessionId(s.id);
                              setInsightMessages(
                                s.messages.map((m) => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content, timestamp: m.timestamp }))
                              );
                            }}
                            className={`w-full text-left p-2 rounded-md hover:bg-gray-50 ${activeSessionId === s.id ? 'bg-gray-100' : ''}`}
                          >
                            <div className="text-sm font-medium">{s.title}</div>
                            <div className="text-[0.7rem] text-gray-500">{new Date(s.updatedAt).toLocaleString()}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </aside>

                  {/* Mobile sessions drawer (overlay) */}
                  {isSessionsDrawerOpen && (
                    <div className="fixed inset-0 z-50 md:hidden">
                      <div className="absolute inset-0 bg-black/40" onClick={() => setIsSessionsDrawerOpen(false)} aria-hidden />
                      <aside className="absolute left-0 top-0 bottom-0 w-full sm:w-80 bg-white p-4 shadow-2xl overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold">Sohbet Geçmişi</h4>
                          <button onClick={() => setIsSessionsDrawerOpen(false)} className="text-gray-600 px-2 py-1 rounded bg-gray-100">Kapat</button>
                        </div>
                        <div className="space-y-2">
                          {sessions.length === 0 && (
                            <div className="text-xs text-gray-500">Henüz sohbet yok</div>
                          )}
                          {sessions.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setActiveSessionId(s.id);
                                setInsightMessages(
                                  s.messages.map((m) => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content, timestamp: m.timestamp }))
                                );
                                setIsSessionsDrawerOpen(false);
                              }}
                              className={`w-full text-left p-2 rounded-md hover:bg-gray-50 ${activeSessionId === s.id ? 'bg-gray-100' : ''}`}
                            >
                              <div className="text-sm font-medium">{s.title}</div>
                              <div className="text-xs text-gray-500">{new Date(s.updatedAt).toLocaleString()}</div>
                            </button>
                          ))}
                        </div>
                      </aside>
                    </div>
                  )}

                  {/* AI Sohbet Alanı */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl xs:rounded-2xl border border-gray-200 p-3 xs:p-4 sm:p-5 md:p-6 flex-1 min-w-0 flex flex-col"
                  data-anim="insight-chat"
                >
                  <div className="flex items-center gap-2 xs:gap-2.5 mb-3 xs:mb-4">
                    <div className="flex h-7 w-7 xs:h-8 xs:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f07f38] to-[#ff8c4a]">
                      <svg className="w-4 h-4 xs:w-5 xs:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900">AI Asistan</h3>
                      <p className="text-[10px] xs:text-xs sm:text-sm text-gray-500">
                        {selectedCountry?.name || 'Seçilen ülke'} hakkında soru sorun
                      </p>
                    </div>
                    {/* Mobile: open sessions drawer */}
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={() => {
                          if (confirm('Sohbet geçmişini temizlemek istediğinizden emin misiniz?')) {
                            setInsightMessages([{
                              id: 'welcome',
                              role: 'assistant',
                              content: "Ben IREMWORLD'ün yapay zeka asistanıyım. Seçtiğiniz ülke hakkında gayrimenkul, yatırım ve yaşam bilgileri için sorularınızı yanıtlamaya hazırım.",
                              timestamp: new Date().toISOString(),
                            }]);
                            localStorage.removeItem('irem_ai_chat_history');
                          }
                        }}
                        className="px-3 py-1 rounded bg-red-50 text-sm text-red-600 hover:bg-red-100"
                        aria-label="Geçmişi Temizle"
                        title="Sohbet geçmişini temizle"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsSessionsDrawerOpen(true)}
                        className="md:hidden px-3 py-1 rounded bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                        aria-label="Sohbetleri Aç"
                      >
                        Sohbetler
                      </button>
                    </div>
                  </div>

                  {/* Mesaj Listesi */}
                  <div
                    ref={insightChatScrollerRef}
                    className="flex-1 overflow-y-auto space-y-2 xs:space-y-2.5 sm:space-y-3 mb-3 xs:mb-4 pr-1 xs:pr-2"
                  >
                    {insightMessages.map(message => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl xs:rounded-2xl px-2.5 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 shadow-sm ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-[#f07f38] to-[#ff8c4a] text-white'
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}
                        >
                          <div className="text-[9px] xs:text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-0.5 xs:mb-1">
                            {message.role === 'user' ? 'Siz' : 'AI Asistan'}
                          </div>
                          <p className="text-xs xs:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mesaj Gönder Formu */}
                  <form onSubmit={handleInsightMessageSubmit} className="space-y-2 xs:space-y-2.5 sm:space-y-3 mt-auto">
                    <div className="flex flex-col xs:flex-row gap-2 min-w-0">
                      <input
                        type="text"
                        value={insightInput}
                        onChange={event => setInsightInput(event.target.value)}
                        placeholder={`${selectedCountry?.name || 'Ülke'} hakkında ne öğrenmek istersiniz?`}
                        className="flex-1 min-w-0 rounded-lg xs:rounded-xl border border-gray-200 bg-white px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f07f38]/40 focus:border-[#f07f38]"
                      />
                      <button
                        type="submit"
                        disabled={!canSendInsight}
                        className={`rounded-lg xs:rounded-xl px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 text-xs xs:text-sm font-semibold transition-all duration-200 ${
                          canSendInsight
                            ? 'bg-gradient-to-r from-[#f07f38] to-[#ff8c4a] text-white shadow-lg shadow-[#f07f38]/25 hover:from-[#ff8c4a] hover:to-[#ff9a5c]'
                            : 'cursor-not-allowed bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isInsightLoading ? 'Yanıt bekleniyor…' : 'Gönder'}
                      </button>
                    </div>
                    {insightError && (
                      <p className="text-[10px] xs:text-xs text-red-500 text-center">
                        {insightError}
                      </p>
                    )}
                    <p className="text-[10px] xs:text-xs text-gray-400 text-center">
                      Yanıtlar OpenAI tarafından gerçek zamanlı hazırlanır
                    </p>
                  </form>

                  {/* Örnek Sorular */}
                  <div className="mt-4 xs:mt-5 sm:mt-6">
                    <p className="text-xs xs:text-sm font-medium text-gray-700 mb-2 xs:mb-3">
                      Örnek Sorular:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setInsightInput(`${selectedCountry?.name || 'Bu ülke'}'de gayrimenkul yatırımı yapmak için en iyi bölgeler neresi?`)}
                        className="inline-flex items-center gap-1.5 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm rounded-full border border-[#ffd7ba] bg-[#fff7f2] text-[#f07f38] hover:bg-[#ffede1] hover:border-[#ffc59a] transition-all duration-200"
                      >
                        <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Yatırım Bölgeleri
                      </button>
                      <button
                        type="button"
                        onClick={() => setInsightInput(`${selectedCountry?.name || 'Bu ülke'}'de nüfus kaç?`)}
                        className="inline-flex items-center gap-1.5 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm rounded-full border border-[#ffd7ba] bg-[#fff7f2] text-[#f07f38] hover:bg-[#ffede1] hover:border-[#ffc59a] transition-all duration-200"
                      >
                        Nüfus
                      </button>
                      <button
                        type="button"
                        onClick={() => setInsightInput(`${selectedCountry?.name || 'Bu ülke'}'de din ve kültür hakkında bilgi ver`)}
                        className="inline-flex items-center gap-1.5 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm rounded-full border border-[#ffd7ba] bg-[#fff7f2] text-[#f07f38] hover:bg-[#ffede1] hover:border-[#ffc59a] transition-all duration-200"
                      >
                        Din / Kültür
                      </button>
                      <button
                        type="button"
                        onClick={() => setInsightInput(`${selectedCountry?.name || 'Bu ülke'}'de mortgage ve kredi koşulları nasıldır?`)}
                        className="inline-flex items-center gap-1.5 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm rounded-full border border-[#ffd7ba] bg-[#fff7f2] text-[#f07f38] hover:bg-[#ffede1] hover:border-[#ffc59a] transition-all duration-200"
                      >
                        İpotek / Mortgage
                      </button>
                      <button
                        type="button"
                        onClick={() => setInsightInput(`${selectedCountry?.name || 'Bu ülke'}'deki kira fiyatları ve kiralar hakkında bilgi ver`)}
                        className="inline-flex items-center gap-1.5 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm rounded-full border border-[#ffd7ba] bg-[#fff7f2] text-[#f07f38] hover:bg-[#ffede1] hover:border-[#ffc59a] transition-all duration-200"
                      >
                        Kira Fiyatları
                      </button>
                      <button
                        type="button"
                        onClick={() => setInsightInput(`${selectedCountry?.name || 'Bu ülke'}'deki vergi sistemi nasıl?`)}
                        className="inline-flex items-center gap-1.5 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm rounded-full border border-[#ffd7ba] bg-[#fff7f2] text-[#f07f38] hover:bg-[#ffede1] hover:border-[#ffc59a] transition-all duration-200"
                      >
                        <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Vergi Sistemi
                      </button>
                      <button
                        type="button"
                        onClick={() => setInsightInput(`${selectedCountry?.name || 'Bu ülke'}'de yaşam kalitesi nasıl?`)}
                        className="inline-flex items-center gap-1.5 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 text-[10px] xs:text-xs sm:text-sm rounded-full border border-[#ffd7ba] bg-[#fff7f2] text-[#f07f38] hover:bg-[#ffede1] hover:border-[#ffc59a] transition-all duration-200"
                      >
                        <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Yaşam Kalitesi
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* close the flex container: sidebar + chat */}
                </div>

                {/* Portala Dön Butonu */}
                <div className="flex justify-center mt-4 xs:mt-5 sm:mt-6" data-anim="insight-cta">
                  <button
                    type="button"
                    onClick={() => setActivePanel('portal')}
                    className="px-5 xs:px-6 sm:px-8 md:px-10 py-2 xs:py-2.5 sm:py-3 md:py-3.5 text-xs xs:text-sm sm:text-base font-semibold rounded-full bg-gradient-to-r from-[#f07f38] to-[#ff8c4a] text-white shadow-lg shadow-[#f07f38]/25 hover:from-[#ff8c4a] hover:to-[#ff9a5c] transition-all duration-200"
                  >
                    ← Portala Dön
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activePanel === 'consultant' && (
            <motion.div
              key="consultant-search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: -12 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-4xl"
              ref={consultantPanelRef}
            >
              <div 
                className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl flex flex-col min-h-0 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 sm:mb-8 md:mb-10"
                  data-anim="consultant-heading"
                >
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight mb-2 sm:mb-3">
                    Danışman Bul
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg font-light">
                    Avukat, mali müşavir, mimar ve mühendislerden oluşan global ağımıza ulaşın.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 sm:mb-5 md:mb-6 relative z-40"
                  data-anim="consultant-country"
                >
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Hizmet Bölgesi</label>
                  <CountrySelector selectedCountry={selectedCountry} onSelect={setSelectedCountry} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-5 sm:mb-6 md:mb-8"
                  data-anim="consultant-grid"
                >
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Uzmanlık Alanı</label>
                  {/* Mobilde 2 sütun kare kutular, desktopta mevcut düzen korunur */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-2">
                    {consultantTypes.map((type, index) => (
                      <motion.button
                        key={type.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        onClick={() => setSelectedConsultantType(type.id)}
                        className={`flex flex-col items-start gap-1 rounded-xl sm:rounded-2xl border p-3 sm:p-4 md:p-5 text-left transition-all w-full min-h-[64px] h-auto py-2 md:aspect-auto ${
                          selectedConsultantType === type.id
                            ? 'border-[#f07f38] bg-[#fff0e5] shadow-[0_18px_45px_-30px_rgba(240,127,56,0.45)]'
                            : 'border-gray-200 hover:border-[#f07f38]/60 hover:bg-[#fff7f2]'
                        } consultant-type-item`}
                      >
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">{type.name}</span>
                        <span className="text-[10px] sm:text-xs text-gray-600">{type.summary}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
                {/* Danışmanlar Dinamik Önizleme */}
                <div
                  className="mb-5 sm:mb-6 md:mb-8 rounded-2xl sm:rounded-3xl border border-[#ffd7ba] bg-[#fff7f2] p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm"
                  data-anim="consultant-detail"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div>
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#f07f38]">Danışman Ağı</p>
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Hızlı Önizleme</h3>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {filteredConsultants.length} danışman eşleşti
                    </span>
                  </div>

                  {previewConsultants.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {previewConsultants.map(consultant => (
                        <div key={consultant.id} className="flex items-center gap-3 bg-white/80 border border-white/60 rounded-xl p-3 shadow-sm">
                          <img
                            src={consultant.photo}
                            alt={consultant.name}
                            className="w-12 h-12 rounded-full object-cover border border-[#f07f38]/30"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">{consultant.name}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {consultant.categoryName} · {consultant.countryName}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate">{consultant.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#f07f38]/50 bg-white/60 p-4 text-center">
                      <p className="text-sm font-medium text-gray-800">Bu ülke ve uzmanlık kombinasyonu için hazır danışman bulunamadı.</p>
                      <p className="text-xs text-gray-600 mt-2">
                        Şu ülkelerdeki ağımız aktif: {supportedConsultantCountryNames.join(', ')}. Bu bölgelerden birini seçerek devam edebilirsiniz.
                      </p>
                    </div>
                  )}
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-4">
                    Tüm danışmanları görmek ve iletişime geçmek için “Danışmanları Göster” butonunu kullanın.
                  </p>
                </div>
                <div className="mt-auto w-full">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  onClick={handleConsultantSearch}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-[#f07f38] to-[#ff8c4a] hover:from-[#ff8c4a] hover:to-[#ff9a5c] text-white font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl transition-all duration-300 shadow-[0_24px_65px_-28px_rgba(240,127,56,0.55)] mb-2 sm:mb-3"
                  data-anim="consultant-cta"
                >
                  Danışmanları Göster
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setActivePanel('portal')}
                  className="w-full py-2.5 sm:py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm sm:text-base rounded-xl sm:rounded-2xl hover:bg-gray-50"
                  data-anim="consultant-cta"
                >
                  ← Geri
                </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* About Us Popup */}
      <AboutUsPopup isOpen={isAboutUsOpen} onClose={() => setIsAboutUsOpen(false)} />
    </div>
  );
}
