import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/storefront/ProductCard'
import { createClient } from '@/lib/supabase/server'
import { ChevronLeft, ChevronRight, ArrowRight, Heart } from 'lucide-react'
import { AffiliateTracker } from '@/components/storefront/AffiliateTracker'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams: Promise<{ ref?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const affiliateRef = params.ref

  // Fetch featured products (products marked as featured)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(3)

  // Fetch best seller products (products marked as best sellers, ordered by order_count)
  const { data: bestSellers } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('is_best_seller', true)
    .order('order_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(4)

  // Fetch categories with product counts
  const { data: categoryData } = await supabase
    .from('products')
    .select('category')
    .eq('status', 'active')

  // Get unique categories with counts
  const categories = [
    { name: 'Accessories', count: categoryData?.filter(p => p.category.toLowerCase().includes('accessor')).length || 84, image: '/per-accessories.png' },
    { name: 'Food', count: categoryData?.filter(p => p.category.toLowerCase().includes('food')).length || 120, image: '/pets-food.png' },
    { name: 'Furniture', count: categoryData?.filter(p => p.category.toLowerCase().includes('furnitur')).length || 45, image: '/pet-furniture.png' },
    { name: 'Bags', count: categoryData?.filter(p => p.category.toLowerCase().includes('bag')).length || 32, image: '/pet-bag.png' },
  ]

  return (
    <>
      {affiliateRef && <AffiliateTracker affiliateCode={affiliateRef} />}
      <div className="flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative py-10 px-4 bg-white overflow-hidden bg-gray-100">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center relative">
            {/* Left Side */}
            <div className="relative z-10">
              {/* Small orange blob shapes scattered around */}
              <div className="hero-blob absolute top-0 left-0 w-32 h-32 opacity-30 -z-10">
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 rounded-full blur-2xl"></div>
              </div>
              <div className="hero-blob absolute bottom-20 left-1/4 w-24 h-24 opacity-25 -z-10">
                <div className="w-full h-full bg-gradient-to-br from-orange-300 to-orange-400 rounded-full blur-xl"></div>
              </div>
              
              <span className="hero-badge text-primary text-sm font-medium mb-4 block relative z-10">Pet Shop</span>
              <h1 className="hero-title text-5xl md:text-6xl font-bold text-black mb-6 leading-tight relative z-10">
                A pet store with everything you need
              </h1>
              <p className="hero-description text-black text-lg mb-8 leading-relaxed relative z-10">
                Sociis blandit et pellentesque aliquet at quisque tortor lacinia nullam. Mattis aenean scelerisque dui libero
              </p>
              <Button asChild size="lg" className="hero-button bg-black text-white hover:bg-black/90 h-12 px-8 rounded-lg relative z-10">
                <Link href="/products">
                  Shop Now
                </Link>
              </Button>
            </div>

            {/* Right Side - Animals Image */}
            <div className="relative flex items-center justify-center min-h-[600px] md:min-h-[700px]">
              <div className="relative w-full  h-[700px] -mr-20">
                <Image src="/Shapes+pattern.svg" alt="bg" fill className="object-contain" priority />
                <Image src="/animals.png" alt="Pet animals" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-black">Browse by category</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full border-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-2">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${category.name.toLowerCase()}`}
                className="group bg-white border-2 rounded-xl overflow-hidden hover:border-primary transition-all duration-200 cursor-pointer flex flex-col"
              >
                <div className="h-24 sm:h-32 lg:h-48 relative overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="p-2 sm:p-3 lg:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                  <div className="flex-1">
                    <h3 className="font-bold text-xs sm:text-sm lg:text-lg text-black mb-0.5 sm:mb-1 line-clamp-1">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{category.count} products</p>
                  </div>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary group-hover:translate-x-1 transition-transform hidden sm:block" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Seller Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">Best Sellers</h2>
          
          {bestSellers && bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <div key={product.id}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    previousPrice={product.previous_price}
                    rating={product.rating}
                    orderCount={product.order_count}
                    image={product.images?.[0] || '/placeholder-product.jpg'}
                    petType={product.pet_type}
                    category={product.category}
                    stock={product.stock}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No best sellers available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-black mb-8 text-center">Featured products</h2>
          
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    previousPrice={product.previous_price}
                    rating={product.rating}
                    image={product.images?.[0] || '/placeholder-product.jpg'}
                    petType={product.pet_type}
                    category={product.category}
                    stock={product.stock}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No products available yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
    </>
  )
}

