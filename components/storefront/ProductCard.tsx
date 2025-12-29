'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { StarRating } from './StarRating'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  previousPrice?: number | null
  rating?: number | null
  orderCount?: number | null
  image: string
  petType: string
  category: string
  stock: number
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  previousPrice,
  rating,
  orderCount,
  image,
  petType,
  category,
  stock,
}: ProductCardProps) {
  const router = useRouter()
  const hasDiscount = previousPrice && previousPrice > price
  const isOutOfStock = stock === 0

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/products/${slug}`)
  }

  return (
    <Link href={`/products/${slug}`} className="block">
      <Card className="overflow-hidden bg-white border-2 rounded-xl hover:border-primary transition-all duration-200 cursor-pointer h-full flex flex-col group">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          {image && image !== '/placeholder-product.jpg' ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              unoptimized={image.startsWith('http')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-4 flex flex-col">
          <h3 className="font-semibold text-base text-black mb-2">{name}</h3>
          
          {rating && rating > 0 && (
            <div className="mb-2">
              <StarRating rating={rating} size="sm" showValue={false} />
            </div>
          )}

          {orderCount !== null && orderCount !== undefined && orderCount > 0 && (
            <div className="mb-2">
              <span className="text-xs text-gray-600 font-medium">
                {orderCount} {orderCount === 1 ? 'order' : 'orders'}
              </span>
            </div>
          )}

          <div className="mb-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-black">
                  {formatCurrency(price)}
                </p>
                {hasDiscount && (
                  <p className="text-xs text-gray-500 line-through">
                    {formatCurrency(previousPrice)}
                  </p>
                )}
              </div>
              {hasDiscount && (
                <span className="text-xs text-red-600 font-medium">
                  {Math.round(((previousPrice! - price) / previousPrice!) * 100)}% OFF
                </span>
              )}
            </div>
          </div>

          <Button
            onClick={handlePurchaseClick}
            disabled={isOutOfStock}
            className="w-full bg-primary hover:bg-primary/90 text-white mt-auto h-12 text-base font-semibold"
            size="lg"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}

