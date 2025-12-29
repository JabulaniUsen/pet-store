'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  UserCheck,
  Store,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/affiliates', label: 'Affiliates', icon: UserCheck },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
]

export function AdminNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <span className="text-2xl">🐾</span>
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900 block">Admin Panel</span>
            <span className="text-xs text-gray-500">PetSpace</span>
          </div>
        </Link>
      </div>
      <nav className="p-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}>
              <Button 
                variant={active ? 'secondary' : 'ghost'} 
                size="lg"
                className={`w-full justify-start h-14 text-base ${
                  active 
                    ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                    : 'hover:bg-gray-100 text-gray-700 font-medium'
                }`}
              >
                <Icon className={`mr-4 h-6 w-6 ${active ? 'text-primary' : ''}`} />
                {item.label}
              </Button>
            </Link>
          )
        })}
        <div className="pt-6 mt-6 border-t">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="lg"
              className="w-full justify-start h-14 text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium"
            >
              <Store className="mr-4 h-6 w-6" />
              Back to Store
            </Button>
          </Link>
        </div>
      </nav>
    </>
  )
}

