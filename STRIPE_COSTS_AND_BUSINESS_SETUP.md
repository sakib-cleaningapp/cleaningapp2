# Stripe Setup Costs & Business Payout Guide

## 💰 What It Costs to Set Up

### Stripe Account Setup: **FREE** ✅

- Creating a Stripe account: **£0**
- Using test mode (development): **£0**
- Monthly fees: **£0**
- Setup fees: **£0**

### Transaction Fees (Only When You Process Payments):

**UK/European Cards:**

- Online payments: **1.5% + 20p** per transaction
- Example: £75 booking = £1.33 fee (you keep £73.67 before platform fee)

**International Cards:**

- Online payments: **2.9% + 20p** per transaction
- Example: £75 booking = £2.38 fee

**No fees until you process real payments!** Test mode is completely free.

---

## 💸 How Money Flows (Current Implementation)

### Current Setup (What I Just Built):

```
Customer pays £75
    ↓
Stripe processes payment (takes £1.33 fee)
    ↓
Cleanly Platform receives £73.67
    ↓
Platform keeps 15% (£11.25)
    ↓
Business should get £63.75
    ↓
❌ BUT: Business payout not yet automated!
```

**Issue:** The money currently goes to YOUR Stripe account. Businesses don't automatically receive their share yet.

---

## 🏢 Business Payouts - What's Missing

### Current State ⚠️

Right now:

- ✅ Customers can pay
- ✅ Money goes to your platform Stripe account
- ✅ Booking records show what businesses should receive
- ❌ **Businesses don't automatically get paid**

You would need to **manually pay businesses** via bank transfer using the booking records.

### What's Needed: Stripe Connect

To automatically pay businesses, you need **Stripe Connect**:

**Stripe Connect** allows you to:

- Onboard businesses with their own Stripe accounts
- Automatically split payments
- Send payouts directly to business bank accounts
- Track earnings per business
- Handle refunds automatically

---

## 🎯 Two Options for Business Payments

### Option 1: Manual Payouts (Current - Simple but Manual)

**How it works:**

1. Customer pays £75 → goes to your Stripe account
2. You keep platform fee (£11.25)
3. You manually transfer £63.75 to business bank account
4. Track amounts in your database

**Pros:**

- ✅ Works right now
- ✅ Simple setup
- ✅ No additional Stripe features needed
- ✅ Good for early testing with 1-2 businesses

**Cons:**

- ❌ Manual work for each payout
- ❌ Not scalable
- ❌ You hold all the money
- ❌ Requires separate accounting

**When to use:** Testing with a few businesses, MVP phase

---

### Option 2: Stripe Connect (Automated - Requires Setup)

**How it works:**

1. Business completes Stripe Connect onboarding
2. Customer pays £75
3. Stripe automatically:
   - Takes their fee (£1.33)
   - Sends platform fee (£11.25) to you
   - Sends business earnings (£62.42) directly to business
4. Everyone gets paid automatically

**Pros:**

- ✅ Fully automated
- ✅ Scalable to 1000s of businesses
- ✅ Businesses get paid instantly or on schedule
- ✅ Automatic refund handling
- ✅ Built-in reporting

**Cons:**

- ❌ More complex setup
- ❌ Businesses must complete verification
- ❌ Additional Stripe approval needed for platform

**When to use:** Production launch with multiple businesses

---

## 💡 Recommended Approach

### Phase 1: Start with Manual (NOW)

Use current implementation:

- Test with 1-3 friendly businesses
- Process payments through your Stripe account
- Pay businesses manually via bank transfer
- Validate the product-market fit
- **Cost: Just Stripe transaction fees (1.5% + 20p)**

### Phase 2: Add Stripe Connect (Before Scale)

When you're ready to onboard more businesses:

- Implement Stripe Connect
- Businesses connect their Stripe/bank accounts
- Automatic payouts
- Scale to many businesses
- **Cost: Same transaction fees + platform architecture**

---

## 🔧 What Needs to Be Built for Stripe Connect

I haven't implemented this yet. Here's what's needed:

### 1. Business Onboarding Flow

```
Business signs up
    ↓
Redirects to Stripe Connect onboarding
    ↓
Business provides:
  - Business information
  - Bank account details
  - Identity verification
    ↓
Stripe verifies and approves
    ↓
Business can now receive payouts
```

### 2. Connected Account Management

- Store Stripe Connect account ID for each business
- Check verification status
- Handle onboarding completion

### 3. Payment Splitting

- Modify payment intent to use "destination charges"
- Or use "separate charges and transfers"
- Automatic fee calculation

### 4. Payout Dashboard

- Show businesses their earnings
- Display payout history
- Upcoming payouts

**Estimated work:** 8-12 hours to implement fully

---

## 📊 Cost Breakdown Examples

### Example 1: £75 Emergency Plumbing

**With Manual Payouts (Current):**

```
Customer pays:           £75.00
Stripe fee (1.5% + 20p): -£1.33
You receive:             £73.67
Your platform fee (15%): £11.25
Business owes:           £62.42
You pay manually:        -£62.42
Your net profit:         £10.25
```

**With Stripe Connect (Future):**

```
Customer pays:           £75.00
Stripe fee (1.5% + 20p): -£1.33
Automatically split:
  → Platform: £11.25
  → Business: £62.42
Your net profit:         £11.25
Manual work:             None ✅
```

---

## 💳 For Customers - Already Complete! ✅

**Customers don't need to do anything special:**

- ✅ They just pay with any credit/debit card
- ✅ Secure Stripe Elements form
- ✅ PCI compliant (card details never touch your server)
- ✅ Works with all major cards (Visa, Mastercard, Amex, etc.)
- ✅ 3D Secure authentication when required
- ✅ Instant payment confirmation

**Customer experience is production-ready!**

---

## 🏢 For Businesses - Current Limitations

### What Works Now:

- ✅ Businesses can register
- ✅ Businesses can list services
- ✅ Businesses receive booking requests
- ✅ Businesses can see what they should earn
- ✅ Booking records track amounts owed

### What Doesn't Work Yet:

- ❌ Automatic payouts to businesses
- ❌ Business earnings dashboard
- ❌ Payout history
- ❌ Business Stripe account connection

**Solution:** You manually pay them based on booking records.

---

## 🚀 Quick Start Decision Tree

### Do you have 1-3 businesses to test with?

**→ YES:** Use current manual setup

- Start accepting payments today
- Pay businesses manually
- Test your product
- **Total cost: Just Stripe fees (1.5% + 20p per transaction)**

**→ NO, planning to launch with 10+ businesses:**

- Implement Stripe Connect first
- More upfront work
- Better long-term solution

### Are you comfortable manually paying businesses?

**→ YES:** Current setup is perfect for MVP
**→ NO:** Need to implement Stripe Connect

---

## 📋 Action Items

### To Start Taking Payments TODAY:

1. **Create Stripe Account** (5 min - FREE)
   - Go to stripe.com/register
   - Verify your email
2. **Add API Keys** (2 min - FREE)
   - Get test keys from dashboard
   - Add to `.env.local`
3. **Test Payments** (5 min - FREE)
   - Use test card: 4242 4242 4242 4242
   - Verify in Stripe Dashboard
4. **Process Real Payments** (when ready)
   - Complete Stripe verification
   - Switch to live keys
   - Start with friendly businesses
   - **Cost: 1.5% + 20p per transaction**

### To Add Business Payouts (Later):

1. **Implement Stripe Connect** (8-12 hours work)
2. **Get Stripe Connect Approved** (Stripe review)
3. **Onboard Businesses** (they connect accounts)
4. **Enable Automatic Payouts** (fully automated)

---

## 💰 Summary: What You Actually Pay

### Setup & Development:

- **Stripe Account: £0**
- **Test Mode: £0**
- **Development: £0**

### Per Transaction (Live Mode):

- **Stripe Fee: 1.5% + 20p** (UK cards)
- **Your Platform Fee: 15%** (you keep this)

### Example (£75 booking):

- Customer pays: **£75.00**
- Stripe takes: **£1.33**
- You receive: **£73.67**
- You keep: **£11.25** (platform fee)
- Business gets: **£62.42** (manual transfer or Stripe Connect)
- **Your profit: £10.25 per booking** (after Stripe fees and business payout)

### Monthly Costs:

- **Stripe: £0/month**
- No subscription fees
- Only pay per transaction

---

## 🎯 My Recommendation

**For Your MVP:**

1. ✅ Use current setup (what I just built)
2. ✅ Test with 2-3 friendly businesses
3. ✅ Pay them manually via bank transfer
4. ✅ Get your first real bookings
5. ✅ Validate the business model
6. ⏳ Add Stripe Connect before scaling to 10+ businesses

**This way:**

- Zero upfront costs
- Start accepting payments immediately
- No complex setup needed
- Manual payouts are manageable for small scale
- Add automation when you're ready to scale

---

## 📞 Need Help?

- **Stripe Costs**: https://stripe.com/pricing
- **Stripe Connect**: https://stripe.com/connect
- **Stripe Support**: https://support.stripe.com

---

## Next Steps

**Want me to implement Stripe Connect now?**

- Takes 8-12 hours
- Enables automatic business payouts
- Required for scaling

**OR**

**Start with manual payouts?**

- Use current setup
- Test with a few businesses
- Add Connect later when needed

**What would you like to do?**
