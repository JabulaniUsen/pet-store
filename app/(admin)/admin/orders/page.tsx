import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/auth'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  await requireAdmin() // Ensure user is admin
  const supabase = await createServiceClient() // Use service client to bypass RLS

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching orders:', error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600">View and manage customer orders</p>
        </div>
        <Card className="border-2">
          <div className="text-center py-12">
            <p className="text-destructive">Error loading orders: {error.message}</p>
          </div>
        </Card>
      </div>
    )
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
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600">View and manage customer orders</p>
      </div>

      {orders && orders.length > 0 ? (
        <Card className="border-2 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-semibold text-gray-900">{order.order_number}</TableCell>
                  <TableCell className="text-gray-600">{order.email}</TableCell>
                  <TableCell className="text-gray-600">{formatDate(order.created_at)}</TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[order.status] || ''}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild className="h-8">
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </Card>
      ) : (
        <Card className="border-2">
          <div className="text-center py-12">
            <p className="text-gray-600">No orders yet.</p>
          </div>
        </Card>
      )}
    </div>
  )
}

