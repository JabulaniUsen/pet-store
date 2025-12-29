'use client'

import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { ReactNode } from 'react'

interface PayPalProviderProps {
  children: ReactNode
}

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''

export function PayPalProvider({ children }: PayPalProviderProps) {
  // If no client ID, just render children without PayPal provider
  // This allows the app to work even without PayPal configured
  if (!paypalClientId) {
    console.warn('PayPal Client ID not configured. PayPal payment option will not be available.')
    return <>{children}</>
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons,marks,funding-eligibility',
      }}
    >
      {children}
    </PayPalScriptProvider>
  )
}

