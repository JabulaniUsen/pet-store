'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'

export function CouponForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    valid_days: '30',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const validFrom = new Date()
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + parseInt(formData.valid_days))

      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : null,
          max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
          usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
          valid_from: validFrom.toISOString(),
          valid_until: validUntil.toISOString(),
          status: 'active',
        }),
      })

      if (response.ok) {
        router.refresh()
        setFormData({
          code: '',
          discount_type: 'percentage',
          discount_value: '',
          min_purchase: '',
          max_discount: '',
          usage_limit: '',
          valid_days: '30',
        })
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Coupon</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div>
            <Label htmlFor="discount_type">Discount Type</Label>
            <Select
              value={formData.discount_type}
              onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="discount_value">
              Discount Value {formData.discount_type === 'percentage' ? '(%)' : '($)'}
            </Label>
            <Input
              id="discount_value"
              type="number"
              step="0.01"
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="min_purchase">Min Purchase (optional)</Label>
            <Input
              id="min_purchase"
              type="number"
              step="0.01"
              value={formData.min_purchase}
              onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
            />
          </div>
          {formData.discount_type === 'percentage' && (
            <div>
              <Label htmlFor="max_discount">Max Discount (optional)</Label>
              <Input
                id="max_discount"
                type="number"
                step="0.01"
                value={formData.max_discount}
                onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
              />
            </div>
          )}
          <div>
            <Label htmlFor="usage_limit">Usage Limit (optional)</Label>
            <Input
              id="usage_limit"
              type="number"
              value={formData.usage_limit}
              onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="valid_days">Valid for (days)</Label>
            <Input
              id="valid_days"
              type="number"
              value={formData.valid_days}
              onChange={(e) => setFormData({ ...formData, valid_days: e.target.value })}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            Create Coupon
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

