# PayPal Integration Setup Guide

## Quick Setup Steps

### 1. Get PayPal API Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com)
2. Log in with your PayPal account
3. Navigate to **Dashboard** > **My Apps & Credentials**
4. Click **Create App** (or use existing)
5. Select **Sandbox** for testing (or **Live** for production)
6. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Create or update your `.env.local` file in the project root:

```env
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here

# For Sandbox (Testing)
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

# For Production (Live)
# PAYPAL_API_URL=https://api-m.paypal.com
```

### 3. Restart Development Server

After adding the environment variables:

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test the Integration

1. Add items to your cart
2. Go to checkout
3. Fill in shipping and billing information
4. On the Payment step, you should see the PayPal button
5. Click "Pay with PayPal" to test

**For Sandbox Testing:**
- Use test accounts from PayPal Developer Dashboard
- Go to **Dashboard** > **Accounts** to create/manage test accounts

## Troubleshooting

### PayPal Button Not Showing

- ✅ Check that `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set in `.env.local`
- ✅ Restart your development server after adding env variables
- ✅ Check browser console for errors
- ✅ Verify the Client ID is correct (no extra spaces)

### Payment Not Processing

- ✅ Check that `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set
- ✅ Verify `PAYPAL_API_URL` matches your environment (sandbox vs live)
- ✅ Check server logs for API errors
- ✅ Ensure your PayPal app has the correct permissions

## Security Notes

- ⚠️ Never commit `.env.local` to git (it's already in .gitignore)
- ⚠️ Use Sandbox credentials for development
- ⚠️ Use Live credentials only in production
- ⚠️ Keep your Client Secret secure

