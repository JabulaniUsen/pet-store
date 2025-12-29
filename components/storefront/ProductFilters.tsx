'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
import Image from 'next/image'

interface ProductFiltersProps {
  categoryCounts: Record<string, number>
  bestSellers: Array<{
    id: string
    name: string
    slug: string
    price: number
    images?: string[]
    order_count?: number
  }>
}

const categories = [
  { name: 'Furniture', key: 'Furniture' },
  { name: 'Bowls', key: 'Bowls' },
  { name: 'Clothing', key: 'Clothing' },
  { name: 'Food', key: 'Food' },
  { name: 'Toys', key: 'Toys' },
  { name: 'Sale', key: 'Sale' },
]

const brands = [
  { name: 'Natural food', count: 28 },
  { name: 'Pet care', count: 18 },
  { name: 'Dogs friend', count: 16 },
  { name: 'Pet food', count: 40 },
  { name: 'Favorite pet', count: 28 },
  { name: 'Green line', count: 18 },
]

const tags = ['Dog food', 'Cat food', 'Natural', 'Parrot', 'Small dog', 'Cat']

export function ProductFilters({ categoryCounts, bestSellers }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const selectedCategories = searchParams.get('categories')?.split(',') || []
  const selectedBrands = searchParams.get('brands')?.split(',') || []
  const selectedTags = searchParams.get('tags')?.split(',') || []
  const minPrice = parseInt(searchParams.get('min_price') || '9')
  const maxPrice = parseInt(searchParams.get('max_price') || '399')
  
  const [priceRange, setPriceRange] = useState<number[]>([minPrice, maxPrice])
  const [localCategories, setLocalCategories] = useState<string[]>(selectedCategories)
  const [localBrands, setLocalBrands] = useState<string[]>(selectedBrands)

  useEffect(() => {
    setPriceRange([minPrice, maxPrice])
  }, [minPrice, maxPrice])

  const handleCategoryChange = (categoryKey: string) => {
    const newCategories = localCategories.includes(categoryKey)
      ? localCategories.filter(c => c !== categoryKey)
      : [...localCategories, categoryKey]
    setLocalCategories(newCategories)
  }

  const handleBrandChange = (brandName: string) => {
    const newBrands = localBrands.includes(brandName)
      ? localBrands.filter(b => b !== brandName)
      : [...localBrands, brandName]
    setLocalBrands(newBrands)
  }

  const handleApplyPrice = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('min_price', priceRange[0].toString())
    params.set('max_price', priceRange[1].toString())
    router.push(`/products?${params.toString()}`)
  }

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentTags = params.get('tags')?.split(',') || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    if (newTags.length > 0) {
      params.set('tags', newTags.join(','))
    } else {
      params.delete('tags')
    }
    router.push(`/products?${params.toString()}`)
  }

  const applyCategoryFilter = (categoryKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newCategories = localCategories.includes(categoryKey)
      ? localCategories.filter(c => c !== categoryKey)
      : [...localCategories, categoryKey]
    
    if (newCategories.length > 0) {
      params.set('categories', newCategories.join(','))
    } else {
      params.delete('categories')
    }
    router.push(`/products?${params.toString()}`)
  }

  const applyBrandFilter = (brandName: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newBrands = localBrands.includes(brandName)
      ? localBrands.filter(b => b !== brandName)
      : [...localBrands, brandName]
    
    if (newBrands.length > 0) {
      params.set('brands', newBrands.join(','))
    } else {
      params.delete('brands')
    }
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Filter by categories */}
      <div>
        <h3 className="font-bold text-black mb-4">Filter by categories</h3>
        <div className="space-y-3">
          {categories.map((category) => {
            const count = categoryCounts[category.key] || 0
            return (
              <div key={category.key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.key}`}
                    checked={localCategories.includes(category.key)}
                    onCheckedChange={() => {
                      handleCategoryChange(category.key)
                      applyCategoryFilter(category.key)
                    }}
                  />
                  <Label
                    htmlFor={`category-${category.key}`}
                    className="text-sm text-black cursor-pointer"
                  >
                    {category.name}
                  </Label>
                </div>
                <span className="text-sm text-orange-500">({count})</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter by Price */}
      <div>
        <h3 className="font-bold text-black mb-4">Filter by Price</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={500}
            step={1}
            className="w-full"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Price: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
            </p>
            <Button
              onClick={handleApplyPrice}
              className="bg-black text-white hover:bg-black/90 px-4 py-2 h-9"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Filter by brands */}
      <div>
        <h3 className="font-bold text-black mb-4">Filter by brands</h3>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.name}`}
                  checked={localBrands.includes(brand.name)}
                  onCheckedChange={() => {
                    handleBrandChange(brand.name)
                    applyBrandFilter(brand.name)
                  }}
                />
                <Label
                  htmlFor={`brand-${brand.name}`}
                  className="text-sm text-black cursor-pointer"
                >
                  {brand.name}
                </Label>
              </div>
              <span className="text-sm text-orange-500">({brand.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter by tags */}
      <div>
        <h3 className="font-bold text-black mb-4">Filter by tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Best Sellers */}
      <div>
        <h3 className="font-bold text-black mb-4">Best Sellers</h3>
        <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
          {bestSellers.length > 0 ? (
            bestSellers.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex gap-3 group"
              >
                <div className="relative w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized={product.images[0].startsWith('http')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate group-hover:text-orange-500 transition-colors">
                    {product.name}
                  </p>
                  <p className="text-sm font-semibold text-black">
                    {formatCurrency(product.price)}
                  </p>
                  {product.order_count && product.order_count > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {product.order_count} {product.order_count === 1 ? 'order' : 'orders'}
                    </p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500">No best sellers available</p>
          )}
        </div>
      </div>
    </div>
  )
}
