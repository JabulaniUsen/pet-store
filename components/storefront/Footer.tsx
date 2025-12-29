import Link from 'next/link'
import { Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-100 relative overflow-hidden">
      {/* Paw print pattern background - subtle repeating pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 50px,
              currentColor 50px,
              currentColor 52px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 50px,
              currentColor 50px,
              currentColor 52px
            )`
          }}
        >
          <div className="grid grid-cols-8 gap-8 h-full w-full py-8">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                <span className="text-lg" style={{ filter: 'grayscale(100%) brightness(0.5)' }}>🐾</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Pet Shop Branding */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold text-black">Pet Shop</span>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. At et vehicula sodales est proin turpis pellentesque sinulla a aliquam amet rhoncus quisque eget sit.
            </p>
            {/* Social Media Icons */}
            <div className="flex gap-2 sm:gap-3">
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-black bg-white flex items-center justify-center hover:bg-black transition-colors group">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-black group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-black bg-white flex items-center justify-center hover:bg-black transition-colors group">
                <svg 
                  className="h-4 w-4 sm:h-5 sm:w-5 text-black group-hover:text-white transition-colors" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-black mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-black transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-black transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="hover:text-black transition-colors">
                  Gift cards
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-black transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="font-bold text-black mb-4">Useful Links</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/products?new=true" className="hover:text-black transition-colors">
                  New products
                </Link>
              </li>
              <li>
                <Link href="/products?best_sellers=true" className="hover:text-black transition-colors">
                  Best sellers
                </Link>
              </li>
              <li>
                <Link href="/products?discount=true" className="hover:text-black transition-colors">
                  Discount
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-black transition-colors">
                  F.A.Q
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-black mb-4">Customer Service</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/contact" className="hover:text-black transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-black transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-black transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-black transition-colors">
                  Order tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Information */}
          <div>
            <h4 className="font-bold text-black mb-4">Store</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>8592 Fairground St. Tallahassee, FL 32303</p>
              <p>+775 378-6348</p>
              <p>rgarton@outlook.com</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 pt-4 md:pt-6 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 relative">
          <p className="text-xs text-gray-500 text-center md:text-left">
            © Copyright Pet Shop 2024. Design by Figma.guru
          </p>
          
          {/* Payment Method Logos */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <div className="text-xs font-bold text-gray-600">VISA</div>
            <div className="text-xs font-bold text-gray-600 hidden sm:inline">AMERICAN EXPRESS</div>
            <div className="text-xs font-bold text-gray-600">Mastercard</div>
            <div className="text-xs font-bold text-gray-600">PayPal</div>
          </div>

          {/* Orange blob decoration */}
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 -z-0">
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </footer>
  )
}

