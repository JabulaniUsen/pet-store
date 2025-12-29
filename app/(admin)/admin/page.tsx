import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { DollarSign, ShoppingCart, Users, UserCheck, TrendingUp, ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  await requireAdmin() // Ensure user is admin
  const supabase = await createServiceClient() // Use service client to bypass RLS

  // Get analytics data
  const [ordersResult, usersResult, affiliatesResult, salesResult, recentOrdersResult, pendingAffiliatesResult] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('affiliates').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('total'),
    supabase.from('orders').select('order_number, total, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('affiliates').select('id, status').eq('status', 'pending'),
  ])

  const totalOrders = ordersResult.count || 0
  const totalUsers = usersResult.count || 0
  const totalAffiliates = affiliatesResult.count || 0
  const totalSales =
    salesResult.data?.reduce((sum, order) => {
      const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : Number(order.total || 0)
      return sum + orderTotal
    }, 0) || 0

  const recentOrders = recentOrdersResult.data || []
  const pendingAffiliates = pendingAffiliatesResult.data || []

  // Log errors for debugging
  if (ordersResult.error) {
    console.error('Error fetching orders count:', ordersResult.error)
  }
  if (usersResult.error) {
    console.error('Error fetching users count:', usersResult.error)
  }
  if (affiliatesResult.error) {
    console.error('Error fetching affiliates count:', affiliatesResult.error)
  }
  if (salesResult.error) {
    console.error('Error fetching sales data:', salesResult.error)
  }

  const statCards = [
    {
      title: 'Total Sales',
      value: formatCurrency(totalSales),
      description: 'All-time revenue',
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      description: 'All orders',
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      description: 'Registered users',
      icon: Users,
      color: 'text-purple-600 bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Affiliates',
      value: totalAffiliates.toLocaleString(),
      description: 'Active affiliates',
      icon: UserCheck,
      color: 'text-orange-600 bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders from your store</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">#{order.order_number}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-gray-900">{formatCurrency(order.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>
            )}
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Affiliates */}
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
              <CardDescription>Affiliate applications awaiting review</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/affiliates">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingAffiliates.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <UserCheck className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {pendingAffiliates.length} Pending {pendingAffiliates.length === 1 ? 'Application' : 'Applications'}
                      </p>
                      <p className="text-xs text-gray-600">Requires your review</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-3 bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-gray-500">All caught up! No pending approvals.</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/affiliates">Manage Affiliates</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/admin/products/new">
                <Package className="h-5 w-5 mb-2" />
                <span className="font-semibold">Add Product</span>
                <span className="text-xs text-gray-500 mt-1">Create new product</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/admin/orders">
                <ShoppingCart className="h-5 w-5 mb-2" />
                <span className="font-semibold">View Orders</span>
                <span className="text-xs text-gray-500 mt-1">Manage orders</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/admin/coupons">
                <TrendingUp className="h-5 w-5 mb-2" />
                <span className="font-semibold">Create Coupon</span>
                <span className="text-xs text-gray-500 mt-1">Add discount code</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/admin/users">
                <Users className="h-5 w-5 mb-2" />
                <span className="font-semibold">Manage Users</span>
                <span className="text-xs text-gray-500 mt-1">View all users</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

