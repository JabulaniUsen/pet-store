# PetSpace - Pet Products Ecommerce Platform

A full-stack ecommerce platform for pet products built with Next.js, TypeScript, Supabase, and Resend.

## Features

- 🛍️ **Storefront & Ecommerce**
  - Product listing with filters (pet type, category, price)
  - Product detail pages with image gallery and video player
  - Shopping cart with localStorage persistence
  - Checkout flow with coupon support
  - Order confirmation and tracking

- 📦 **Order Management**
  - Order status tracking (pending, processing, shipped, delivered, cancelled)
  - Public order tracking page
  - Email notifications for order updates

- 🤝 **Affiliate Program**
  - 15% commission on referrals
  - Affiliate signup and approval system
  - Affiliate dashboard with stats and earnings
  - Click tracking and referral link generation
  - Commission calculation and recording

- 👨‍💼 **Admin Dashboard**
  - Product management (CRUD)
  - Order management
  - Affiliate management (approve/reject)
  - User management
  - Coupon management
  - Analytics overview

- 📧 **Email Notifications** (Resend)
  - Order confirmation emails
  - Order status update emails
  - Affiliate approval/rejection emails
  - Affiliate sale notifications

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, TailwindCSS
- **UI Components**: ShadCN UI
- **Backend**: Supabase (Auth, Database, Storage)
- **Email**: Resend
- **State Management**: Zustand
- **Database**: PostgreSQL (via Supabase)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd petspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   RESEND_API_KEY=your_resend_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`:
     - `001_initial_schema.sql` - Creates all tables and RLS policies
     - `002_functions.sql` - Creates database functions
   - Run `supabase/storage_setup.sql` to set up storage buckets
   - Optionally run `supabase/seed.sql` to seed mock data

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following main tables:

- `users` - User profiles and roles
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `affiliates` - Affiliate accounts
- `affiliate_sales` - Commission records
- `coupons` - Discount codes
- `click_events` - Affiliate click tracking

## Storage Buckets

- `product-images` - Product images (public)
- `product-videos` - Product videos (public)

## Project Structure

```
petspace/
├── app/                    # Next.js App Router
│   ├── (storefront)/      # Public storefront routes
│   ├── (admin)/           # Admin routes (protected)
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── storefront/       # Storefront components
│   ├── admin/            # Admin components
│   ├── affiliate/        # Affiliate components
│   └── shared/           # Shared components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase clients
│   ├── email/            # Email utilities
│   ├── affiliate/        # Affiliate logic
│   ├── cart/             # Cart store
│   └── utils/            # General utilities
└── supabase/             # Database files
    ├── migrations/       # SQL migrations
    └── seed.sql          # Seed data
```

## Features in Detail

### Affiliate System

- Affiliates sign up with a unique code
- Links are tracked via `?ref={affiliateCode}` parameter
- Click events are logged to the database
- 15% commission is calculated on order completion
- Affiliate dashboard shows stats, earnings, and sales history

### Order Flow

1. Customer adds products to cart
2. Proceeds to checkout (multi-step form)
3. Order is created with pending status
4. Commission is calculated if affiliate link was used
5. Order confirmation email is sent
6. Customer can track order status

### Admin Features

- Protected routes requiring admin role
- Full CRUD for products, orders, coupons
- Affiliate approval/rejection
- Analytics dashboard
- File uploads for product images and videos

## License

MIT
