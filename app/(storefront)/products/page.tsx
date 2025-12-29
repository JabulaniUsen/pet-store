import { ProductCard } from '@/components/storefront/ProductCard'
import { ProductFilters } from '@/components/storefront/ProductFilters'
import { MobileFiltersButton } from '@/components/storefront/MobileFiltersButton'
import { createClient } from '@/lib/supabase/server'
import { SortDropdown } from '@/components/storefront/SortDropdown'
import { AffiliateTracker } from '@/components/storefront/AffiliateTracker'
import Link from 'next/link'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

interface ProductsPageProps {
  searchParams: Promise<{
    pet_type?: string
    category?: string
    categories?: string
    min_price?: string
    max_price?: string
    brands?: string
    tags?: string
    page?: string
    sort?: string
    ref?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  
  // Pagination
  const page = parseInt(params.page || '1')
  const itemsPerPage = 12
  const offset = (page - 1) * itemsPerPage
  
  // Get total count for pagination
  let countQuery = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  let query = supabase
    .from('products')
    .select('*')
    .eq('status', 'active')

  // Apply filters
  if (params.pet_type && params.pet_type !== 'all') {
    // If filtering by dog or cat, also include products marked as 'both'
    if (params.pet_type === 'dog' || params.pet_type === 'cat') {
      query = query.in('pet_type', [params.pet_type, 'both'])
      countQuery = countQuery.in('pet_type', [params.pet_type, 'both'])
    } else {
      query = query.eq('pet_type', params.pet_type)
      countQuery = countQuery.eq('pet_type', params.pet_type)
    }
  }

  // Handle category filter (support both single and multiple)
  const categoryFilter = params.categories || params.category
  if (categoryFilter && categoryFilter !== 'all') {
    const categories = categoryFilter.split(',')
    if (categories.length === 1) {
      query = query.eq('category', categories[0])
      countQuery = countQuery.eq('category', categories[0])
    } else {
      query = query.in('category', categories)
      countQuery = countQuery.in('category', categories)
    }
  }

  if (params.min_price) {
    const minPrice = parseFloat(params.min_price)
    query = query.gte('price', minPrice)
    countQuery = countQuery.gte('price', minPrice)
  }

  if (params.max_price) {
    const maxPrice = parseFloat(params.max_price)
    query = query.lte('price', maxPrice)
    countQuery = countQuery.lte('price', maxPrice)
  }

  // Sort order
  const sortOrder = params.sort || 'latest'
  if (sortOrder === 'latest') {
    query = query.order('created_at', { ascending: false })
  } else if (sortOrder === 'price-low') {
    query = query.order('price', { ascending: true })
  } else if (sortOrder === 'price-high') {
    query = query.order('price', { ascending: false })
  }

  // Get products with pagination
  const { data: products, error } = await query.range(offset, offset + itemsPerPage - 1)
  const { count } = await countQuery

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 1
  const startResult = offset + 1
  const endResult = Math.min(offset + itemsPerPage, count || 0)
  const affiliateRef = params.ref

  // Fetch category counts for filters
  const { data: allProducts } = await supabase
    .from('products')
    .select('category')
    .eq('status', 'active')

  const categoryCounts: Record<string, number> = {}
  allProducts?.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
  })

  // Fetch popular products
  const { data: popularProducts } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <>
      {affiliateRef && <AffiliateTracker affiliateCode={affiliateRef} />}
      <div className="container mx-auto max-w-7xl py-4 md:py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
        {/* Left Sidebar - Filters (Hidden on mobile, shown via drawer) */}
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilters 
            categoryCounts={categoryCounts}
            popularProducts={popularProducts || []}
          />
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-3">
          {/* Mobile Filter Button & Results Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
            <MobileFiltersButton 
              categoryCounts={categoryCounts}
              popularProducts={popularProducts || []}
            />
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Showing {startResult}-{endResult} of {count || 0} results
              </p>
              <SortDropdown currentSort={sortOrder} searchParams={params} />
            </div>
          </div>

          {/* Products Grid */}
          {error ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-destructive mb-2 text-sm md:text-base">Error loading products. Please try again.</p>
            </div>
          ) : products && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    previousPrice={product.previous_price}
                    rating={product.rating}
                    image={product.images?.[0] || ''}
                    petType={product.pet_type}
                    category={product.category}
                    stock={product.stock}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 md:mt-8 flex-wrap">
                  {page > 1 && (
                    <Link
                      href={`?${new URLSearchParams({ ...params, page: (page - 1).toString() }).toString()}`}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm"
                    >
                      &lt; Prev
                    </Link>
                  )}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = i + 1
                    const isActive = page === pageNum
                    return (
                      <Link
                        key={pageNum}
                        href={`?${new URLSearchParams({ ...params, page: pageNum.toString() }).toString()}`}
                        className={`px-3 sm:px-4 py-2 border rounded transition-colors text-sm ${
                          isActive
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}
                  {page < totalPages && (
                    <Link
                      href={`?${new URLSearchParams({ ...params, page: (page + 1).toString() }).toString()}`}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors text-sm"
                    >
                      Next &gt;
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

