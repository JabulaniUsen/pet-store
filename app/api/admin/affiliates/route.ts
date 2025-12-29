import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/auth'

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { affiliateId, status } = body

    if (!affiliateId || !status) {
      return NextResponse.json(
        { error: 'Affiliate ID and status are required' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('affiliates')
      .update({ status })
      .eq('id', affiliateId)

    if (error) {
      console.error('Error updating affiliate:', error)
      return NextResponse.json(
        { error: 'Failed to update affiliate' },
        { status: 500 }
      )
    }

    // Send email notification (will be implemented later)
    // await sendAffiliateStatusEmail(affiliateId, status)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

