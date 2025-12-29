'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AffiliateTrackerProps {
  affiliateCode: string
  productId?: string
}

export function AffiliateTracker({ affiliateCode, productId }: AffiliateTrackerProps) {
  useEffect(() => {
    const trackClick = async () => {
      try {
        const supabase = createClient()
        
        // Get affiliate by code
        const { data: affiliate, error: affiliateError } = await supabase
          .from('affiliates')
          .select('id')
          .eq('affiliate_code', affiliateCode.toUpperCase())
          .eq('status', 'approved')
          .single()

        if (affiliateError) {
          console.warn('Affiliate not found or not approved:', affiliateError)
          return
        }

        if (!affiliate) {
          console.warn('Affiliate not found for code:', affiliateCode)
          return
        }

        // Store affiliate ID in cookie for checkout
        document.cookie = `affiliate_id=${affiliate.id}; path=/; max-age=${60 * 60 * 24 * 30}` // 30 days
        
        // Store affiliate code in localStorage and cookie for link preservation
        if (typeof window !== 'undefined') {
          localStorage.setItem('affiliate_ref', affiliateCode.toUpperCase())
          document.cookie = `affiliate_ref=${affiliateCode.toUpperCase()}; path=/; max-age=${60 * 60 * 24 * 30}` // 30 days
        }

        // Log click event
        const { error: insertError } = await supabase.from('click_events').insert({
          affiliate_id: affiliate.id,
          product_id: productId || null,
          referrer_url: typeof document !== 'undefined' ? document.referrer : '',
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          ip_address: null, // Will be handled server-side if needed
        })

        if (insertError) {
          console.error('Error inserting click event:', insertError)
        }

        // Update affiliate click count using RPC
        const { error: rpcError } = await supabase.rpc('increment_affiliate_clicks', {
          affiliate_id: affiliate.id,
        })

        if (rpcError) {
          console.error('Error incrementing clicks via RPC:', rpcError)
        }
      } catch (error) {
        console.error('Error tracking affiliate click:', error)
      }
    }

    if (typeof window !== 'undefined') {
      trackClick()
    }
  }, [affiliateCode, productId])

  return null
}

