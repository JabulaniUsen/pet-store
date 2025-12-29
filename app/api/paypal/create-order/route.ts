import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()

    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const paypalClientId = process.env.PAYPAL_CLIENT_ID
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET
    const paypalApiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'

    if (!paypalClientId || !paypalClientSecret) {
      console.error('PayPal credentials missing:', {
        hasClientId: !!paypalClientId,
        hasClientSecret: !!paypalClientSecret,
        clientIdValue: paypalClientId?.substring(0, 10) + '...',
      })
      return NextResponse.json(
        { 
          error: 'PayPal credentials not configured',
          message: 'Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env.local file'
        },
        { status: 500 }
      )
    }

    // Check if credentials are still placeholders
    if (paypalClientId === 'your_paypal_client_id_here' || paypalClientSecret === 'your_paypal_client_secret_here') {
      return NextResponse.json(
        { 
          error: 'PayPal credentials not configured',
          message: 'Please replace the placeholder values in .env.local with your actual PayPal Client ID and Secret'
        },
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
      const errorText = await tokenResponse.text()
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: errorText }
      }
      console.error('PayPal token error:', error, 'Status:', tokenResponse.status)
      return NextResponse.json(
        { 
          error: 'Failed to authenticate with PayPal',
          details: error.message || error.error_description || 'Invalid credentials',
          status: tokenResponse.status
        },
        { status: 500 }
      )
    }

    const { access_token } = await tokenResponse.json()

    // Create order
    const orderResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
          },
        ],
      }),
    })

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text()
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: errorText }
      }
      console.error('PayPal order creation error:', error, 'Status:', orderResponse.status)
      return NextResponse.json(
        { 
          error: 'Failed to create PayPal order',
          details: error.message || error.name || 'Unknown error',
          status: orderResponse.status
        },
        { status: 500 }
      )
    }

    const order = await orderResponse.json()

    return NextResponse.json({
      orderId: order.id,
    })
  } catch (error: any) {
    console.error('PayPal create order error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create order',
        details: error.stack || 'Unknown server error'
      },
      { status: 500 }
    )
  }
}

