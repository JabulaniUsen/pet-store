import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Header } from '@/components/storefront/Header'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const { user } = await requireAuth()
  const supabase = await createClient()

  // Fetch orders by user_id and email separately, then combine and deduplicate
  const [ordersByUserId, ordersByEmail] = await Promise.all([
    supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            slug,
            images
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            slug,
            images
          )
        )
      `)
      .eq('email', user.email)
      .order('created_at', { ascending: false })
  ])

  // Combine and deduplicate orders by id
  const ordersMap = new Map()
  ordersByUserId.data?.forEach(order => ordersMap.set(order.id, order))
  ordersByEmail.data?.forEach(order => ordersMap.set(order.id, order))
  const orders = Array.from(ordersMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const error = ordersByUserId.error || ordersByEmail.error

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            View your order history and track shipments
          </p>
        </div>

        {error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading orders. Please try again.</p>
            </CardContent>
          </Card>
        ) : !orders || orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Order {order.order_number}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          order.status === 'delivered'
                            ? 'default'
                            : order.status === 'shipped'
                            ? 'secondary'
                            : order.status === 'processing'
                            ? 'outline'
                            : 'destructive'
                        }
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                      <span className="text-lg font-bold">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          {item.products?.images?.[0] && (
                            <img
                              src={item.products.images[0]}
                              alt={item.products.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.products?.name || 'Product'}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <Button variant="outline" asChild>
                      <Link href={`/track?order=${order.order_number}&email=${order.email}`}>
                        Track Order
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

