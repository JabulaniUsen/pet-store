'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface AffiliateActionsProps {
  affiliateId: string
  currentStatus: string
}

export function AffiliateActions({
  affiliateId,
  currentStatus,
}: AffiliateActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId, status: newStatus }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error updating affiliate status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus === 'approved') {
    return <span className="text-sm text-muted-foreground">Approved</span>
  }

  if (currentStatus === 'rejected') {
    return <span className="text-sm text-muted-foreground">Rejected</span>
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => handleStatusUpdate('approved')}
        disabled={loading}
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleStatusUpdate('rejected')}
        disabled={loading}
      >
        Reject
      </Button>
    </div>
  )
}

