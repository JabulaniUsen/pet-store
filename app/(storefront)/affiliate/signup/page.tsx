'use client'

import { useState, useEffect } from 'react'

// Disable static generation for this page
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Countries with their dial codes
const COUNTRIES = [
  { name: 'United States', code: '+1' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'Canada', code: '+1' },
  { name: 'Australia', code: '+61' },
  { name: 'Germany', code: '+49' },
  { name: 'France', code: '+33' },
  { name: 'Italy', code: '+39' },
  { name: 'Spain', code: '+34' },
  { name: 'Netherlands', code: '+31' },
  { name: 'Belgium', code: '+32' },
  { name: 'Switzerland', code: '+41' },
  { name: 'Austria', code: '+43' },
  { name: 'Sweden', code: '+46' },
  { name: 'Norway', code: '+47' },
  { name: 'Denmark', code: '+45' },
  { name: 'Finland', code: '+358' },
  { name: 'Poland', code: '+48' },
  { name: 'Portugal', code: '+351' },
  { name: 'Greece', code: '+30' },
  { name: 'Ireland', code: '+353' },
  { name: 'Japan', code: '+81' },
  { name: 'South Korea', code: '+82' },
  { name: 'China', code: '+86' },
  { name: 'India', code: '+91' },
  { name: 'Brazil', code: '+55' },
  { name: 'Mexico', code: '+52' },
  { name: 'Argentina', code: '+54' },
  { name: 'Chile', code: '+56' },
  { name: 'South Africa', code: '+27' },
  { name: 'New Zealand', code: '+64' },
  { name: 'Singapore', code: '+65' },
  { name: 'Malaysia', code: '+60' },
  { name: 'Thailand', code: '+66' },
  { name: 'Philippines', code: '+63' },
  { name: 'Indonesia', code: '+62' },
  { name: 'Vietnam', code: '+84' },
  { name: 'Turkey', code: '+90' },
  { name: 'Russia', code: '+7' },
  { name: 'Saudi Arabia', code: '+966' },
  { name: 'United Arab Emirates', code: '+971' },
  { name: 'Israel', code: '+972' },
  { name: 'Egypt', code: '+20' },
  { name: 'Nigeria', code: '+234' },
  { name: 'Kenya', code: '+254' },
  { name: 'Other', code: '+' },
]

export default function AffiliateSignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [affiliateCode, setAffiliateCode] = useState('')
  const [country, setCountry] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [address, setAddress] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [trafficSource, setTrafficSource] = useState<'website' | 'youtube' | 'social_media' | 'others' | ''>('')
  const [trafficSourceOther, setTrafficSourceOther] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank_transfer' | ''>('')
  const [paypalEmail, setPaypalEmail] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankRoutingNumber, setBankRoutingNumber] = useState('')
  const [bankAccountHolderName, setBankAccountHolderName] = useState('')

  const generateCode = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const timestamp = Date.now().toString().slice(-4)
    setAffiliateCode(`${random}${timestamp}`)
  }

  // Auto-generate affiliate code on component mount
  useEffect(() => {
    if (!affiliateCode) {
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      const timestamp = Date.now().toString().slice(-4)
      setAffiliateCode(`${random}${timestamp}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry)
    const selected = COUNTRIES.find(c => c.name === selectedCountry)
    if (selected) {
      setCountryCode(selected.code)
      // If phone number is empty or doesn't start with the selected country code, set it
      if (!phoneNumber || !phoneNumber.startsWith(selected.code)) {
        // If there's an existing country code in the phone number, replace it
        if (phoneNumber.startsWith('+')) {
          const existingCode = COUNTRIES.find(c => phoneNumber.startsWith(c.code))?.code
          if (existingCode) {
            setPhoneNumber(phoneNumber.replace(existingCode, selected.code))
          } else {
            setPhoneNumber(selected.code)
          }
        } else {
          setPhoneNumber(selected.code)
        }
      }
    }
  }

  const handlePhoneNumberChange = (value: string) => {
    // Remove any non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '')
    
    // If we have a country code selected, ensure the number starts with it
    if (countryCode) {
      // If the cleaned value starts with the country code, use it as is
      if (cleaned.startsWith(countryCode)) {
        setPhoneNumber(cleaned)
      } 
      // If it starts with a different country code, update the country
      else if (cleaned.startsWith('+')) {
        const matchingCountry = COUNTRIES.find(c => cleaned.startsWith(c.code))
        if (matchingCountry) {
          setCountry(matchingCountry.name)
          setCountryCode(matchingCountry.code)
          setPhoneNumber(cleaned)
        } else {
          // Invalid country code, prepend the selected one
          setPhoneNumber(countryCode + cleaned.replace(/^\+/, ''))
        }
      }
      // If it doesn't start with +, prepend the country code
      else {
        setPhoneNumber(countryCode + cleaned)
      }
    } else {
      // No country selected yet, allow free-form input
      setPhoneNumber(cleaned)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        router.push('/login?redirect=' + encodeURIComponent('/affiliate/signup'))
        return
      }

      // Validate required fields
      if (!affiliateCode || !country || !address || !phoneNumber || !trafficSource || !paymentMethod) {
        throw new Error('Please fill in all required fields')
      }

      // Validate payment method specific fields
      if (paymentMethod === 'paypal' && !paypalEmail) {
        throw new Error('PayPal email is required')
      }

      if (paymentMethod === 'bank_transfer') {
        if (!bankName || !bankAccountNumber || !bankRoutingNumber || !bankAccountHolderName) {
          throw new Error('All bank transfer details are required')
        }
      }

      // Validate traffic source other
      if (trafficSource === 'others' && !trafficSourceOther.trim()) {
        throw new Error('Please specify how you want to drive sales')
      }

      const response = await fetch('/api/affiliate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          affiliateCode: affiliateCode.toUpperCase(),
          country,
          address,
          phoneNumber,
          trafficSource,
          trafficSourceOther: trafficSource === 'others' ? trafficSourceOther : null,
          paymentMethod,
          paypalEmail: paymentMethod === 'paypal' ? paypalEmail : null,
          bankName: paymentMethod === 'bank_transfer' ? bankName : null,
          bankAccountNumber: paymentMethod === 'bank_transfer' ? bankAccountNumber : null,
          bankRoutingNumber: paymentMethod === 'bank_transfer' ? bankRoutingNumber : null,
          bankAccountHolderName: paymentMethod === 'bank_transfer' ? bankAccountHolderName : null,
        }),
      })

      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (parseError) {
          console.error('Failed to parse JSON response:', parseError)
          throw new Error('Invalid response from server. Please try again.')
        }
      } else {
        const text = await response.text()
        console.error('Non-JSON response:', text)
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.details || `Failed to create affiliate account (${response.status})`
        console.error('API Error:', errorMessage, data)
        throw new Error(errorMessage)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/affiliate/dashboard')
      }, 2000)
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle>Application Submitted!</CardTitle>
              <CardDescription>
                Your affiliate application has been submitted and is pending approval.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You will be redirected to your dashboard shortly...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Become an Affiliate</h1>
          <p className="text-muted-foreground">
            Join our affiliate program and earn 15% commission on every sale you refer!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Affiliate Application</CardTitle>
            <CardDescription>
              Please provide the following information to complete your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Affiliate Code */}
              <div>
                <Label htmlFor="affiliateCode">Affiliate Code *</Label>
                <Input
                  id="affiliateCode"
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                  placeholder="Auto-generating..."
                  required
                  pattern="[A-Z0-9]+"
                  maxLength={12}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Your unique code will be used in referral links (automatically generated)
                </p>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div>
                  <Label htmlFor="country">Country of Origin *</Label>
                  <Select value={country} onValueChange={handleCountryChange} required>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((countryOption) => (
                        <SelectItem key={countryOption.name} value={countryOption.name}>
                          {countryOption.name} {countryOption.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your full address"
                    required
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    placeholder={countryCode ? `${countryCode} 1234567890` : "e.g., +1 234-567-8900"}
                    required
                  />
                  {countryCode && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Country code: {countryCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Traffic Source */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Marketing Channel</h3>
                
                <div>
                  <Label>How do you want to drive sales? *</Label>
                  <RadioGroup
                    value={trafficSource}
                    onValueChange={(value) => setTrafficSource(value as typeof trafficSource)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="website" id="website" />
                      <Label htmlFor="website" className="font-normal cursor-pointer">
                        Website
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="youtube" id="youtube" />
                      <Label htmlFor="youtube" className="font-normal cursor-pointer">
                        YouTube
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="social_media" id="social_media" />
                      <Label htmlFor="social_media" className="font-normal cursor-pointer">
                        Social Media
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="others" id="others" />
                      <Label htmlFor="others" className="font-normal cursor-pointer">
                        Others
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {trafficSource === 'others' && (
                    <div className="mt-2">
                      <Input
                        placeholder="Please specify how you plan to drive sales"
                        value={trafficSourceOther}
                        onChange={(e) => setTrafficSourceOther(e.target.value)}
                        required={trafficSource === 'others'}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Information</h3>
                
                <div>
                  <Label>Payment Method *</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="font-normal cursor-pointer">
                        PayPal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="font-normal cursor-pointer">
                        Bank Transfer
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* PayPal Fields */}
                {paymentMethod === 'paypal' && (
                  <div>
                    <Label htmlFor="paypalEmail">PayPal Email *</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required={paymentMethod === 'paypal'}
                    />
                  </div>
                )}

                {/* Bank Transfer Fields */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bankAccountHolderName">Account Holder Name *</Label>
                      <Input
                        id="bankAccountHolderName"
                        value={bankAccountHolderName}
                        onChange={(e) => setBankAccountHolderName(e.target.value)}
                        placeholder="Full name as on bank account"
                        required={paymentMethod === 'bank_transfer'}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g., Chase Bank"
                        required={paymentMethod === 'bank_transfer'}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bankAccountNumber">Account Number *</Label>
                        <Input
                          id="bankAccountNumber"
                          type="password"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          placeholder="Account number"
                          required={paymentMethod === 'bank_transfer'}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bankRoutingNumber">Routing Number *</Label>
                        <Input
                          id="bankRoutingNumber"
                          type="password"
                          value={bankRoutingNumber}
                          onChange={(e) => setBankRoutingNumber(e.target.value)}
                          placeholder="Routing number"
                          required={paymentMethod === 'bank_transfer'}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                  {error}
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">How it works:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Earn 15% commission on every sale made through your referral links</li>
                  <li>• Your application will be reviewed by our team</li>
                  <li>• Once approved, you'll get access to your affiliate dashboard</li>
                  <li>• Track your clicks, sales, and earnings in real-time</li>
                </ul>
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
