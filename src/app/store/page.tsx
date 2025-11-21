"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store } from "@/types/store";
import { motion } from "framer-motion";

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch("/api/stores");
        const result = await response.json();
        if (result.success) {
          setStores(result.data);
          setFilteredStores(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    let filtered = stores;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(lower) ||
          s.description.toLowerCase().includes(lower)
      );
    }

    if (cityFilter) {
      filtered = filtered.filter(s => s.contact.city === cityFilter);
    }

    if (specialtyFilter) {
      filtered = filtered.filter(s => s.specialties.includes(specialtyFilter));
    }

    if (showFeaturedOnly) {
      filtered = filtered.filter(s => s.featured);
    }

    setFilteredStores(filtered);
  }, [searchTerm, cityFilter, specialtyFilter, showFeaturedOnly, stores]);

  const cities = Array.from(new Set(stores.map(s => s.contact.city))).sort();
  const allSpecialties = Array.from(
    new Set(stores.flatMap(s => s.specialties))
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container">
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      {/* LinkedIn-style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Emlak Mağazaları
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredStores.length} mağaza
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters - Modern Clean Style */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-5 bg-[#f07f38] text-white">
                <h2 className="font-bold text-base flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrele
                </h2>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Search */}
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                    Ara
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Mağaza ara..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f07f38] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* City Filter - Custom Dropdown */}
                <div className="relative">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                    Şehir
                  </label>
                  <div className="relative">
                    <select
                      value={cityFilter}
                      onChange={e => setCityFilter(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f07f38] focus:border-transparent bg-white transition-all cursor-pointer hover:border-gray-400"
                    >
                      <option value="">Tümü</option>
                      {cities.map(city => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Specialty Filter - Custom Dropdown */}
                <div className="relative">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                    Uzmanlık
                  </label>
                  <div className="relative">
                    <select
                      value={specialtyFilter}
                      onChange={e => setSpecialtyFilter(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f07f38] focus:border-transparent bg-white transition-all cursor-pointer hover:border-gray-400"
                    >
                      <option value="">Tümü</option>
                      {allSpecialties.map(spec => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Featured Toggle - Clean Switch */}
                <div className="pt-5 border-t border-gray-200">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showFeaturedOnly}
                        onChange={e => setShowFeaturedOnly(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f07f38]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f07f38]"></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Sadece Öne Çıkanlar</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {filteredStores.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mağaza bulunamadı
                </h3>
                <p className="text-sm text-gray-600">
                  Arama kriterlerinize uygun mağaza bulunamadı.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStores.map((store, index) => (
                  <Link key={store.id} href={`/store/${store.slug}`}>
                    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                      {/* LinkedIn-style horizontal card */}
                      <div className="p-6">
                        <div className="flex gap-6">
                          {/* Logo */}
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                              <img
                                src={store.logo}
                                alt={store.name}
                                className="w-full h-full object-contain p-2"
                              />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="text-xl font-semibold text-gray-900 hover:text-[#f07f38] transition-colors">
                                  {store.name}
                                </h3>
                                {store.tagline && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {store.tagline}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                {store.featured && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#fbbf24] text-white shadow-sm">
                                    ⭐ Öne Çıkan
                                  </span>
                                )}
                                {store.verified && (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#10b981] text-white shadow-sm">
                                    <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Doğrulanmış
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                              {store.description}
                            </p>

                            {/* Stats & Info */}
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[#f07f38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="font-medium">{store.contact.city}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[#f07f38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="font-medium">{store.stats.activeListings}</span>
                                <span>aktif ilan</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[#f07f38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">{store.stats.yearsInBusiness}</span>
                                <span>yıl deneyim</span>
                              </div>
                              {store.rating && (
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="font-semibold text-gray-900">{store.rating}</span>
                                  {store.reviewCount && (
                                    <span className="text-gray-500">({store.reviewCount} değerlendirme)</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Specialties */}
                            <div className="flex flex-wrap gap-2">
                              {store.specialties.slice(0, 5).map(spec => (
                                <span
                                  key={spec}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                  {spec}
                                </span>
                              ))}
                              {store.specialties.length > 5 && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-gray-500 bg-gray-50">
                                  +{store.specialties.length - 5} daha fazla
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
