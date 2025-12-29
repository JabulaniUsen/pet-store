'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SortDropdownProps {
  currentSort: string
  searchParams: Record<string, string>
}

export function SortDropdown({ currentSort, searchParams }: SortDropdownProps) {
  const router = useRouter()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams as any)
    if (value === 'latest') {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }
    // Reset to page 1 when sorting changes
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-full sm:w-[180px] bg-gray-100 border-gray-200">
        <SelectValue placeholder="Sort by latest" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="latest">Sort by latest</SelectItem>
        <SelectItem value="price-low">Price: Low to High</SelectItem>
        <SelectItem value="price-high">Price: High to Low</SelectItem>
      </SelectContent>
    </Select>
  )
}

