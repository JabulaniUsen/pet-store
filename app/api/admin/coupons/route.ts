import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/auth'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    const supabase = await createClient()

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error('Error creating coupon:', error)
      return NextResponse.json(
        { error: 'Failed to create coupon' },
        { status: 500 }
      )
    }

    return NextResponse.json({ coupon })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

