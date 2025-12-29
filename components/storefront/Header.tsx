'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart/store'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function Header() {
  const itemCount = useCartStore((state) => state.getItemCount())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Fetch user role if logged in
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setUserRole(userData?.role || null)
      } else {
        setUserRole(null)
      }
      
      setLoading(false)
    }
    checkUser()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        setUserRole(userData?.role || null)
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])
  
  const getDashboardUrl = () => {
    if (!user) return '/login'
    if (userRole === 'admin') return '/admin'
    // Check if user has affiliate account
    return '/dashboard'
  }

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setLogoutDialogOpen(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Still close dialog and redirect even if there's an error
      setLogoutDialogOpen(false)
      router.push('/')
      router.refresh()
    }
  }

  return (
    <header className="w-full bg-white sticky top-0 z-50">
      {/* Top Bar - Hidden on mobile */}
      <div className="bg-gray-100 border-b border-gray-200 hidden md:block">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4 lg:gap-6">
            <a href="tel:+3798718371" className="hover:text-black transition-colors">+379 871-8371</a>
            <a href="mailto:rgarton@outlook.com" className="hover:text-black transition-colors hidden lg:inline">rgarton@outlook.com</a>
          </div>
          <div className="hidden xl:block">
            <span>8592 Fairground St. Tallahassee, FL 32303</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-2xl">🐾</span>
              <span className="text-lg sm:text-xl font-bold">Pet Shop</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              <Link
                href="/"
                className="text-sm font-medium text-black border-b-2 border-primary pb-1"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Contact Us
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Search */}
              <div className="relative hidden xl:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 pr-4 w-64 h-9 border-gray-300"
                />
              </div>

              {/* Mobile Search Button */}
              <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="xl:hidden">
                    <Search className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pl-10 pr-4 h-10 border-gray-300"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Cart Icon */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Icon - Always show, with dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={getDashboardUrl()} className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setLogoutDialogOpen(true)}
                        className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Login
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t py-4 animate-in slide-in-from-top">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-black py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-sm font-medium text-gray-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-medium text-gray-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-medium text-gray-600 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Us
                </Link>
                {user ? (
                  <>
                    <Link
                      href={getDashboardUrl()}
                      className="text-sm font-medium text-gray-600 py-2 flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      {userRole === 'admin' ? 'Admin Dashboard' : 'Affiliate Dashboard'}
                    </Link>
                    <Link
                      href="/orders"
                      className="text-sm font-medium text-gray-600 py-2 flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        setLogoutDialogOpen(true)
                      }}
                      className="text-sm font-medium text-gray-600 py-2 flex items-center gap-2 text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 py-2 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Account
                  </Link>
                )}
                <Link
                  href="/cart"
                  className="text-sm font-medium text-gray-600 py-2 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}

