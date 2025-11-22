"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Store } from "@/types/store";
import { Property } from "@/types/property";

interface Project {
  id: string;
  title: string;
  location: string;
  country: string;
  type: string;
  status: string;
  description: string;
  price: string;
  images: string[];
  storeId?: string;
}

type TabType = 'listings' | 'team' | 'about';

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [store, setStore] = useState<Store | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('listings');

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // Mağaza bilgilerini al
        const storeResponse = await fetch(`/api/stores`);
        const storeResult = await storeResponse.json();
        if (storeResult.success) {
          const foundStore = storeResult.data.find((s: Store) => s.slug === slug);
          if (foundStore) {
            setStore(foundStore);
          } else {
            router.push("/store");
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch store:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  
  }, [slug, router]);

  useEffect(() => {
    if (!store) return;
    const fetchStoreProperties = async () => {
      try {
        const res = await fetch('/api/properties?limit=100');
        const json = await res.json();
        if (json.properties) {
          const storeProps = (json.properties as Property[]).filter(p => p.storeId === store.id);
          setProperties(storeProps);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchStoreProperties();

    const fetchStoreProjects = async () => {
      try {
        const res = await fetch('/data/projects.json');
        const json = await res.json();
        if (json) {
          const storeProjects = (json as Project[]).filter(p => p.storeId === store.id);
          setProjects(storeProjects);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchStoreProjects();
  }, [store]);

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

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Compact Mobile-First Header */}
      <div className="relative">
        {/* Cover Image - Reduced Height for Mobile */}
        <div className="relative h-32 sm:h-40 md:h-48 bg-gradient-to-br from-[#f07f38] to-[#d65a1b] overflow-hidden">
          {store.coverImage && (
            <img
              src={store.coverImage}
              alt={store.name}
              className="w-full h-full object-cover opacity-40"
            />
          )}
        </div>

        {/* Store Info Card - Overlapping Design */}
        <div className="relative -mt-12 px-3 sm:px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-5 md:p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Logo - Compact */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl bg-white shadow-md border-2 border-gray-100 overflow-hidden flex-shrink-0">
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 truncate">
                        {store.name}
                      </h1>
                      {store.tagline && (
                        <p className="text-sm sm:text-base text-gray-600 mb-2 line-clamp-1">
                          {store.tagline}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f07f38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {store.contact.city}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>{store.stats.yearsInBusiness} yıl</span>
                        {store.rating && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="font-semibold">{store.rating}</span>
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {store.verified && (
                          <span className="inline-flex items-center gap-1 bg-[#10b981]/10 text-[#10b981] text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Doğrulanmış
                          </span>
                        )}
                        {store.featured && (
                          <span className="bg-[#fbbf24]/10 text-[#fbbf24] text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full">
                            ⭐ Premium
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-700 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
                          {store.stats.activeListings} ilan
                        </span>
                      </div>
                    </div>

                    {/* CTA Buttons - Compact */}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <a
                        href={`tel:${store.contact.phone}`}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-[#f07f38] hover:bg-[#d65a1b] text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-1.74.964a11.08 11.08 0 005.654 5.654l.964-1.74a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="hidden sm:inline">Ara</span>
                      </a>
                      <a
                        href={`mailto:${store.contact.email}`}
                        className="flex-1 sm:flex-initial px-4 py-2 border-2 border-[#f07f38] text-[#f07f38] hover:bg-[#f07f38]/5 font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">Mail</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialties - Horizontal Scroll on Mobile */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {store.specialties.slice(0, 6).map(spec => (
                    <span
                      key={spec}
                      className="inline-flex items-center bg-[#f07f38]/10 text-[#f07f38] px-2.5 py-1 rounded-lg font-medium text-xs whitespace-nowrap"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Sticky on Scroll */}
      <div className="sticky top-28 z-20 bg-white border-b border-gray-200 shadow-sm mt-4">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-3 font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === 'listings'
                  ? 'text-[#f07f38] border-b-2 border-[#f07f38]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                İlanlar {properties.length > 0 && `(${properties.length})`}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-3 font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === 'team'
                  ? 'text-[#f07f38] border-b-2 border-[#f07f38]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Ekip {store.employees && store.employees.length > 0 && `(${store.employees.length})`}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 sm:flex-initial px-4 sm:px-6 py-3 font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === 'about'
                  ? 'text-[#f07f38] border-b-2 border-[#f07f38]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2 justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hakkında
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-20">
        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {properties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {properties.map(property => (
                  <Link
                    key={property.id}
                    href={`/property/${property.slug}`}
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#f07f38]/50 hover:shadow-lg transition-all"
                  >
                    <div className="relative h-40 sm:h-44 overflow-hidden">
                      <img
                        src={property.images[0] || '/images/placeholder.jpg'}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold text-[#f07f38] shadow-md">
                        {property.price.toLocaleString('tr-TR')} ₺
                      </div>
                      <div className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        {property.category.sub}
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1.5 line-clamp-1 group-hover:text-[#f07f38] transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {property.location.district}, {property.location.city}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          {property.specs.rooms}
                        </span>
                        <span>•</span>
                        <span>{property.specs.netSize} m²</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-200">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz İlan Yok</h3>
                <p className="text-sm text-gray-600">Bu mağaza henüz ilan eklememiş.</p>
              </div>
            )}
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-3 sm:space-y-4">
            {store.employees && store.employees.length > 0 ? (
              store.employees.map(employee => (
                <div
                  key={employee.id}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 hover:border-[#f07f38]/50 hover:shadow-md transition-all"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <img
                        src={employee.photo}
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-gray-900 truncate">{employee.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">{employee.position}</p>
                        </div>
                        {employee.linkedin && (
                          <a
                            href={employee.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#0077b5] text-white hover:bg-[#006399] transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          </a>
                        )}
                      </div>
                      {employee.yearsOfExperience && (
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-2">
                          {employee.yearsOfExperience} yıl deneyim
                        </p>
                      )}
                      {employee.bio && (
                        <p className="text-xs sm:text-sm text-gray-700 mb-2 line-clamp-2">{employee.bio}</p>
                      )}
                      {employee.languages && employee.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {employee.languages.map(lang => (
                            <span
                              key={lang}
                              className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}
                      {employee.specialties && employee.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {employee.specialties.slice(0, 3).map(spec => (
                            <span
                              key={spec}
                              className="bg-[#f07f38]/10 text-[#f07f38] px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {employee.email && (
                          <a
                            href={`mailto:${employee.email}`}
                            className="inline-flex items-center gap-1 text-xs text-[#f07f38] hover:text-[#d65a1b] font-medium"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Mail
                          </a>
                        )}
                        {employee.phone && (
                          <a
                            href={`tel:${employee.phone}`}
                            className="inline-flex items-center gap-1 text-xs text-[#f07f38] hover:text-[#d65a1b] font-medium"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-1.74.964a11.08 11.08 0 005.654 5.654l.964-1.74a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Ara
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-200">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz Ekip Üyesi Yok</h3>
                <p className="text-sm text-gray-600">Bu mağaza henüz ekip üyesi eklememiş.</p>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="space-y-3 sm:space-y-4">
            {/* Description */}
            <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#f07f38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Hakkımızda
              </h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {store.description}
              </p>
              {store.legalName && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Ticari Ünvan</p>
                  <p className="text-sm font-semibold text-gray-900">{store.legalName}</p>
                </div>
              )}
              {store.foundedYear && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Kuruluş Yılı</p>
                  <p className="text-sm font-semibold text-gray-900">{store.foundedYear}</p>
                </div>
              )}
            </div>

            {/* Service Areas */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#f07f38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Hizmet Bölgeleri
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {store.serviceAreas.map(area => (
                  <div
                    key={area}
                    className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <svg className="w-4 h-4 text-[#f07f38] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#f07f38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                İletişim Bilgileri
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{store.contact.address}</p>
                    <p className="text-sm text-gray-600">{store.contact.city}, {store.contact.country}</p>
                  </div>
                </div>
                <a href={`tel:${store.contact.phone}`} className="flex items-center gap-3 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#f07f38] flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-1.74.964a11.08 11.08 0 005.654 5.654l.964-1.74a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm text-[#f07f38] hover:underline">{store.contact.phone}</span>
                </a>
                <a href={`mailto:${store.contact.email}`} className="flex items-center gap-3 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#f07f38] flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-[#f07f38] hover:underline truncate">{store.contact.email}</span>
                </a>
                {store.contact.website && (
                  <a href={store.contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#f07f38] flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="text-sm text-[#f07f38] hover:underline truncate">{store.contact.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
              </div>

              {/* Social Media */}
              {store.social && Object.values(store.social).some(v => v) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Sosyal Medya</p>
                  <div className="flex gap-2">
                    {store.social.instagram && (
                      <a href={store.social.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-lg transition-shadow">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                      </a>
                    )}
                    {store.social.facebook && (
                      <a href={store.social.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:shadow-lg transition-shadow">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      </a>
                    )}
                    {store.social.linkedin && (
                      <a href={store.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#0077b5] text-white hover:shadow-lg transition-shadow">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                      </a>
                    )}
                    {store.social.twitter && (
                      <a href={store.social.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-900 text-white hover:shadow-lg transition-shadow">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-[#f07f38] to-[#d65a1b] rounded-xl p-4 sm:p-5 text-white">
              <h3 className="text-base sm:text-lg font-bold mb-4">İstatistikler</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">{store.stats.activeListings}</p>
                  <p className="text-xs sm:text-sm text-white/80">Aktif İlan</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold">{store.stats.yearsInBusiness}</p>
                  <p className="text-xs sm:text-sm text-white/80">Yıl Deneyim</p>
                </div>
                {store.stats.totalSales && (
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{store.stats.totalSales}</p>
                    <p className="text-xs sm:text-sm text-white/80">Başarılı Satış</p>
                  </div>
                )}
                {store.stats.employeeCount && (
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">{store.stats.employeeCount}</p>
                    <p className="text-xs sm:text-sm text-white/80">Çalışan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
