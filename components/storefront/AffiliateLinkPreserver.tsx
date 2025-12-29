'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

export function AffiliateLinkPreserver() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Check if there's a ref parameter in the URL
    const refCode = searchParams.get('ref')
    
    if (refCode) {
      // Store the affiliate code in localStorage and cookie
      if (typeof window !== 'undefined') {
        localStorage.setItem('affiliate_ref', refCode.toUpperCase())
        document.cookie = `affiliate_ref=${refCode.toUpperCase()}; path=/; max-age=${60 * 60 * 24 * 30}`
      }
    }
  }, [pathname, searchParams])

  useEffect(() => {
    // Ensure current URL has ref parameter if we have one stored
    const storedRef = typeof window !== 'undefined' ? localStorage.getItem('affiliate_ref') : null
    if (storedRef && !searchParams.get('ref')) {
      // Add ref to current URL without reload
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('ref', storedRef)
      window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    // Intercept all internal link clicks and add affiliate code
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (!link) return
      
      const href = link.getAttribute('href')
      if (!href) return
      
      // Skip external links, admin links, auth links, and API routes
      if (
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('/admin') ||
        href.startsWith('/login') ||
        href.startsWith('/signup') ||
        href.startsWith('/api') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return
      }
      
      // Get affiliate code from localStorage
      const affiliateCode = localStorage.getItem('affiliate_ref')
      if (!affiliateCode) return
      
      // Check if link already has ref parameter
      if (href.includes('ref=')) return
      
      // Add ref parameter to the href
      const separator = href.includes('?') ? '&' : '?'
      link.href = `${href}${separator}ref=${affiliateCode}`
    }
    
    // Use capture phase to intercept before Next.js handles it
    document.addEventListener('click', handleLinkClick, true)
    
    return () => {
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [])

  return null
}

