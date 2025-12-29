'use client'

import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart/store'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    image: string
  }
  size?: string
  color?: string
  disabled?: boolean
}

export function AddToCartButton({ product, size, color, disabled }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    if (disabled) return
    
    addItem({ ...product, size, color })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || added}
      size="lg"
      className="w-full"
    >
      {added ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Added to Cart!
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          {disabled ? 'Out of Stock' : 'Add to Cart'}
        </>
      )}
    </Button>
  )
}

