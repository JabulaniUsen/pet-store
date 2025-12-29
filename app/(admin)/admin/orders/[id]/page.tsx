import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { OrderStatusUpdate } from '@/components/admin/OrderStatusUpdate'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const supabase = await createServiceClient()
  const resolvedParams = await params

  const { data: order, error } = await supabase
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
      ),
      affiliates (
        affiliate_code,
        users (
          email,
          full_name
        )
      )
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (error || !order) {
    console.error('Error fetching order:', error)
    notFound()
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Order Details</h1>
          <p className="text-gray-600">View and manage order information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order Summary</CardTitle>
                <Badge
                  variant="outline"
                  className={statusColors[order.status] || ''}
                >
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-mono font-semibold">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-semibold">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{order.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-semibold text-primary text-lg">
                    {formatCurrency(Number(order.total))}
                  </p>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="font-semibold">
                        {formatCurrency(Number(order.total) + Number(order.discount_amount))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Discount</p>
                      <p className="font-semibold text-green-600">
                        -{formatCurrency(Number(order.discount_amount))}
                      </p>
                    </div>
                  </>
                )}
                {order.coupon_code && (
                  <div>
                    <p className="text-sm text-muted-foreground">Coupon Code</p>
                    <p className="font-semibold">{order.coupon_code}</p>
                  </div>
                )}
                {order.courier && (
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Service</p>
                    <p className="font-semibold">{order.courier}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{item.products?.name || 'Product'}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {formatCurrency(Number(item.price))}
                      </p>
                      {item.products?.slug && (
                        <Link
                          href={`/products/${item.products.slug}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View Product
                        </Link>
                      )}
                    </div>
                    <p className="font-semibold">{formatCurrency(Number(item.subtotal))}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-semibold">{order.shipping_address?.name}</p>
                <p>{order.shipping_address?.street}</p>
                <p>
                  {order.shipping_address?.city}, {order.shipping_address?.state}{' '}
                  {order.shipping_address?.zip}
                </p>
                <p>{order.shipping_address?.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-semibold">{order.billing_address?.name}</p>
                <p>{order.billing_address?.street}</p>
                <p>
                  {order.billing_address?.city}, {order.billing_address?.state}{' '}
                  {order.billing_address?.zip}
                </p>
                <p>{order.billing_address?.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
            </CardContent>
          </Card>

          {/* Affiliate Information */}
          {order.affiliate_id && order.affiliates && (
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle>Affiliate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Affiliate Code</p>
                  <p className="font-mono font-semibold">
                    {order.affiliates.affiliate_code}
                  </p>
                </div>
                {order.affiliates.users && (
                  <div>
                    <p className="text-sm text-muted-foreground">Affiliate</p>
                    <p className="font-semibold">
                      {order.affiliates.users.full_name || order.affiliates.users.email}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

