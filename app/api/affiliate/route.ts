import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get affiliate stats
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'stats') {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get affiliate record
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (affiliateError || !affiliate) {
        return NextResponse.json(
          { error: 'Affiliate not found. Please sign up for an affiliate account first.' },
          { status: 404 }
        )
      }

      // Get sales history
      const { data: sales, error: salesError } = await supabase
        .from('affiliate_sales')
        .select(
          `
          *,
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

      return NextResponse.json({
        affiliate,
        sales: sales || [],
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=stats' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Affiliate API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create affiliate signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      affiliateCode,
      country,
      address,
      phoneNumber,
      trafficSource,
      trafficSourceOther,
      paymentMethod,
      paypalEmail,
      bankName,
      bankAccountNumber,
      bankRoutingNumber,
      bankAccountHolderName,
    } = body

    if (!userId || !affiliateCode) {
      return NextResponse.json(
        { error: 'User ID and affiliate code are required' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!country || !address || !phoneNumber || !trafficSource || !paymentMethod) {
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    // Validate payment method specific fields
    if (paymentMethod === 'paypal' && !paypalEmail) {
      return NextResponse.json(
        { error: 'PayPal email is required when selecting PayPal as payment method' },
        { status: 400 }
      )
    }

    if (paymentMethod === 'bank_transfer') {
      if (!bankName || !bankAccountNumber || !bankRoutingNumber || !bankAccountHolderName) {
        return NextResponse.json(
          { error: 'All bank transfer details are required' },
          { status: 400 }
        )
      }
    }

    // Validate traffic source other
    if (trafficSource === 'others' && !trafficSourceOther?.trim()) {
      return NextResponse.json(
        { error: 'Please specify how you want to drive sales when selecting Others' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if affiliate code already exists
    const { data: existing } = await supabase
      .from('affiliates')
      .select('id')
      .eq('affiliate_code', affiliateCode.toUpperCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Affiliate code already exists' },
        { status: 400 }
      )
    }

    // Check if user already has an affiliate record
    const { data: existingAffiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingAffiliate) {
      return NextResponse.json(
        { error: 'You already have an affiliate account' },
        { status: 400 }
      )
    }

    // Create affiliate record with all fields
    const affiliateData: any = {
      user_id: userId,
      affiliate_code: affiliateCode.toUpperCase(),
      status: 'pending',
      country,
      address,
      phone_number: phoneNumber,
      traffic_source: trafficSource,
      traffic_source_other: trafficSource === 'others' ? trafficSourceOther : null,
      payment_method: paymentMethod,
      paypal_email: paymentMethod === 'paypal' ? paypalEmail : null,
      bank_name: paymentMethod === 'bank_transfer' ? bankName : null,
      bank_account_number: paymentMethod === 'bank_transfer' ? bankAccountNumber : null,
      bank_routing_number: paymentMethod === 'bank_transfer' ? bankRoutingNumber : null,
      bank_account_holder_name: paymentMethod === 'bank_transfer' ? bankAccountHolderName : null,
    }

    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .insert(affiliateData)
      .select()
      .single()

    if (error) {
      console.error('Error creating affiliate:', error)
      return NextResponse.json(
        { error: 'Failed to create affiliate account', details: error.message },
        { status: 500 }
      )
    }

    // Send notification email (will be implemented later)
    // await sendAffiliateSignupNotification(affiliate.id)

    return NextResponse.json({ affiliate })
  } catch (error: any) {
    console.error('Affiliate signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

