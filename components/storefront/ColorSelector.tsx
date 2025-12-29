'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/format'

interface Color {
  color: string
  stock: number
  price?: number | null
  hex?: string
}

interface ColorSelectorProps {
  colors: Color[]
  selectedColor: string | null
  onColorSelect: (color: string) => void
  basePrice: number
}

export function ColorSelector({ colors, selectedColor, onColorSelect, basePrice }: ColorSelectorProps) {
  if (!colors || colors.length === 0) {
    return null
  }

  const getPrice = (color: Color) => {
    return color.price !== null && color.price !== undefined ? color.price : basePrice
  }

  const selectedColorData = selectedColor ? colors.find(c => c.color === selectedColor) : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Color *</Label>
        {selectedColorData && (
          <Badge 
            variant={selectedColorData.stock > 0 ? 'default' : 'destructive'}
            className="text-xs"
          >
            {selectedColorData.stock > 0 ? `${selectedColorData.stock} in stock` : 'Out of stock'}
          </Badge>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((colorOption) => {
          const isSelected = selectedColor === colorOption.color
          const isOutOfStock = colorOption.stock === 0
          const hasCustomPrice = colorOption.price !== null && colorOption.price !== undefined && colorOption.price !== basePrice
          
          return (
            <Button
              key={colorOption.color}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => !isOutOfStock && onColorSelect(colorOption.color)}
              disabled={isOutOfStock}
              className={cn(
                'h-14 px-4 flex items-center gap-3 font-medium transition-all duration-200 relative',
                isSelected && 'ring-2 ring-primary ring-offset-2 shadow-md scale-105',
                isOutOfStock && 'opacity-50 cursor-not-allowed grayscale',
                !isOutOfStock && !isSelected && 'hover:border-primary hover:scale-105'
              )}
            >
              {colorOption.hex ? (
                <div className="flex items-center gap-3">
                  <div 
                    className={cn(
                      'w-8 h-8 rounded-full border-2 flex-shrink-0',
                      isSelected ? 'border-white shadow-lg' : 'border-gray-300'
                    )}
                    style={{ backgroundColor: colorOption.hex }}
                  />
                  <div className="flex flex-col items-start">
                    <span>{colorOption.color}</span>
                    {hasCustomPrice && (
                      <span className="text-xs opacity-80">
                        {formatCurrency(colorOption.price!)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <span>{colorOption.color}</span>
              )}
              {isOutOfStock && (
                <span className="absolute top-1 right-1 text-[10px] text-destructive font-semibold">
                  OUT
                </span>
              )}
            </Button>
          )
        })}
      </div>
      {selectedColorData && selectedColorData.stock === 0 && (
        <p className="text-sm text-destructive font-medium">
          This color is currently out of stock
        </p>
      )}
    </div>
  )
}

