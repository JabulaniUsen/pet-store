'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showValue = false,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const starSize = sizeClasses[size]
  const normalizedRating = Math.min(Math.max(rating, 0), maxRating)
  const fullStars = Math.floor(normalizedRating)
  const hasHalfStar = normalizedRating % 1 >= 0.5

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, index) => {
          const starValue = index + 1
          const isFull = starValue <= fullStars
          const isHalf = starValue === fullStars + 1 && hasHalfStar

          return (
            <Star
              key={index}
              className={cn(
                starSize,
                isFull || isHalf
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {normalizedRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

