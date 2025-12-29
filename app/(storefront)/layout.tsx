import { Suspense } from 'react'
import { Header } from '@/components/storefront/Header'
import { Footer } from '@/components/storefront/Footer'
import { PayPalProvider } from '@/components/payments/PayPalProvider'
import { AffiliateLinkPreserver } from '@/components/storefront/AffiliateLinkPreserver'

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PayPalProvider>
      <Suspense fallback={null}>
        <AffiliateLinkPreserver />
      </Suspense>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </PayPalProvider>
  )
}

