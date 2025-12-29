'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/format'

interface Size {
  size: string
  stock: number
  price?: number | null
}

interface SizeSelectorProps {
  sizes: Size[]
  selectedSize: string | null
  onSizeSelect: (size: string) => void
  basePrice: number
}

export function SizeSelector({ sizes, selectedSize, onSizeSelect, basePrice }: SizeSelectorProps) {
  if (!sizes || sizes.length === 0) {
    return null
  }

  const getPrice = (size: Size) => {
    return size.price !== null && size.price !== undefined ? size.price : basePrice
  }

  const selectedSizeData = selectedSize ? sizes.find(s => s.size === selectedSize) : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Size *</Label>
        {selectedSizeData && (
          <Badge 
            variant={selectedSizeData.stock > 0 ? 'default' : 'destructive'}
            className="text-xs"
          >
            {selectedSizeData.stock > 0 ? `${selectedSizeData.stock} in stock` : 'Out of stock'}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((sizeOption) => {
          const isSelected = selectedSize === sizeOption.size
          const isOutOfStock = sizeOption.stock === 0
          const hasCustomPrice = sizeOption.price !== null && sizeOption.price !== undefined && sizeOption.price !== basePrice
          
          return (
            <Button
              key={sizeOption.size}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => !isOutOfStock && onSizeSelect(sizeOption.size)}
              disabled={isOutOfStock}
              className={cn(
                'min-w-[60px] h-12 px-4 font-medium transition-all duration-200',
                isSelected && 'ring-2 ring-primary ring-offset-2 shadow-md scale-105',
                isOutOfStock && 'opacity-50 cursor-not-allowed grayscale',
                !isOutOfStock && !isSelected && 'hover:border-primary hover:scale-105'
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span>{sizeOption.size}</span>
                {hasCustomPrice && (
                  <span className="text-xs opacity-80">
                    {formatCurrency(sizeOption.price!)}
                  </span>
                )}
              </div>
            </Button>
          )
        })}
      </div>
      {selectedSizeData && selectedSizeData.stock === 0 && (
        <p className="text-sm text-destructive font-medium">
          This size is currently out of stock
        </p>
      )}
    </div>
  )
}

