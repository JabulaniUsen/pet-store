'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ProductFilters } from './ProductFilters'
import { Filter } from 'lucide-react'

interface MobileFiltersButtonProps {
  categoryCounts: Record<string, number>
  popularProducts: Array<{
    id: string
    name: string
    slug: string
    price: number
    images?: string[]
  }>
}

export function MobileFiltersButton({ categoryCounts, popularProducts }: MobileFiltersButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="lg:hidden w-full sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ProductFilters 
            categoryCounts={categoryCounts}
            popularProducts={popularProducts}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

