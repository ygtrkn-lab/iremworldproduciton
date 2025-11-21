/**
 * Example: SEO-Optimized Search Page with Pagination
 * 
 * This example shows how to implement advanced SEO for search/listing pages
 * similar to sahibinden.com
 */

// NOTE: This example file is not referenced in app routes and may be removed.
// If you want to keep a reference example, move it to docs/ or examples/ folder and adjust imports.
import { Metadata } from 'next';
import { 
  generateSearchBreadcrumbs, 
  generateBreadcrumbSchema,
  generatePaginationLinks 
} from '@/lib/seo-utils';

// Example for /for-sale page
type SearchParams = {
  page?: string;
  city?: string;
  district?: string;
  minPrice?: string;
  maxPrice?: string;
  rooms?: string;
};

interface SearchPageProps {
  searchParams: SearchParams;
}

export async function generateMetadata({ 
  searchParams 
}: SearchPageProps): Promise<Metadata> {
  const page = Number(searchParams.page) || 1;
  const city = searchParams.city;
  const district = searchParams.district;
  const rooms = searchParams.rooms;
  
  // Build dynamic title
  const titleParts: string[] = ['Satılık'];
  
  if (rooms) titleParts.push(rooms);
  if (district) {
    titleParts.push(district);
  } else if (city) {
    titleParts.push(city);
  }
  
  const title = page === 1 
    ? `${titleParts.join(' ')} İlanları | IREMWORLD`
    : `${titleParts.join(' ')} İlanları - Sayfa ${page} | IREMWORLD`;
  
  // Build dynamic description
  const descParts: string[] = [];
  if (district && city) {
    descParts.push(`${district}, ${city}`);
  } else if (city) {
    descParts.push(city);
  }
  
  if (rooms) descParts.push(rooms);
  descParts.push('satılık daire ve konut ilanları');
  
  const description = `${descParts.join(' ')} sahibinden ve emlak ofislerinden. IREMWORLD'de binlerce ilan arasından size en uygun emlağı bulun.`;
  
  // Keywords
  const keywords: string[] = [
    'satılık',
    'satılık emlak',
    'satılık konut',
    city && `${city} satılık`,
    district && `${district} satılık`,
    rooms && `${rooms} satılık`,
    'emlak ilanları',
    'gayrimenkul',
    'IREMWORLD',
  ].filter(Boolean) as string[];
  
  // Pagination links
  const baseUrl = '/for-sale';
  const totalPages = 100; // This should be calculated from actual data
  const paginationLinks = generatePaginationLinks(baseUrl, page, totalPages);
  
  // Build canonical with query params
  let canonical = 'https://www.iremworld.com/for-sale';
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (district) params.set('district', district);
  if (rooms) params.set('rooms', rooms);
  if (page > 1) params.set('page', page.toString());
  
  const queryString = params.toString();
  if (queryString) {
    canonical += `?${queryString}`;
  }
  
  return {
    title,
    description,
    keywords: keywords.join(', '),
    
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'IREMWORLD Real Estate',
      type: 'website',
      locale: 'tr_TR',
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@iremworld',
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
    
    alternates: {
      canonical: paginationLinks.canonical,
      languages: {
        'tr-TR': canonical,
        'en-US': canonical.replace('/for-sale', '/en/for-sale'),
      },
    },
    
    other: {
      'revisit-after': '1 days',
      ...(paginationLinks.prev && { 'prev': paginationLinks.prev }),
      ...(paginationLinks.next && { 'next': paginationLinks.next }),
    },
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const city = searchParams.city;
  const district = searchParams.district;
  
  // Generate breadcrumb structured data
  const breadcrumbs = generateSearchBreadcrumbs({
    type: 'sale',
    city,
    district,
  });
  
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  
  // Generate ItemList structured data for search results
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': `Satılık İlanlar${city ? ` - ${city}` : ''}`,
    'numberOfItems': 0, // Should be actual count
    'itemListOrder': 'https://schema.org/ItemListOrderDescending',
    'itemListElement': [
      // This should be populated with actual property data
      // Example:
      // {
      //   '@type': 'ListItem',
      //   'position': 1,
      //   'item': {
      //     '@type': 'RealEstateListing',
      //     'name': 'Property Title',
      //     'url': 'https://www.iremworld.com/property/...',
      //   }
      // }
    ]
  };
  
  return (
    <>
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* ItemList Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      
      {/* Breadcrumb Navigation UI */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-700 font-semibold">{crumb.name}</span>
              ) : (
                <a 
                  href={crumb.url} 
                  className="text-blue-600 hover:underline"
                >
                  {crumb.name}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>
      
      {/* Page Heading with SEO-optimized H1 */}
      <h1 className="text-3xl font-bold mb-6">
        {city && district ? `${district}, ${city}` : city || 'Türkiye'} Satılık İlanları
      </h1>
      
      {/* Search Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Property cards here */}
      </div>
      
      {/* Pagination with SEO-friendly structure */}
      <nav aria-label="Pagination" className="mt-8">
        <ul className="flex justify-center space-x-2">
          {/* Prev/Next with rel attributes */}
          {/* Individual page links */}
        </ul>
      </nav>
    </>
  );
}

/**
 * Example: Category-specific SEO
 * 
 * For different property types, you can create specific metadata
 */

export function generateVillaSEO(city?: string) {
  return {
    title: `Satılık Villa${city ? ` - ${city}` : ''} | Lüks Villa İlanları | IREMWORLD`,
    description: `${city ? `${city}'da` : 'Türkiye\'nin her yerinde'} satılık villa ilanları. Özel havuzlu, deniz manzaralı, müstakil villa seçenekleri ile hayalinizdeki villayı IREMWORLD'de bulun.`,
    keywords: [
      'satılık villa',
      city && `${city} villa`,
      'lüks villa',
      'müstakil villa',
      'havuzlu villa',
      'deniz manzaralı villa',
      'özel villa',
      'villa ilanları',
    ].filter(Boolean).join(', '),
  };
}

export function generateApartmentSEO(city?: string, rooms?: string) {
  return {
    title: `${rooms || ''} Satılık Daire${city ? ` - ${city}` : ''} | IREMWORLD`,
    description: `${city ? `${city}'da` : 'Türkiye\'de'} ${rooms || ''} satılık daire ilanları. Site içi, havuzlu, güvenlikli daire seçenekleri ile uygun fiyatlı konut IREMWORLD'de.`,
    keywords: [
      'satılık daire',
      rooms && `${rooms} satılık`,
      city && `${city} satılık daire`,
      'satılık konut',
      'apartman dairesi',
      'site içi daire',
    ].filter(Boolean).join(', '),
  };
}

/**
 * Usage in actual search pages:
 * 
 * // src/app/for-sale/page.tsx
 * export { generateMetadata } from '@/examples/seo-search-example';
 * export { default } from '@/examples/seo-search-example';
 */
