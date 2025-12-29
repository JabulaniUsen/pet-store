import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import { ShoppingCart, Package, TrendingUp, User, LogOut, BarChart3 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/storefront/LogoutButton'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { user } = await requireAuth()
  const supabase = await createClient()

  // Get user data
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Redirect admin to admin dashboard
  if (userData?.role === 'admin') {
    redirect('/admin')
  }

  // Check if user has an affiliate account
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id, status')
    .eq('user_id', user.id)
    .single()

  const hasAffiliateAccount = !!affiliate

  // Get orders stats - check by both user_id and email to catch all orders
  // Fetch orders by user_id and email separately, then combine and deduplicate
  const [ordersByUserId, ordersByEmail] = await Promise.all([
    supabase
      .from('orders')
      .select('id, order_number, total, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('id, order_number, total, status, created_at')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
  ])

  // Combine and deduplicate orders by id
  const ordersMap = new Map()
  ordersByUserId.data?.forEach(order => ordersMap.set(order.id, order))
  ordersByEmail.data?.forEach(order => ordersMap.set(order.id, order))
  const orders = Array.from(ordersMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  if (ordersByUserId.error) {
    console.error('Error fetching orders by user_id:', ordersByUserId.error)
  }
  if (ordersByEmail.error) {
    console.error('Error fetching orders by email:', ordersByEmail.error)
  }

  const totalOrders = orders?.length || 0
  const totalSpent = orders?.reduce((sum, order) => {
    const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : Number(order.total || 0)
    return sum + orderTotal
  }, 0) || 0
  const recentOrders = orders
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) || []

  return (
    <div className="mx-auto max-w-7xl py-8 px-4">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Manage your account and track your orders.
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All-time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sm truncate">{user.email}</div>
            <p className="text-xs text-muted-foreground">Email address</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/orders">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View All Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/products">
                <Package className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            {hasAffiliateAccount ? (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/affiliate/dashboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Switch to Affiliate Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/affiliate/signup">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Become an Affiliate
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Button asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">Order {order.order_number ? `#${order.order_number}` : 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(typeof order.total === 'string' ? parseFloat(order.total) : Number(order.total || 0))}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
                {totalOrders > 5 && (
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/orders">View All Orders</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

