'use client'

import { useState, useEffect } from 'react'
import { SizeSelector } from './SizeSelector'
import { ColorSelector } from './ColorSelector'
import { AddToCartButton } from './AddToCartButton'
import { ShareButton } from './ShareButton'
import { formatCurrency } from '@/lib/utils/format'

interface ProductSizeSelectorProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    images?: string[]
    sizes?: Array<{
      size: string
      stock: number
      price?: number | null
    }>
    colors?: Array<{
      color: string
      stock: number
      price?: number | null
      hex?: string
    }>
  }
  sizes: Array<{
    size: string
    stock: number
    price?: number | null
  }>
  colors?: Array<{
    color: string
    stock: number
    price?: number | null
    hex?: string
  }>
}

export function ProductSizeSelector({ product, sizes, colors }: ProductSizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  // Auto-select first size and first color on mount
  useEffect(() => {
    if (sizes.length > 0 && selectedSize === null) {
      // Select first available size (prefer one with stock, but select any if all out of stock)
      const firstAvailableSize = sizes.find(s => s.stock > 0) || sizes[0]
      if (firstAvailableSize) {
        setSelectedSize(firstAvailableSize.size)
      }
    }
  }, [sizes, selectedSize])

  useEffect(() => {
    if (colors && colors.length > 0 && selectedColor === null) {
      // Select first available color (prefer one with stock, but select any if all out of stock)
      const firstAvailableColor = colors.find(c => c.stock > 0) || colors[0]
      if (firstAvailableColor) {
        setSelectedColor(firstAvailableColor.color)
      }
    }
  }, [colors, selectedColor])

  const selectedSizeData = selectedSize 
    ? sizes.find(s => s.size === selectedSize)
    : null

  const selectedColorData = selectedColor
    ? colors?.find(c => c.color === selectedColor)
    : null

  const getPrice = () => {
    let price = product.price
    
    // Size price takes precedence
    if (selectedSizeData?.price !== null && selectedSizeData?.price !== undefined) {
      price = selectedSizeData.price
    }
    // Then color price
    else if (selectedColorData?.price !== null && selectedColorData?.price !== undefined) {
      price = selectedColorData.price
    }
    
    return price
  }

  const isOutOfStock = () => {
    // If both size and color are selected, check the combination
    if (selectedSize && selectedColor) {
      // For now, we'll check if either is out of stock
      // In a more advanced system, you might want size-color combinations
      return (selectedSizeData?.stock === 0) || (selectedColorData?.stock === 0)
    }
    
    if (selectedSizeData) {
      return selectedSizeData.stock === 0
    }
    
    if (selectedColorData) {
      return selectedColorData.stock === 0
    }
    
    // If no selection, check if any variant is available
    if (sizes.length > 0 && colors && colors.length > 0) {
      return sizes.every(s => s.stock === 0) && colors.every(c => c.stock === 0)
    }
    if (sizes.length > 0) {
      return sizes.every(s => s.stock === 0)
    }
    if (colors && colors.length > 0) {
      return colors.every(c => c.stock === 0)
    }
    
    return false
  }

  const getTotalStock = () => {
    if (sizes.length > 0 && colors && colors.length > 0) {
      const sizeStock = sizes.reduce((sum, size) => sum + size.stock, 0)
      const colorStock = colors.reduce((sum, color) => sum + color.stock, 0)
      return Math.min(sizeStock, colorStock) // Conservative estimate
    }
    if (sizes.length > 0) {
      return sizes.reduce((sum, size) => sum + size.stock, 0)
    }
    if (colors && colors.length > 0) {
      return colors.reduce((sum, color) => sum + color.stock, 0)
    }
    return 0
  }

  const canAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) return false
    if (colors && colors.length > 0 && !selectedColor) return false
    return !isOutOfStock()
  }

  return (
    <div className="space-y-6">
      {sizes.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSizeSelect={setSelectedSize}
            basePrice={product.price}
          />
        </div>
      )}
      
      {colors && colors.length > 0 && (
        <div className="border-b border-gray-200 pb-6">
          <ColorSelector
            colors={colors}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
            basePrice={product.price}
          />
        </div>
      )}

      {/* Price Display */}
      {(selectedSizeData?.price || selectedColorData?.price) && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Price:</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(getPrice())}
            </span>
          </div>
          {product.price !== getPrice() && (
            <p className="text-xs text-gray-500 mt-1">
              Base price: {formatCurrency(product.price)}
            </p>
          )}
        </div>
      )}

      {/* Desktop buttons - in flow */}
      <div className="hidden sm:flex flex-col sm:flex-row gap-3 pt-2">
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: getPrice(),
            image: product.images?.[0] || '/placeholder-product.jpg',
          }}
          size={selectedSize || undefined}
          color={selectedColor || undefined}
          disabled={!canAddToCart()}
        />
        <ShareButton productSlug={product.slug} productName={product.name} />
      </div>

      {/* Mobile sticky button at bottom */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 safe-area-inset-bottom">
        <div className="max-w-7xl mx-auto">
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: getPrice(),
              image: product.images?.[0] || '/placeholder-product.jpg',
            }}
            size={selectedSize || undefined}
            color={selectedColor || undefined}
            disabled={!canAddToCart()}
          />
        </div>
      </div>
    </div>
  )
}

