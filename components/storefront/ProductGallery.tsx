'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  // Filter out empty or invalid image URLs
  const validImages = images?.filter((img) => img && img.trim() !== '') || []
  const [selectedImage, setSelectedImage] = useState(validImages[0] || '/placeholder-product.jpg')

  if (!validImages || validImages.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">No image available</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full bg-muted rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          className="object-cover"
          priority
          unoptimized={selectedImage.startsWith('http')}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.currentTarget.src = '/placeholder-product.jpg'
          }}
        />
      </div>
      {validImages.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedImage === image
                  ? 'border-primary ring-2 ring-primary/30 scale-105'
                  : 'border-gray-200 hover:border-gray-400 hover:scale-105'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} view ${index + 1}`}
                fill
                className="object-cover"
                unoptimized={image.startsWith('http')}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-product.jpg'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

