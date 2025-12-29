import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductGallery } from '@/components/storefront/ProductGallery'
import { VideoPlayer } from '@/components/storefront/VideoPlayer'
import { AddToCartButton } from '@/components/storefront/AddToCartButton'
import { ShareButton } from '@/components/storefront/ShareButton'
import { ProductSizeSelector } from '@/components/storefront/ProductSizeSelector'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/format'
import { ShoppingCart } from 'lucide-react'
import { AffiliateTracker } from '@/components/storefront/AffiliateTracker'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('status', 'active')
    .single()

  if (error || !product) {
    notFound()
  }

  // Helper function to safely parse JSONB fields
  const parseJsonbField = (value: any): any[] => {
    if (Array.isArray(value)) return value
    if (!value) return []
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  // Parse sizes and colors from JSONB
  const sizes = parseJsonbField(product.sizes)
  const colors = parseJsonbField(product.colors)

  // Track affiliate link if ref parameter exists
  const affiliateRef = resolvedSearchParams.ref

  return (
    <>
      {affiliateRef && <AffiliateTracker affiliateCode={affiliateRef} productId={product.id} />}
      
      <div className="mx-auto max-w-7xl py-6 md:py-12 px-4 pb-24 sm:pb-6 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images and Video */}
          <div className="space-y-6">
            <ProductGallery
              images={product.images || []}
              productName={product.name}
            />
            {product.video_url && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Product Video</h3>
                <VideoPlayer
                  videoUrl={product.video_url}
                  productName={product.name}
                />
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs px-2.5 py-1">{product.pet_type}</Badge>
                <Badge variant="outline" className="text-xs px-2.5 py-1">{product.category}</Badge>
                {product.stock === 0 && (
                  <Badge variant="destructive" className="text-xs px-2.5 py-1">Out of Stock</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>
              <p className="text-3xl md:text-4xl font-bold text-primary">
                {formatCurrency(product.price)}
              </p>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">Description</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size/Color Selection or Stock Info */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              {(sizes.length > 0 || colors.length > 0) ? (
                <ProductSizeSelector
                  product={product}
                  sizes={sizes}
                  colors={colors}
                />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Stock: </span>
                    <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-destructive font-medium'}>
                      {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                    </span>
                  </div>
                  {/* Desktop buttons - in flow */}
                  <div className="hidden sm:flex flex-col sm:flex-row gap-3 pt-2">
                    <AddToCartButton
                      product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        image: product.images?.[0] || '/placeholder-product.jpg',
                      }}
                      disabled={product.stock === 0}
                    />
                    <ShareButton productSlug={product.slug} productName={product.name} />
                  </div>

                  {/* Mobile sticky button at bottom */}
                  <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
                    <div className="max-w-7xl mx-auto">
                      <AddToCartButton
                        product={{
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          image: product.images?.[0] || '/placeholder-product.jpg',
                        }}
                        disabled={product.stock === 0}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}