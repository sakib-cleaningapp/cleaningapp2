# Stripe Integration Guide

## Overview

This guide will walk you through integrating real Stripe payments into your Cleanly booking platform.

---

## Step 1: Create Stripe Account & Get API Keys

### 1.1 Sign Up for Stripe

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Sign Up" and create an account
3. Complete the onboarding process

### 1.2 Get Your API Keys

1. Once logged in, go to **Developers → API Keys**
2. You'll see two types of keys:
   - **Publishable key** (starts with `pk_test_...`) - Safe to expose in frontend
   - **Secret key** (starts with `sk_test_...`) - ⚠️ NEVER expose this in frontend

### 1.3 Copy Your Keys

You'll need these keys for the next steps:

```
Publishable Key: pk_test_xxxxxxxxxxxxxxxxxxxxx
Secret Key: sk_test_xxxxxxxxxxxxxxxxxxxxx
```

---

## Step 2: Install Stripe Packages

Run these commands in your terminal:

```bash
cd apps/web
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Packages:**

- `stripe` - Server-side SDK (for API routes)
- `@stripe/stripe-js` - Client-side SDK (for frontend)
- `@stripe/react-stripe-js` - React components for Stripe Elements

---

## Step 3: Configure Environment Variables

### 3.1 Create/Update .env.local

In `apps/web/.env.local`, add your Stripe keys:

```bash
# Supabase Configuration (if not already present)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important:**

- Only variables starting with `NEXT_PUBLIC_` are exposed to the browser
- The secret key (without NEXT*PUBLIC*) stays server-side only

### 3.2 Restart Your Dev Server

After adding the keys, restart your development server:

```bash
# Press Ctrl+C to stop the server
npm run dev
```

---

## Step 4: File Structure

The integration creates these new files:

```
apps/web/src/
├── app/
│   └── api/
│       └── create-payment-intent/
│           └── route.ts          # Server-side Stripe API
├── components/
│   ├── payment-step-stripe.tsx   # New Stripe-enabled payment form
│   └── booking-modal.tsx         # Updated to use Stripe version
└── lib/
    └── stripe-config.ts          # Already exists ✓
```

---

## Step 5: How It Works

### Payment Flow:

```
1. Customer enters booking details
   ↓
2. Clicks "Continue to Payment"
   ↓
3. Frontend calls /api/create-payment-intent
   ↓
4. Server creates PaymentIntent with Stripe
   ↓
5. Returns client_secret to frontend
   ↓
6. Stripe Elements collects card info securely
   ↓
7. Customer clicks "Pay"
   ↓
8. Stripe processes payment (card never touches your server!)
   ↓
9. Payment succeeds → Booking is confirmed
```

### Security:

- Card details go **directly to Stripe**, never through your server
- PCI compliance is handled by Stripe
- Your server only creates PaymentIntents and receives confirmations

---

## Step 6: Testing Payments

### Test Card Numbers:

Stripe provides test cards for different scenarios:

| Card Number         | Scenario                   |
| ------------------- | -------------------------- |
| 4242 4242 4242 4242 | ✅ Successful payment      |
| 4000 0025 0000 3155 | ⚠️ Requires authentication |
| 4000 0000 0000 9995 | ❌ Declined (insufficient) |
| 4000 0000 0000 0069 | ❌ Declined (expired)      |

**For all test cards:**

- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

---

## Step 7: Testing the Integration

### 7.1 Start the Dev Server

```bash
cd apps/web
npm run dev
```

### 7.2 Test a Booking

1. Navigate to service discovery
2. Select a service (e.g., "Emergency Plumbing - £75")
3. **Details**: Select date/time
4. **Payment**: You'll see the Stripe Elements form
5. **Enter test card**: 4242 4242 4242 4242
6. **Complete payment**
7. **Confirmation**: Review and submit
8. ✅ Success!

### 7.3 Verify in Stripe Dashboard

1. Go to Stripe Dashboard → **Payments**
2. You should see your test payment
3. Click on it to see full details

---

## Step 8: Going Live (Production)

### 8.1 When Ready for Real Payments:

1. **Complete Stripe Account Setup**
   - Verify your business information
   - Connect your bank account
   - Complete any required documentation

2. **Switch to Live Keys**
   - Get your live keys from Stripe Dashboard
   - Replace test keys in production `.env`:

   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```

3. **Enable Live Mode in Stripe Dashboard**

⚠️ **Never commit API keys to git!** Always use environment variables.

---

## Step 9: Webhook Setup (Optional but Recommended)

Webhooks allow Stripe to notify your server about payment events:

### 9.1 Why Webhooks?

- Know when payments succeed/fail
- Handle disputes and refunds
- Update booking status automatically

### 9.2 Setup:

1. In Stripe Dashboard → **Developers → Webhooks**
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

I'll create the webhook handler file as part of the integration.

---

## Platform Fee Configuration

Your platform takes a **15% fee** (configured in `stripe-config.ts`):

```typescript
// Example: £75 booking
Total: £75.00
Platform Fee (15%): £11.25
Business Receives: £63.75
```

To change the fee percentage, edit `PLATFORM_FEE_PERCENTAGE` in `stripe-config.ts`.

---

## Troubleshooting

### "Stripe publishable key not set"

- Check `.env.local` has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Restart dev server after adding keys

### "Payment failed"

- Check browser console for errors
- Check server logs in terminal
- Verify test card number is correct
- Check Stripe Dashboard → Logs for details

### "No API key provided"

- Check `STRIPE_SECRET_KEY` is set in `.env.local`
- Make sure it starts with `sk_test_` or `sk_live_`
- Restart server after adding

### "CORS errors"

- Stripe API routes must be in `app/api/` directory
- Check route.ts exports POST function correctly

---

## Support & Resources

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Support**: https://support.stripe.com

---

## Summary

✅ **After following this guide, you'll have:**

- Real Stripe payments integrated
- Secure card collection with Stripe Elements
- Test mode for safe development
- Platform fee calculation
- Booking confirmation with payment tracking

🚀 **Ready to implement? Let's create the files!**
