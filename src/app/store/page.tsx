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
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 via-white to-amber-50/20 py-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header - Modern Hero */}
        <div className="mb-16 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Premium Ofisler
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-primary-600 to-amber-600 bg-clip-text text-transparent">
                Mağazalar
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Güvenilir gayrimenkul danışmanlarımızı keşfedin. Deneyimli ekipler
              ve geniş portföylerle hayalinizdeki emlağı bulun.
            </p>
          </motion.div>
        </div>

        {/* Filters - Modern Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgba(240,127,56,0.08)] border border-primary-100/50 p-6 sm:p-8 mb-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Mağaza ara..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-primary-200/60 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="px-4 py-3.5 bg-white border-2 border-primary-200/60 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all text-gray-900 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMS41TDYgNi41TDExIDEuNSIgc3Ryb2tlPSIjZjA3ZjM4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10"
            >
              <option value="">Tüm Şehirler</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              value={specialtyFilter}
              onChange={e => setSpecialtyFilter(e.target.value)}
              className="px-4 py-3.5 bg-white border-2 border-primary-200/60 rounded-2xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all text-gray-900 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMS41TDYgNi41TDExIDEuNSIgc3Ryb2tlPSIjZjA3ZjM4IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10"
            >
              <option value="">Tüm Uzmanlıklar</option>
              {allSpecialties.map(spec => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-br from-primary-50 to-amber-50 border-2 border-primary-200/60 rounded-2xl cursor-pointer hover:from-primary-100 hover:to-amber-100 transition-all group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={e => setShowFeaturedOnly(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-amber-500 transition-all"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Öne Çıkanlar</span>
            </label>
          </div>
        </motion.div>

        {/* Results count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 flex items-center gap-2"
        >
          <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-amber-500 rounded-full"></div>
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-900 text-lg">
              {filteredStores.length}
            </span>{" "}
            mağaza bulundu
          </p>
        </motion.div>

        {/* Store Grid */}
        {filteredStores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-primary-100/50"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-100 to-amber-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-primary-500"
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
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Mağaza bulunamadı
            </h3>
            <p className="text-gray-600 text-lg">
              Arama kriterlerinize uygun mağaza bulunamadı.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link href={`/store/${store.slug}`}>
                  <div className="group relative bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgba(240,127,56,0.15)] transition-all duration-500 overflow-hidden h-full flex flex-col border border-gray-100 hover:border-primary-200">
                    {/* Cover Image with Overlay */}
                    <div className="relative h-56 bg-gradient-to-br from-primary-50 to-amber-50 overflow-hidden">
                      {store.coverImage ? (
                        <>
                          <img
                            src={store.coverImage}
                            alt={store.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-24 h-24 text-primary-300"
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
                        </div>
                      )}
                      
                      {/* Premium Badges */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                        {store.featured && (
                          <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Öne Çıkan
                          </span>
                        )}
                        {store.verified && (
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Doğrulanmış
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Logo - Modern Floating */}
                    <div className="relative px-6 -mt-14 mb-4 z-10">
                      <div className="w-28 h-28 rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-4 border-white overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="w-full h-full object-contain p-3"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors leading-tight">
                        {store.name}
                      </h3>
                      {store.tagline && (
                        <p className="text-sm text-primary-600 font-semibold mb-3 tracking-wide">
                          {store.tagline}
                        </p>
                      )}
                      <p className="text-gray-600 text-sm mb-5 line-clamp-2 flex-1 leading-relaxed">
                        {store.description}
                      </p>

                      {/* Stats - Modern Cards */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-gradient-to-br from-primary-50 to-amber-50 rounded-2xl p-4 border border-primary-100/50">
                          <p className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-amber-600 bg-clip-text text-transparent">
                            {store.stats.activeListings}
                          </p>
                          <p className="text-xs text-gray-600 font-medium mt-1">Aktif İlan</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100/50">
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {store.stats.yearsInBusiness}
                          </p>
                          <p className="text-xs text-gray-600 font-medium mt-1">Yıl Deneyim</p>
                        </div>
                      </div>

                      {/* Specialties - Pills */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {store.specialties.slice(0, 3).map(spec => (
                          <span
                            key={spec}
                            className="text-xs bg-white border border-primary-200 text-primary-700 px-3 py-1.5 rounded-full font-medium hover:bg-primary-50 transition-colors"
                          >
                            {spec}
                          </span>
                        ))}
                        {store.specialties.length > 3 && (
                          <span className="text-xs text-gray-500 font-medium px-2 py-1.5">
                            +{store.specialties.length - 3} daha
                          </span>
                        )}
                      </div>

                      {/* Footer - Location & Rating */}
                      <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-5 h-5 text-primary-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="font-medium">{store.contact.city}</span>
                        </div>
                        {store.rating && (
                          <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full">
                            <svg
                              className="w-4 h-4 text-yellow-500 fill-current"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-bold text-gray-900">
                              {store.rating}
                            </span>
                            {store.reviewCount && (
                              <span className="text-xs text-gray-500 font-medium">
                                ({store.reviewCount})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
