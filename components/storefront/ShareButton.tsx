'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Share2, Copy, Check, Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ShareButtonProps {
  productSlug: string
  productName: string
}

export function ShareButton({ productSlug, productName }: ShareButtonProps) {
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const checkAffiliateStatus = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          return
        }

        // Check if user has an approved affiliate account
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('affiliate_code')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .single()

        if (affiliate) {
          setAffiliateCode(affiliate.affiliate_code)
        }
      } catch (error) {
        // Silently fail - user might not be an affiliate, which is fine
        console.debug('Affiliate check:', error)
      }
    }

    checkAffiliateStatus()
  }, [])

  const getShareUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const productUrl = `${baseUrl}/products/${productSlug}`
    
    // Use user's affiliate code if they are an affiliate, otherwise use stored ref from referral
    const codeToUse = affiliateCode || (typeof window !== 'undefined' ? localStorage.getItem('affiliate_ref') : null)
    
    if (codeToUse) {
      return `${productUrl}?ref=${codeToUse}`
    }
    
    return productUrl
  }

  const shareUrl = getShareUrl()
  const shareText = `Check out ${productName} on Pet Shop!`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setOpen(false)
      }, 1500)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
          setOpen(false)
        }, 1500)
      } catch (err) {
        console.error('Fallback copy failed:', err)
      }
      document.body.removeChild(textArea)
    }
  }

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)
    
    let shareLink = ''
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        break
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so copy link instead
        handleCopyLink()
        return
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`
        break
      default:
        return
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400')
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share Product
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Product</DialogTitle>
            <DialogDescription>
              Share {productName} with your friends and family
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center justify-center gap-2 h-12"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                Facebook
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center justify-center gap-2 h-12"
              >
                <Twitter className="h-5 w-5 text-blue-400" />
                Twitter
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleSocialShare('whatsapp')}
                className="flex items-center justify-center gap-2 h-12"
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
                WhatsApp
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleSocialShare('instagram')}
                className="flex items-center justify-center gap-2 h-12"
              >
                <Instagram className="h-5 w-5 text-pink-600" />
                Instagram
              </Button>
            </div>
            
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 h-12"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>
            
            {affiliateCode && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Your affiliate code will be included in the shared link
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

