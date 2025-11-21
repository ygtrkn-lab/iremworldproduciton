'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCountryFlag from 'react-country-flag';

// Silence TypeScript about process env in client code (NEXT_PUBLIC_* variables are injected at build-time)
declare const process: any;

// Google Translate desteklenen diller (ISO country codes ile)
const languages = [
  { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', countryCode: 'TR' },
  { code: 'en', name: 'English', nativeName: 'English', countryCode: 'GB' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', countryCode: 'SA' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', countryCode: 'CN' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', countryCode: 'TW' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', countryCode: 'NL' },
  { code: 'fr', name: 'French', nativeName: 'Français', countryCode: 'FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', countryCode: 'DE' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', countryCode: 'GR' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', countryCode: 'IL' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', countryCode: 'IN' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', countryCode: 'IT' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', countryCode: 'JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', countryCode: 'KR' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', countryCode: 'IR' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', countryCode: 'PL' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', countryCode: 'PT' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', countryCode: 'RU' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', countryCode: 'ES' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', countryCode: 'SE' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', countryCode: 'TH' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', countryCode: 'UA' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', countryCode: 'VN' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', countryCode: 'ZA' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', countryCode: 'AL' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', countryCode: 'ET' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', countryCode: 'AM' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', countryCode: 'AZ' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', countryCode: 'ES' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', countryCode: 'BY' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', countryCode: 'BD' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', countryCode: 'BA' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', countryCode: 'BG' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', countryCode: 'ES' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', countryCode: 'HR' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', countryCode: 'CZ' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', countryCode: 'DK' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', countryCode: 'EE' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', countryCode: 'FI' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', countryCode: 'GE' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', countryCode: 'HU' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', countryCode: 'IS' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', countryCode: 'ID' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', countryCode: 'IE' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', countryCode: 'LV' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', countryCode: 'LT' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', countryCode: 'MK' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', countryCode: 'MY' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', countryCode: 'MT' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', countryCode: 'NO' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', countryCode: 'RO' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', countryCode: 'RS' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', countryCode: 'SK' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', countryCode: 'SI' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', countryCode: 'KE' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', countryCode: 'PH' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', countryCode: 'PK' },
];

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [translateLoaded, setTranslateLoaded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]); // Default: Türkçe
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Google Translate widget'ı: yükleme artık çevre değişkeni ile kontrol edilebilir
  // NEXT_PUBLIC_ENABLE_GOOGLE_TRANSLATE=false ise yüklenmez.
  // We intentionally don't auto-load the external translate script on mount.
  // Loading it on-demand (on open or on language change) avoids unnecessary network
  // load and prevents CSP warnings for customers that don't enable translate.
  const loadTranslateScript = () => {
    if (translateLoaded) return;

    const enabled = typeof window !== 'undefined' && ((process as any)?.env?.NEXT_PUBLIC_ENABLE_GOOGLE_TRANSLATE === 'true');
    if (!enabled) return;

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onload = () => setTranslateLoaded(true);
      script.onerror = () => {
        console.warn('Failed to load google translate script (possibly blocked by CSP).');
      };
      document.body.appendChild(script);
    }

    (window as any).googleTranslateElementInit = function() {
      try {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'tr',
            includedLanguages: languages.map(lang => lang.code).join(','),
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setTranslateLoaded(true);
      } catch (e) {
        console.warn('Google Translate init failed:', e instanceof Error ? e.message : String(e));
      }
    };
  };

  const handleLanguageChange = (language: typeof languages[0]) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    setSearchQuery('');

    // Google Translate'i tetikle
    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = language.code;
      selectElement.dispatchEvent(new Event('change'));
    }
  };

  const filteredLanguages = languages.filter(
    lang =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Google Translate Element (gizli) */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      <div ref={dropdownRef} className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
            onClick={() => {
              const nextOpen = !isOpen;
              setIsOpen(nextOpen);
              if (nextOpen) {
                loadTranslateScript();
              }
            }}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full hover:border-[#f07f38] hover:bg-white transition-all shadow-sm hover:shadow-md"
        >
          <ReactCountryFlag
            countryCode={selectedLanguage.countryCode}
            svg
            style={{
              width: '1.5em',
              height: '1.5em',
              borderRadius: '0.25rem',
            }}
            title={selectedLanguage.countryCode}
          />
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {selectedLanguage.nativeName}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50"
            >
              {/* Search */}
              <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Dil ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#f07f38] focus:ring-2 focus:ring-[#f07f38]/20 text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* If translation is not enabled, show small info */}
              {typeof window !== 'undefined' && ((process as any)?.env?.NEXT_PUBLIC_ENABLE_GOOGLE_TRANSLATE !== 'true') && (
                <div className="px-4 py-2 text-xs text-gray-500">Çeviri aracı devre dışı. Çeviri yüklemek için `NEXT_PUBLIC_ENABLE_GOOGLE_TRANSLATE=true` olarak yapılandırın.</div>
              )}

              {/* Language List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#fff0e5] transition-colors text-left border-b border-gray-50 last:border-b-0 ${
                        selectedLanguage.code === language.code ? 'bg-[#fff7f2]' : ''
                      }`}
                    >
                      <ReactCountryFlag
                        countryCode={language.countryCode}
                        svg
                        style={{
                          width: '1.75em',
                          height: '1.75em',
                          borderRadius: '0.375rem',
                        }}
                        title={language.countryCode}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{language.name}</div>
                        <div className="text-xs text-gray-500">{language.nativeName}</div>
                      </div>
                      {selectedLanguage.code === language.code && (
                        <svg
                          className="w-5 h-5 text-[#f07f38]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="text-sm">Dil bulunamadı</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Google Translate CSS override */}
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        .goog-te-gadget {
          display: none !important;
        }
      `}</style>
    </>
  );
}
