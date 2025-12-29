import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/requireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AffiliateStats } from '@/components/affiliate/AffiliateStats'
import { ReferralLinks } from '@/components/affiliate/ReferralLinks'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { redirect } from 'next/navigation'

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

export default async function AffiliateDashboardPage() {
  const { user } = await requireAuth()
  const supabase = await createClient()

  // Get affiliate record - only select needed fields for performance
  const { data: affiliate, error: affiliateError } = await supabase
    .from('affiliates')
    .select('id, affiliate_code, status, total_clicks, total_sales, total_earnings')
    .eq('user_id', user.id)
    .single()

  if (affiliateError || !affiliate) {
    redirect('/affiliate/signup')
  }

  // Get sales history - limit to 50 most recent for performance
  const { data: sales, error: salesError } = await supabase
    .from('affiliate_sales')
    .select(
      `
      id,
      commission_amount,
      status,
      created_at,
      orders (
        order_number,
        total,
        created_at,
        status
      )
    `
    )
    .eq('affiliate_id', affiliate.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (salesError) {
    console.error('Error fetching sales:', salesError)
  }

  return (
    <div className="mx-auto max-w-7xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Affiliate Dashboard</h1>
        <p className="text-muted-foreground">
          Track your performance and earnings
        </p>
      </div>

      {affiliate.status !== 'approved' && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your affiliate account status: <strong>{affiliate.status}</strong>.
            {affiliate.status === 'pending' && ' Please wait for admin approval.'}
            {affiliate.status === 'rejected' && ' Your application was rejected. Please contact support.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-8">
        <AffiliateStats
          clicks={affiliate.total_clicks}
          sales={affiliate.total_sales}
          earnings={affiliate.total_earnings}
        />

        <ReferralLinks affiliateCode={affiliate.affiliate_code} baseUrl={getBaseUrl()} />

        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
          </CardHeader>
          <CardContent>
            {!sales || sales.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No sales yet. Start sharing your referral links!
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Order Total</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale: any) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-mono">
                        {sale.orders?.order_number || 'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(sale.orders?.created_at || sale.created_at)}</TableCell>
                      <TableCell>{formatCurrency(sale.orders?.total || 0)}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatCurrency(sale.commission_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sale.status === 'paid' ? 'default' : 'secondary'}>
                          {sale.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

