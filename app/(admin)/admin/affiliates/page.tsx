import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { AffiliateActions } from '@/components/admin/AffiliateActions'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

export default async function AdminAffiliatesPage() {
  const supabase = await createClient()

  const { data: affiliates } = await supabase
    .from('affiliates')
    .select(`
      *,
      users (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Affiliates</h1>
        <p className="text-gray-600">Manage affiliate accounts and commissions</p>
      </div>

      {affiliates && affiliates.length > 0 ? (
        <Card className="border-2 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate Code</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((affiliate: any) => (
                <TableRow key={affiliate.id}>
                  <TableCell className="font-mono font-semibold text-gray-900">
                    {affiliate.affiliate_code}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {affiliate.users?.full_name || affiliate.users?.email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        affiliate.status === 'approved'
                          ? 'default'
                          : affiliate.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {affiliate.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{affiliate.total_clicks}</TableCell>
                  <TableCell className="text-gray-600">{affiliate.total_sales}</TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {formatCurrency(affiliate.total_earnings)}
                  </TableCell>
                  <TableCell className="text-right">
                    <AffiliateActions
                      affiliateId={affiliate.id}
                      currentStatus={affiliate.status}
                    />
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
            <p className="text-gray-600">No affiliates yet.</p>
          </div>
        </Card>
      )}
    </div>
  )
}

