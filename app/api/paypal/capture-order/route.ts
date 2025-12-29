import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const paypalClientId = process.env.PAYPAL_CLIENT_ID
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET
    const paypalApiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'

    if (!paypalClientId || !paypalClientSecret) {
      return NextResponse.json(
        { error: 'PayPal credentials not configured' },
        { status: 500 }
      )
    }

    // Get access token
    const auth = Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')
    const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json()
      console.error('PayPal token error:', error)
      return NextResponse.json(
        { error: 'Failed to authenticate with PayPal' },
        { status: 500 }
      )
    }

    const { access_token } = await tokenResponse.json()

    // Capture the order
    const captureResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!captureResponse.ok) {
      const error = await captureResponse.json()
      console.error('PayPal capture error:', error)
      return NextResponse.json(
        { error: 'Failed to capture payment' },
        { status: 500 }
      )
    }

    const captureData = await captureResponse.json()

    return NextResponse.json({
      success: true,
      orderId: captureData.id,
      status: captureData.status,
      payer: captureData.payer,
      purchaseUnits: captureData.purchase_units,
    })
  } catch (error: any) {
    console.error('PayPal capture order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to capture order' },
      { status: 500 }
    )
  }
}

