# Cleanly MVP - Development Plan

**Created**: 11 January 2025  
**Current Progress**: 65% Complete  
**Critical Path**: Story 8 → Payment Integration

---

## 🎯 MVP LAUNCH REQUIREMENTS (PRD)

### Functional Requirements Status:

1. ✅ **FR1**: Separate Customer/Business flows
2. ✅ **FR2**: Business profile & service management
3. ✅ **FR3**: Search by category & postcode
4. ✅ **FR4**: Booking request flow (request/accept/reject)
5. ❌ **FR5**: Auto-cancel after 24 hours **← MISSING**
6. ❌ **FR6**: Stripe payment after acceptance **← CRITICAL - NOT STARTED**
7. ✅ **FR7**: Dashboards for bookings

### Non-Functional Requirements:

1. ✅ **NFR1**: Desktop-optimised experience
2. ⚠️ **NFR2**: Supabase backend (currently demo mode)
3. ✅ **NFR3**: South Wales postcodes (validation exists but not enforced)
4. ✅ **NFR4**: <3 second page load times

---

## 🚨 CRITICAL: What Blocks MVP Launch?

1. **Stripe Payment Integration** (FR6) - Story 8
   - Cannot launch without payment processing
   - This is the core marketplace functionality
2. **Auto-cancellation Logic** (FR5)
   - Must implement 24-hour timeout
   - Can use Supabase scheduled functions or cron

3. **Real Supabase Authentication** (NFR2)
   - Move from demo mode to real auth
   - Set up email verification

4. **Email Notifications**
   - Booking confirmations
   - Payment receipts
   - Status updates

---

## 📋 DEVELOPMENT PHASES

### **PHASE 1: Story 8 - Payment Integration** 🔴 CRITICAL

**Estimated Time**: 6-8 hours  
**Status**: Not Started  
**Priority**: Must complete before launch

#### Tasks:

1. **Stripe Setup** (1 hour)
   - Create Stripe account
   - Get API keys (test & production)
   - Install dependencies: `@stripe/stripe-js`, `@stripe/react-stripe-js`, `stripe`
   - Set up environment variables

2. **Payment UI** (2 hours)
   - Create payment step in booking flow
   - Integrate Stripe Elements
   - Add card input form
   - Show payment summary with breakdown:
     - Service price: £X
     - Platform fee (15%): £Y
     - Total: £Z
   - Add payment validation

3. **Backend Payment Processing** (2 hours)
   - Create API route for payment intent: `/api/stripe/create-payment-intent`
   - Create API route for payment confirmation: `/api/stripe/confirm-payment`
   - Handle Stripe webhooks: `/api/stripe/webhook`
   - Store payment records in database
   - Update booking status after payment

4. **Stripe Connect for Businesses** (2 hours)
   - Set up Stripe Connect
   - Add "Connect Stripe" button in business dashboard
   - Create onboarding flow for businesses
   - Configure automatic payouts
   - Calculate platform fee (85% to business, 15% to platform)

5. **Testing** (1 hour)
   - Test with Stripe test cards
   - Test payment success flow
   - Test payment decline flow
   - Test refund processing
   - Test webhook handling

#### Deliverables:

- ✅ Customers can pay with card
- ✅ Payments are processed securely
- ✅ Businesses receive payouts
- ✅ Platform takes 15% commission
- ✅ Payment records stored in database

---

### **PHASE 2: Auto-Cancellation Logic** 🟠 HIGH PRIORITY

**Estimated Time**: 2 hours  
**Status**: Not Started  
**Priority**: Required for FR5

#### Tasks:

1. **Create Scheduled Function** (1 hour)
   - Use Supabase Edge Function or cron job
   - Run every hour to check for expired bookings
   - Find bookings with status "pending" and created >24 hours ago
   - Update status to "cancelled"
   - Send notification to customer

2. **Add Expiry Timer UI** (1 hour)
   - Show countdown timer on pending bookings
   - "Business has X hours to respond"
   - Visual indicator of urgency

#### Deliverables:

- ✅ Bookings auto-cancel after 24 hours
- ✅ Customers notified of cancellation
- ✅ UI shows time remaining

---

### **PHASE 3: Real Supabase Authentication** 🟠 HIGH PRIORITY

**Estimated Time**: 3 hours  
**Status**: Demo mode only  
**Priority**: Required for NFR2

#### Tasks:

1. **Configure Supabase Auth** (1 hour)
   - Set up email/password authentication
   - Enable email confirmation
   - Configure redirect URLs
   - Set up password reset flow

2. **Update Auth Context** (1 hour)
   - Replace demo auth with real Supabase auth
   - Update login/register pages
   - Handle email verification
   - Add proper error handling

3. **Add Password Reset** (1 hour)
   - Create "Forgot Password" page
   - Implement reset email flow
   - Add password reset confirmation

#### Deliverables:

- ✅ Real user accounts
- ✅ Email verification
- ✅ Password reset
- ✅ No more demo mode

---

### **PHASE 4: Email Notifications** 🟡 MEDIUM PRIORITY

**Estimated Time**: 4 hours  
**Status**: Not implemented  
**Priority**: Important for UX

#### Tasks:

1. **Set Up Email Service** (1 hour)
   - Choose: Supabase Email, SendGrid, or Resend
   - Configure API keys
   - Create email templates

2. **Booking Emails** (1 hour)
   - Booking request confirmation (to customer)
   - New booking notification (to business)
   - Booking accepted (to customer)
   - Booking declined (to customer)

3. **Payment Emails** (1 hour)
   - Payment confirmation
   - Payment receipt
   - Refund confirmation

4. **Reminder Emails** (1 hour)
   - 24 hours before appointment
   - Day of appointment
   - Post-service follow-up

#### Deliverables:

- ✅ Automated booking emails
- ✅ Payment receipts
- ✅ Appointment reminders

---

### **PHASE 5: Story 6 & 7 Polish** 🟢 LOW PRIORITY

**Estimated Time**: 4 hours  
**Status**: Partially complete  
**Priority**: Nice to have

#### Story 6: Business Dashboard Enhancements

1. **Real Revenue Tracking** (1 hour)
   - Calculate revenue from actual bookings
   - Show daily/weekly/monthly trends
   - Display earnings breakdown

2. **Performance Insights** (1 hour)
   - Service profitability chart
   - Peak booking times graph
   - Conversion rate metrics

#### Story 7: Customer Discovery Enhancements

1. **Advanced Filter UI** (1 hour)
   - Price range slider
   - Star rating selector
   - Visual filter panel

2. **Rebooking Shortcuts** (1 hour)
   - "Book Again" buttons on past bookings
   - One-click rebooking

#### Deliverables:

- ✅ Better business analytics
- ✅ Easier service discovery
- ✅ Quick rebooking

---

### **PHASE 6: Story 9 - Real-Time Updates** 🟢 LOW PRIORITY

**Estimated Time**: 4 hours  
**Status**: Not started  
**Priority**: Post-MVP

#### Tasks:

1. **Google OAuth** (2 hours)
   - Configure Google OAuth in Supabase
   - Add "Sign in with Google" button
   - Handle OAuth callback

2. **Real-Time Notifications** (2 hours)
   - Set up WebSocket or polling
   - Live dashboard updates
   - Push notifications for new bookings

#### Deliverables:

- ✅ Google sign-in
- ✅ Live dashboard updates

---

## 📊 TIMELINE & ESTIMATES

### **Sprint 1: Core Payment (Critical Path)**

- **Duration**: 8 hours
- **Tasks**: Story 8 (Payment Integration)
- **Outcome**: MVP can accept payments ✅

### **Sprint 2: Essential Features**

- **Duration**: 5 hours
- **Tasks**: Auto-cancellation + Real Auth
- **Outcome**: MVP meets all PRD requirements ✅

### **Sprint 3: Polish & Launch Prep**

- **Duration**: 8 hours
- **Tasks**: Email notifications + Stories 6 & 7 polish
- **Outcome**: Professional, complete experience ✅

### **Total Time to MVP Launch**: 21 hours (~3 days)

---

## 🚀 LAUNCH CHECKLIST

### Before Launch:

- [ ] Stripe payment processing working
- [ ] Stripe Connect onboarding for businesses
- [ ] Auto-cancellation after 24 hours
- [ ] Real Supabase authentication
- [ ] Email notifications for bookings
- [ ] Payment receipts via email
- [ ] Test all flows end-to-end
- [ ] Security audit (especially payments)
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] Mobile responsiveness check

### Nice to Have (Can Launch Without):

- [ ] Google OAuth
- [ ] Real-time dashboard updates
- [ ] Advanced analytics
- [ ] Map view
- [ ] Customer reviews system

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Start Story 8 - Phase 1: Stripe Setup**

   ```bash
   npm install @stripe/stripe-js @stripe/react-stripe-js stripe
   ```

2. **Create Stripe Account**
   - Go to stripe.com
   - Sign up for account
   - Get test API keys
   - Save to `.env.local`

3. **Build Payment UI Component**
   - Create `apps/web/src/components/payment-form.tsx`
   - Integrate Stripe Elements
   - Add to booking flow

4. **Create Payment API Routes**
   - `/api/stripe/create-payment-intent`
   - `/api/stripe/confirm-payment`
   - `/api/stripe/webhook`

5. **Test Payment Flow**
   - Use test card: 4242 4242 4242 4242
   - Verify payment success
   - Check webhook handling

---

## 📝 NOTES

- **Stripe Test Mode**: Use test API keys for development
- **Platform Fee**: 15% commission on all bookings
- **Payment Flow**: Customer pays → Hold funds → Service complete → Release to business
- **Refund Policy**: Full refund if cancelled >24 hours before appointment
- **Security**: Never store card details (use Stripe Elements)
- **PCI Compliance**: Handled by Stripe (no card data touches our servers)

---

**Bottom Line**: The MVP is 65% complete. Story 8 (Payment Integration) is the critical missing piece. Once payments work, the platform can launch. Everything else is polish.
