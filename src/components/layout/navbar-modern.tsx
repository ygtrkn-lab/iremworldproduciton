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
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                onClick={() => router.push('/for-sale')}
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
                  router.push('/for-sale');
                }}
                className="flex w-full items-center justify-between rounded-3xl border border-slate-900/10 bg-slate-900/5 px-4 py-4 text-sm font-semibold text-slate-700"
              >
                İlan Ara
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
    </header>
  );
}
