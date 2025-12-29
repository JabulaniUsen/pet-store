'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Check } from 'lucide-react'

interface ReferralLinksProps {
  affiliateCode: string
  baseUrl?: string
}

export function ReferralLinks({ affiliateCode, baseUrl: baseUrlProp }: ReferralLinksProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const baseUrl = baseUrlProp || (typeof window !== 'undefined' ? window.location.origin : '')

  const links = {
    homepage: `${baseUrl}/?ref=${affiliateCode}`,
    products: `${baseUrl}/products?ref=${affiliateCode}`,
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Referral Links</CardTitle>
        <CardDescription>
          Share these links to start earning commissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Homepage Link</Label>
          <div className="flex gap-2 mt-1">
            <Input value={links.homepage} readOnly />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(links.homepage, 'homepage')}
            >
              {copied === 'homepage' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <Label>Products Page Link</Label>
          <div className="flex gap-2 mt-1">
            <Input value={links.products} readOnly />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(links.products, 'products')}
            >
              {copied === 'products' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> To link to a specific product, add{' '}
            <code className="bg-background px-1 py-0.5 rounded">?ref={affiliateCode}</code> to
            any product URL.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

