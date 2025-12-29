import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/utils/format'
import { calculateCommission } from '@/lib/affiliate/commission'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      items,
      email,
      shippingAddress,
      billingAddress,
      courier,
      couponCode,
      affiliateId,
      paypalOrderId,
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip || !shippingAddress.country) {
      return NextResponse.json(
        { error: 'Complete shipping address is required' },
        { status: 400 }
      )
    }

    if (!billingAddress || !billingAddress.name || !billingAddress.street || !billingAddress.city || !billingAddress.state || !billingAddress.zip || !billingAddress.country) {
      return NextResponse.json(
        { error: 'Complete billing address is required' },
        { status: 400 }
      )
    }

    if (!courier || !courier.trim()) {
      return NextResponse.json(
        { error: 'Delivery courier is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    // Validate products and calculate total
    let subtotal = 0
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('price, stock')
        .eq('id', item.id)
        .single()

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.id} not found` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.name}` },
          { status: 400 }
        )
      }

      subtotal += product.price * item.quantity
    }

    // Validate and apply coupon if provided
    let discountAmount = 0
    let couponId = null
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('status', 'active')
        .single()

      if (coupon) {
        const now = new Date()
        const validFrom = new Date(coupon.valid_from)
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null

        if (now >= validFrom && (!validUntil || now <= validUntil)) {
          if (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) {
            if (!coupon.min_purchase || subtotal >= coupon.min_purchase) {
              if (coupon.discount_type === 'percentage') {
                discountAmount = subtotal * (coupon.discount_value / 100)
                if (coupon.max_discount) {
                  discountAmount = Math.min(discountAmount, coupon.max_discount)
                }
              } else {
                discountAmount = coupon.discount_value
              }
              couponId = coupon.id
            }
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discountAmount)
    const orderNumber = generateOrderNumber()

    // Verify PayPal payment if PayPal order ID is provided
    if (paypalOrderId) {
      const paypalClientId = process.env.PAYPAL_CLIENT_ID
      const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET
      const paypalApiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'

      if (paypalClientId && paypalClientSecret) {
        try {
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

          if (tokenResponse.ok) {
            const { access_token } = await tokenResponse.json()

            // Verify the order
            const orderResponse = await fetch(`${paypalApiUrl}/v2/checkout/orders/${paypalOrderId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
              },
            })

            if (orderResponse.ok) {
              const paypalOrder = await orderResponse.json()
              
              // Verify order status and amount
              if (paypalOrder.status !== 'COMPLETED') {
                return NextResponse.json(
                  { error: 'PayPal payment not completed' },
                  { status: 400 }
                )
              }

              // Verify amount matches
              const paypalAmount = parseFloat(paypalOrder.purchase_units[0]?.amount?.value || '0')
              if (Math.abs(paypalAmount - total) > 0.01) {
                return NextResponse.json(
                  { error: 'Payment amount mismatch' },
                  { status: 400 }
                )
              }
            }
          }
        } catch (error) {
          console.error('PayPal verification error:', error)
          return NextResponse.json(
            { error: 'Failed to verify PayPal payment' },
            { status: 500 }
          )
        }
      }
    }

    // Validate affiliate ID format if provided
    let validAffiliateId = null
    if (affiliateId) {
      // Check if affiliateId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(affiliateId)) {
        validAffiliateId = affiliateId
      } else {
        console.warn('Invalid affiliate ID format:', affiliateId)
      }
    }

    // Create order
    // For test mode (no paypalOrderId), set status to 'processing' to allow testing
    const orderStatus = paypalOrderId ? 'processing' : 'processing'
    
    // Ensure total is a number (not string) and convert to string for NUMERIC type
    const orderTotal = typeof total === 'string' ? parseFloat(total) : Number(total)
    const orderDiscount = typeof discountAmount === 'string' ? parseFloat(discountAmount) : Number(discountAmount)
    
    // Prepare order data
    const orderData: any = {
      order_number: orderNumber,
      email: email.trim(),
      status: orderStatus,
      total: orderTotal.toString(), // Convert to string for NUMERIC type
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      discount_amount: orderDiscount.toString(), // Convert to string for NUMERIC type
      courier: courier.trim(),
    }

    // Add optional fields only if they exist
    if (userId) {
      orderData.user_id = userId
    }
    if (couponCode?.trim()) {
      orderData.coupon_code = couponCode.trim()
    }
    if (validAffiliateId) {
      orderData.affiliate_id = validAffiliateId
    }
    
    console.log('Creating order with data:', {
      ...orderData,
      shipping_address: '...',
      billing_address: '...',
    })
    
    // Use service client for order creation to bypass RLS
    const serviceClient = await createServiceClient()
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      console.error('Full error details:', JSON.stringify(orderError, null, 2))
      console.error('Order data attempted:', orderData)
      return NextResponse.json(
        { 
          error: 'Failed to create order', 
          details: orderError.message, 
          code: orderError.code,
          hint: orderError.hint 
        },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price),
      subtotal: (typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price)) * item.quantity,
      size: item.size || null,
      color: item.color || null,
    }))

    const { error: itemsError } = await serviceClient
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // Update product stock
    for (const item of items) {
      const { data: product } = await serviceClient
        .from('products')
        .select('sizes, colors, stock')
        .eq('id', item.id)
        .single()

      if (!product) continue

      let needsUpdate = false
      const updates: any = {}

      // Handle size-specific stock decrement
      if (item.size && product.sizes && Array.isArray(product.sizes)) {
        const updatedSizes = product.sizes.map((sizeOption: any) => {
          if (sizeOption.size === item.size) {
            return {
              ...sizeOption,
              stock: Math.max(0, (sizeOption.stock || 0) - item.quantity),
            }
          }
          return sizeOption
        })
        updates.sizes = updatedSizes
        needsUpdate = true
      }

      // Handle color-specific stock decrement
      if (item.color && product.colors && Array.isArray(product.colors)) {
        const updatedColors = product.colors.map((colorOption: any) => {
          if (colorOption.color === item.color) {
            return {
              ...colorOption,
              stock: Math.max(0, (colorOption.stock || 0) - item.quantity),
            }
          }
          return colorOption
        })
        updates.colors = updatedColors
        needsUpdate = true
      }

      if (needsUpdate) {
        const { error: variantStockError } = await serviceClient
          .from('products')
          .update(updates)
          .eq('id', item.id)

        if (variantStockError) {
          console.error(`Error decrementing variant stock for product ${item.id}:`, variantStockError)
        }
      } else if (!item.size && !item.color) {
        // Handle regular stock decrement (no size or color)
        const { error: stockError } = await serviceClient.rpc('decrement_product_stock', {
          product_id: item.id,
          quantity: item.quantity,
        })

        if (stockError) {
          console.error(`Error decrementing stock for product ${item.id}:`, stockError)
        }
      }
    }

    // Update coupon usage if applied
    if (couponId) {
      // Fetch current coupon to get used_count
      const { data: coupon } = await serviceClient
        .from('coupons')
        .select('used_count')
        .eq('id', couponId)
        .single()

      if (coupon) {
        await serviceClient
          .from('coupons')
          .update({ used_count: coupon.used_count + 1 })
          .eq('id', couponId)
      }
    }

    // Calculate and record affiliate commission if applicable
    if (validAffiliateId) {
      await calculateCommission(validAffiliateId, order.id, orderTotal)
    }

    // Send order confirmation email (will be implemented later)
    // await sendOrderConfirmationEmail(order.id)

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

