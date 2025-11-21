"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface DropdownItem {
  name: string;
  href: string;
  description?: string;
}

interface MenuItem {
  name: string;
  href?: string;
  items?: DropdownItem[];
}

const menuItems: MenuItem[] = [
  {
    name: "Öne Çıkanlar",
    href: "/featured",
  },
  {
    name: "Danışmanlıklar",
    items: [
      { name: "Avukatlar", href: "/law-partners" },
      { name: "Sigortacılar", href: "/real-estate-insurance" },
      { name: "Teknoloji Danışmanlıkları", href: "/technology-partners" },
      { name: "Vergi Danışmanlıkları", href: "/tax-consulting" },
      { name: "Mimarlar", href: "/engineering-partners" },
      { name: "İç Mimarlar", href: "/interior-design-partners" },
      { name: "Mühendisler", href: "/engineering-consultants" },
      { name: "Ekspertiz", href: "/real-estate-appraisal" },
    ]
  },
  {
    name: "İş Ortakları",
    items: [
      { name: "Proje Sahipleri", href: "/partners/project-owners" },
      { name: "Emlak Ofisleri", href: "/partners/real-estate-offices" },
      { name: "Gayrimenkul Sahipleri", href: "/partners/property-owners" },
      { name: "Kurumlarla İlişkiler", href: "/partners/institutional-relations" },
      { name: "Bankalar", href: "/partners/banks" },
      { name: "GYO'lar", href: "/partners/reits" },
      { name: "Devlet Kurumları", href: "/partners/government-agencies" },
    ]
  },
  {
    name: "Mağazalar",
    href: "/store"
  },
  {
    name: "İletişim",
    href: "/contact"
  },
];

export default function ModernNavbar() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false); // hide header on scroll down
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/for-sale?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      // isScrolled for small effects (bg and blur)
      setIsScrolled(y > 20);
      // hide header on scroll down, show on scroll up (excluding top)
      if (y > 60 && y > lastScrollY) {
        setIsHidden(true);
      } else if (y < lastScrollY) {
        setIsHidden(false);
      }
      lastScrollY = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close search modal with ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSearchOpen]);

  const handleMouseEnter = (menuName: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setOpenDropdown(menuName);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const isActive = (path?: string, items?: DropdownItem[]) => {
    if (path) return pathname === path || pathname.startsWith(path);
    if (items) return items.some(item => pathname === item.href || pathname.startsWith(item.href));
    return false;
  };

  // Portal sayfasında navbar gösterme - hydration için client-side check
  if (!isMounted || pathname === "/") return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out motion-reduce:transition-none ${isHidden ? '-translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-4">
        <div className="relative mt-3">
          <div className={`relative flex items-center gap-4 sm:gap-6 rounded-[32px] border border-white/30 bg-white/80 px-4 sm:px-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-2xl transition-all duration-500 motion-reduce:transition-none ${isScrolled ? 'py-2.5' : 'py-4'}`}>
            {/* Brand */}
            <Link
              href="/"
              aria-label="Anasayfa"
              className="relative flex items-center justify-center"
            >
              <Image
                src="/images/kurumsal-logo/iremworld-logo.png"
                alt="IREMWORLD Logo"
                width={80}
                height={80}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-1.5">
              {menuItems.map((item) => {
                const hasDropdown = item.items && item.items.length > 0;
                const itemIsActive = isActive(item.href, item.items);

                const baseClasses = `group relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-slate-900 ${itemIsActive ? 'text-slate-900' : 'text-slate-500'}`;

                if (hasDropdown) {
                  return (
                    <div
                      key={item.name}
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button className={`${baseClasses} hover:bg-white/70`}> 
                        <span>{item.name}</span>
                        <svg
                          className={`h-4 w-4 transition-transform duration-300 ${openDropdown === item.name ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {openDropdown === item.name && (
                        <div className="absolute left-1/2 top-full mt-5 w-[420px] -translate-x-1/2 animate-in fade-in slide-in-from-top-4 duration-300">
                          <div className="rounded-3xl border border-white/40 bg-white/90 p-4 shadow-2xl backdrop-blur-2xl">
                            <div className="flex flex-col gap-2">
                              {item.items!.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setOpenDropdown(null)}
                                  className={`flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 transition duration-200 ${
                                    pathname === subItem.href
                                      ? 'border-slate-200 bg-slate-50 text-slate-900'
                                      : 'hover:border-slate-200 hover:bg-white text-slate-600'
                                  }`}
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{subItem.name}</span>
                                    <span className="text-xs text-slate-400">{subItem.description ?? 'Detaylı bilgi alın'}</span>
                                  </div>
                                  <svg
                                    className="h-4 w-4 text-slate-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={`${baseClasses} hover:bg-white/70`}
                  >
                    {item.name}
                    {itemIsActive && (
                      <span className="absolute inset-x-1 bottom-1 h-px bg-slate-900/60" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Keşfet
              </button>

              {isAuthenticated ? (
                <Link
                  href="/iw-management"
                  className="hidden lg:inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  Yönetim
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden lg:inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:-translate-y-0.5 hover:bg-primary-700"
                >
                  Başla
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/80 text-slate-700 transition hover:border-slate-200 lg:hidden"
                aria-label="Menü"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative flex h-5 w-5 flex-col justify-between">
                  <span className={`block h-0.5 w-full rounded-full bg-slate-700 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
                  <span className={`block h-0.5 w-full rounded-full bg-slate-700 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                  <span className={`block h-0.5 w-full rounded-full bg-slate-700 transition-transform duration-300 ${isMobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-0 z-40 overflow-y-auto bg-white/95 px-4 py-6 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">IREMWORLD</p>
              <p className="text-lg font-semibold text-slate-900">Experience Hub</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600"
              aria-label="Menüyü kapat"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {menuItems.map((item) => {
              const hasDropdown = item.items && item.items.length > 0;
              const itemIsActive = isActive(item.href, item.items);

              if (hasDropdown) {
                return (
                  <div key={item.name} className="rounded-3xl border border-slate-200/70 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{item.name}</p>
                    <div className="mt-3 flex flex-col gap-2">
                      {item.items!.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                            pathname === subItem.href
                              ? 'border-slate-900 text-slate-900'
                              : 'border-transparent text-slate-600 hover:border-slate-200'
                          }`}
                        >
                          {subItem.name}
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-3xl border px-4 py-4 text-base font-semibold transition ${
                    itemIsActive
                      ? 'border-slate-900 text-slate-900'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {item.name}
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}

            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="flex w-full items-center justify-between rounded-3xl border border-slate-900/10 bg-slate-900/5 px-4 py-4 text-sm font-semibold text-slate-700"
              >
                Kapsamlı Arama
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {isAuthenticated ? (
                <Link
                  href="/iw-management"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-between rounded-3xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white"
                >
                  Yönetim Paneli
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-between rounded-3xl bg-gradient-to-r from-primary-600 via-purple-500 to-blue-500 px-5 py-4 text-sm font-semibold text-white"
                >
                  Giriş Yap
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Modal - Kapsamlı Arama Motoru */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="w-full max-w-4xl mx-4 mt-20 animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
                <h2 className="text-2xl font-bold text-slate-900">Kapsamlı Arama</h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  aria-label="Aramayı kapat"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Content */}
              <div className="p-6">
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ne aramak istersiniz?"
                      className="w-full px-6 py-4 pr-12 text-lg bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>

                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push('/for-sale?type=sale');
                    }}
                    className="flex flex-col items-start p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/40 hover:border-blue-300 transition group"
                  >
                    <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-semibold text-slate-900">Satılık İlanlar</span>
                    <span className="text-xs text-slate-600 mt-1">Gayrimenkul portföyü</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push('/for-sale?type=rent');
                    }}
                    className="flex flex-col items-start p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/40 hover:border-purple-300 transition group"
                  >
                    <svg className="h-8 w-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="font-semibold text-slate-900">Kiralık İlanlar</span>
                    <span className="text-xs text-slate-600 mt-1">Kira portföyü</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push('/projects');
                    }}
                    className="flex flex-col items-start p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200/40 hover:border-orange-300 transition group"
                  >
                    <svg className="h-8 w-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-semibold text-slate-900">Projeler</span>
                    <span className="text-xs text-slate-600 mt-1">Yatırım projeleri</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push('/government');
                    }}
                    className="flex flex-col items-start p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/40 hover:border-green-300 transition group"
                  >
                    <svg className="h-8 w-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-slate-900">Devlet</span>
                    <span className="text-xs text-slate-600 mt-1">Kamu gayrimenkulleri</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push('/consultants');
                    }}
                    className="flex flex-col items-start p-4 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl border border-pink-200/40 hover:border-pink-300 transition group"
                  >
                    <svg className="h-8 w-8 text-pink-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="font-semibold text-slate-900">Danışmanlar</span>
                    <span className="text-xs text-slate-600 mt-1">Uzman network</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      router.push('/store');
                    }}
                    className="flex flex-col items-start p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/40 hover:border-amber-300 transition group"
                  >
                    <svg className="h-8 w-8 text-amber-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="font-semibold text-slate-900">Mağazalar</span>
                    <span className="text-xs text-slate-600 mt-1">Premium ofisler</span>
                  </button>
                </div>

                {/* Popular Searches */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Popüler Aramalar</h3>
                  <div className="flex flex-wrap gap-2">
                    {['İstanbul Villa', 'Denize Sıfır', 'Lüks Daire', 'Yatırımlık Arsa', 'Ofis', 'Dükkan'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setIsSearchOpen(false);
                          router.push(`/for-sale?search=${encodeURIComponent(term)}`);
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium transition"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
