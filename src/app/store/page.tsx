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
    <div className="min-h-screen bg-gray-50">
      {/* Apple-style Compact Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Mağazalar
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredStores.length} sonuç
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Compact Sidebar - Apple Style */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden sticky top-20">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Filtreler</h2>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Compact Search */}
                <div>
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Ara..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#f07f38] focus:bg-white transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Compact Dropdowns */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Şehir</label>
                  <div className="relative">
                    <select
                      value={cityFilter}
                      onChange={e => setCityFilter(e.target.value)}
                      className="w-full appearance-none px-2.5 py-1.5 pr-7 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#f07f38] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">Tümü</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Uzmanlık</label>
                  <div className="relative">
                    <select
                      value={specialtyFilter}
                      onChange={e => setSpecialtyFilter(e.target.value)}
                      className="w-full appearance-none px-2.5 py-1.5 pr-7 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#f07f38] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">Tümü</option>
                      {allSpecialties.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Compact Toggle */}
                <div className="pt-3 border-t border-gray-100">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showFeaturedOnly}
                        onChange={e => setShowFeaturedOnly(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#f07f38]/20 rounded-full peer peer-checked:after:translate-x-3 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#f07f38] shadow-inner"></div>
                    </div>
                    <span className="ml-2 text-xs font-medium text-gray-600">Öne Çıkanlar</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Compact Grid */}
          <main className="flex-1 min-w-0">
            {filteredStores.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/50 p-8 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-gray-300 mb-3"
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
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Mağaza bulunamadı
                </h3>
                <p className="text-xs text-gray-500">
                  Arama kriterlerinize uygun mağaza bulunamadı.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredStores.map((store, index) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/store/${store.slug}`}>
                      <div className="group bg-white rounded-2xl border border-gray-200/50 overflow-hidden hover:shadow-lg hover:border-gray-300/50 transition-all duration-300 h-full flex flex-col">
                        {/* Compact Cover Image */}
                        <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          <img
                            src={store.coverImage}
                            alt={store.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Badges - Compact */}
                          <div className="absolute top-2 right-2 flex gap-1">
                            {store.featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fbbf24] text-white shadow-sm">
                                ⭐
                              </span>
                            )}
                            {store.verified && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981] text-white shadow-sm">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Logo - Compact Overlap */}
                        <div className="px-3 -mt-8 mb-2 relative z-10">
                          <div className="w-14 h-14 rounded-xl bg-white shadow-md border border-gray-200/50 overflow-hidden">
                            <img
                              src={store.logo}
                              alt={store.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Content - Compact */}
                        <div className="px-3 pb-3 flex-1 flex flex-col">
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#f07f38] transition-colors line-clamp-1 mb-0.5">
                            {store.name}
                          </h3>
                          {store.tagline && (
                            <p className="text-[11px] text-gray-500 line-clamp-1 mb-2">
                              {store.tagline}
                            </p>
                          )}
                          
                          {/* Compact Stats */}
                          <div className="flex flex-wrap gap-3 text-[10px] text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-[#f07f38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span className="font-medium">{store.contact.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3 text-[#f07f38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="font-medium">{store.stats.activeListings}</span>
                            </div>
                            {store.rating && (
                              <div className="flex items-center gap-0.5">
                                <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-semibold text-gray-900">{store.rating}</span>
                              </div>
                            )}
                          </div>

                          {/* Compact Tags */}
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {store.specialties.slice(0, 3).map(spec => (
                              <span
                                key={spec}
                                className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600"
                              >
                                {spec}
                              </span>
                            ))}
                            {store.specialties.length > 3 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium text-gray-400">
                                +{store.specialties.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
