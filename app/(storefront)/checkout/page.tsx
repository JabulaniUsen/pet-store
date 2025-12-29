'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/cart/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { PayPalButton } from '@/components/payments/PayPalButton'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CheckoutFormData {
  email: string
  shippingName: string
  shippingStreet: string
  shippingCity: string
  shippingState: string
  shippingZip: string
  shippingCountry: string
  courier: string
  billingName: string
  billingStreet: string
  billingCity: string
  billingState: string
  billingZip: string
  billingCountry: string
  couponCode: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)
  const clearCart = useCartStore((state) => state.clearCart)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    shippingName: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'USA',
    courier: '',
    billingName: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'USA',
    couponCode: '',
  })

  const subtotal = getTotal()
  const discount = 0 // Will be calculated from coupon
  const total = subtotal - discount

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      // Auto-fill billing if "same as shipping" is checked
      if (sameAsShipping && field.startsWith('shipping')) {
        const billingField = field.replace('shipping', 'billing') as keyof CheckoutFormData
        updated[billingField] = value
      }
      return updated
    })
  }

  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked)
    if (checked) {
      // Copy shipping to billing
      setFormData((prev) => ({
        ...prev,
        billingName: prev.shippingName,
        billingStreet: prev.shippingStreet,
        billingCity: prev.shippingCity,
        billingState: prev.shippingState,
        billingZip: prev.shippingZip,
        billingCountry: prev.shippingCountry,
      }))
    }
  }

  const handlePayPalSuccess = async (paypalOrderId: string) => {
    // Automatically complete order after successful PayPal payment
    setLoading(true)
    await completeOrder(paypalOrderId)
  }

  const handlePayPalError = (error: string) => {
    console.error('PayPal error:', error)
    // Show more user-friendly error messages
    let userMessage = error
    if (error.includes('credentials not configured') || error.includes('placeholder')) {
      userMessage = 'PayPal is not properly configured. Please contact support or check server logs.'
    } else if (error.includes('authenticate')) {
      userMessage = 'PayPal authentication failed. Please check your credentials.'
    } else if (error.includes('Invalid credentials')) {
      userMessage = 'PayPal credentials are invalid. Please update your configuration.'
    }
    alert(userMessage || 'Payment failed. Please try again.')
    setLoading(false)
  }

  const completeOrder = async (paypalOrderIdParam?: string) => {
    setLoading(true)

    try {
      // Get affiliate ID from cookie if exists
      const affiliateId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('affiliate_id='))
        ?.split('=')[1]

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          email: formData.email,
          shippingAddress: {
            name: formData.shippingName,
            street: formData.shippingStreet,
            city: formData.shippingCity,
            state: formData.shippingState,
            zip: formData.shippingZip,
            country: formData.shippingCountry,
          },
          courier: formData.courier,
          billingAddress: sameAsShipping
            ? {
                name: formData.shippingName,
                street: formData.shippingStreet,
                city: formData.shippingCity,
                state: formData.shippingState,
                zip: formData.shippingZip,
                country: formData.shippingCountry,
              }
            : {
                name: formData.billingName,
                street: formData.billingStreet,
                city: formData.billingCity,
                state: formData.billingState,
                zip: formData.billingZip,
                country: formData.billingCountry,
              },
          couponCode: formData.couponCode || null,
          affiliateId: affiliateId || null,
          paypalOrderId: paypalOrderIdParam || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Checkout API error:', errorData)
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Checkout failed'
        throw new Error(errorMessage)
      }

      const { orderId, orderNumber } = await response.json()

      clearCart()
      router.push(`/order-confirmation?order=${orderNumber}`)
    } catch (error: any) {
      console.error('Checkout error:', error)
      const errorMessage = error?.message || 'Checkout failed. Please try again.'
      alert(`Error: ${errorMessage}\n\nPlease check the console for more details.`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // PayPal handles payment automatically, this is just for form submission
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <div className="m-auto max-w-7xl py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping & Billing Combined */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Checkout Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Shipping Address</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="shippingName">Full Name</Label>
                        <Input
                          id="shippingName"
                          required
                          value={formData.shippingName}
                          onChange={(e) => handleInputChange('shippingName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingStreet">Street Address</Label>
                        <Input
                          id="shippingStreet"
                          required
                          value={formData.shippingStreet}
                          onChange={(e) => handleInputChange('shippingStreet', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shippingCity">City</Label>
                          <Input
                            id="shippingCity"
                            required
                            value={formData.shippingCity}
                            onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="shippingState">State</Label>
                          <Input
                            id="shippingState"
                            required
                            value={formData.shippingState}
                            onChange={(e) => handleInputChange('shippingState', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shippingZip">ZIP Code</Label>
                          <Input
                            id="shippingZip"
                            required
                            value={formData.shippingZip}
                            onChange={(e) => handleInputChange('shippingZip', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="shippingCountry">Country</Label>
                          <Input
                            id="shippingCountry"
                            required
                            value={formData.shippingCountry}
                            onChange={(e) => handleInputChange('shippingCountry', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Courier Selection */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Delivery Service</h3>
                    <div>
                      <Label htmlFor="courier">Select Delivery Courier</Label>
                      <Select
                        value={formData.courier}
                        onValueChange={(value) => handleInputChange('courier', value)}
                        required
                      >
                        <SelectTrigger id="courier" className="w-full">
                          <SelectValue placeholder="Choose a delivery service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UPS">UPS</SelectItem>
                          <SelectItem value="FedEx">FedEx</SelectItem>
                          <SelectItem value="USPS">United States Postal Service (USPS)</SelectItem>
                          <SelectItem value="DHL">DHL</SelectItem>
                          <SelectItem value="OnTrac">OnTrac</SelectItem>
                          <SelectItem value="LaserShip">LaserShip</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="sameAsShipping"
                        checked={sameAsShipping}
                        onCheckedChange={(checked: boolean) => handleSameAsShippingChange(checked)}
                      />
                      <Label htmlFor="sameAsShipping" className="font-normal cursor-pointer">
                        Billing address same as shipping
                      </Label>
                    </div>
                    
                    {!sameAsShipping && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-4">Billing Address</h3>
                        <div>
                          <Label htmlFor="billingName">Full Name</Label>
                          <Input
                            id="billingName"
                            required
                            value={formData.billingName}
                            onChange={(e) => handleInputChange('billingName', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="billingStreet">Street Address</Label>
                          <Input
                            id="billingStreet"
                            required
                            value={formData.billingStreet}
                            onChange={(e) => handleInputChange('billingStreet', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingCity">City</Label>
                            <Input
                              id="billingCity"
                              required
                              value={formData.billingCity}
                              onChange={(e) => handleInputChange('billingCity', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingState">State</Label>
                            <Input
                              id="billingState"
                              required
                              value={formData.billingState}
                              onChange={(e) => handleInputChange('billingState', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingZip">ZIP Code</Label>
                            <Input
                              id="billingZip"
                              required
                              value={formData.billingZip}
                              onChange={(e) => handleInputChange('billingZip', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingCountry">Country</Label>
                            <Input
                              id="billingCountry"
                              required
                              value={formData.billingCountry}
                              onChange={(e) => handleInputChange('billingCountry', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="button" onClick={() => setStep(2)} className="w-full">
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                    <Input
                      id="couponCode"
                      value={formData.couponCode}
                      onChange={(e) => handleInputChange('couponCode', e.target.value)}
                    />
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
                    
                    {/* Test Payment Button - Bypass PayPal */}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 mb-3 font-medium">🧪 Test Mode</p>
                      <Button
                        type="button"
                        onClick={() => completeOrder()}
                        disabled={loading}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Complete Order (Test Mode)'
                        )}
                      </Button>
                      <p className="text-xs text-yellow-700 mt-2">
                        This will complete the order without PayPal payment for testing purposes.
                      </p>
                    </div>

                    {/* PayPal Payment */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-3">Pay with PayPal</p>
                      <PayPalButton
                        amount={total}
                        onSuccess={handlePayPalSuccess}
                        onError={handlePayPalError}
                        disabled={loading}
                      />
                    </div>
                    
                    {loading && (
                      <div className="mt-4 flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                        <span className="text-sm text-gray-600">Processing your order...</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)} 
                    disabled={loading}
                    className="w-full"
                  >
                    Back
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

