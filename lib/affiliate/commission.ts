import { createClient } from '@/lib/supabase/server'

const COMMISSION_RATE = 0.15 // 15%

export async function calculateCommission(
  affiliateId: string,
  orderId: string,
  orderTotal: number
) {
  const supabase = await createClient()

  // Calculate commission (15% of order total after discounts)
  const commissionAmount = orderTotal * COMMISSION_RATE

  // Create affiliate sale record
  const { error: saleError } = await supabase
    .from('affiliate_sales')
    .insert({
      affiliate_id: affiliateId,
      order_id: orderId,
      commission_rate: COMMISSION_RATE,
      commission_amount: commissionAmount,
      status: 'pending',
    })

  if (saleError) {
    console.error('Error creating affiliate sale:', saleError)
    return
  }

  // Update affiliate stats
  const { error: updateError } = await supabase.rpc('update_affiliate_stats', {
    affiliate_id: affiliateId,
    sale_amount: orderTotal,
    commission_amount: commissionAmount,
  })

  if (updateError) {
    console.error('Error updating affiliate stats:', updateError)
  }

  // Send email notification (will be implemented later)
  // await sendAffiliateSaleEmail(affiliateId, orderId, commissionAmount)
}

