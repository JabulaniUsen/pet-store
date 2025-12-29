import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { CouponForm } from '@/components/admin/CouponForm'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  const supabase = await createClient()

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Coupons</h1>
        <p className="text-gray-600">Create and manage discount codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {coupons && coupons.length > 0 ? (
            <Card className="border-2 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-semibold text-gray-900">
                        {coupon.code}
                      </TableCell>
                      <TableCell className="capitalize text-gray-600">
                        {coupon.discount_type}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : formatCurrency(coupon.discount_value)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {coupon.used_count}
                        {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={coupon.status === 'active' ? 'default' : 'secondary'}
                        >
                          {coupon.status}
                        </Badge>
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
                <p className="text-gray-600">No coupons yet.</p>
              </div>
            </Card>
          )}
        </div>

        <div>
          <CouponForm />
        </div>
      </div>
    </div>
  )
}

