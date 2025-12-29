'use client'

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { OnApproveData, OnApproveActions, CreateOrderData, CreateOrderActions } from '@paypal/paypal-js'

interface PayPalButtonProps {
  amount: number
  onSuccess: (orderId: string) => void
  onError?: (error: string) => void
  disabled?: boolean
}

function PayPalButtonContent({ amount, onSuccess, onError, disabled }: PayPalButtonProps) {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer()

  const createOrder = async (_data: CreateOrderData, actions: CreateOrderActions) => {
    try {
      // Create order on server
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        const errorMessage = error.details || error.message || 'Failed to create PayPal order'
        throw new Error(errorMessage)
      }

      const { orderId } = await response.json()
      return orderId
    } catch (error: any) {
      onError?.(error.message || 'Failed to create order')
      throw error
    }
  }

  const onApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    try {
      if (!actions.order) {
        throw new Error('Order actions not available')
      }

      // Capture the payment
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to capture payment')
      }

      const captureData = await response.json()
      
      // Call success callback with PayPal order ID
      onSuccess(data.orderID)
    } catch (error: any) {
      onError?.(error.message || 'Failed to process payment')
    }
  }

  const onErrorHandler = (err: any) => {
    onError?.(err.message || 'Payment failed')
  }

  // Show error if PayPal script failed to load
  if (isRejected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 mb-2">
          PayPal is not configured. Please set NEXT_PUBLIC_PAYPAL_CLIENT_ID in your environment variables.
        </p>
        <p className="text-xs text-yellow-600">
          To enable PayPal payments, add your PayPal Client ID to .env.local file.
        </p>
      </div>
    )
  }

  // Show loading state
  if (isPending || !isResolved) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-gray-600">Loading PayPal...</span>
      </div>
    )
  }

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={onErrorHandler}
      disabled={disabled}
      style={{
        layout: 'vertical',
        color: 'black',
        shape: 'rect',
        label: 'paypal',
      }}
      fundingSource="paypal"
    />
  )
}

export function PayPalButton(props: PayPalButtonProps) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''
  
  // If PayPal is not configured, show helpful message
  if (!paypalClientId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-yellow-800 mb-2">
          ⚠️ PayPal Not Configured
        </p>
        <p className="text-xs text-yellow-700 mb-3">
          To enable PayPal payments, add your PayPal Client ID to your .env.local file:
        </p>
        <code className="text-xs bg-yellow-100 p-2 rounded block">
          NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id_here
        </code>
        <p className="text-xs text-yellow-600 mt-3">
          Get your Client ID from{' '}
          <a 
            href="https://developer.paypal.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline"
          >
            PayPal Developer Dashboard
          </a>
        </p>
      </div>
    )
  }

  // Render the actual PayPal button component
  return <PayPalButtonContent {...props} />
}

