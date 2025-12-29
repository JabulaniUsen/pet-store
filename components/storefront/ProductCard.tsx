'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Heart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
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
  image,
  petType,
  category,
  stock,
}: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`}>
      <Card className="overflow-hidden bg-white border-2 rounded-xl hover:border-primary transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
          {image && image !== '/placeholder-product.jpg' ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              unoptimized={image.startsWith('http')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>
        <CardContent className="flex-1 p-4">
          <h3 className="font-semibold text-base text-black mb-2">{name}</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black">
              {formatCurrency(price)}
            </p>
            <button 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Heart className="h-5 w-5 text-orange-500" strokeWidth={2} fill="none" />
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

