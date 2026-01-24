# Testing Summary - Story 6: Revenue Analytics

**Date**: 11 January 2025  
**Feature**: Real Revenue Tracking in Business Dashboard  
**Status**: ✅ Ready for Testing

---

## What Was Changed

### New Component Created:

- **File**: `apps/web/src/components/business/revenue-analytics.tsx`
- **Purpose**: Display real-time revenue analytics based on actual booking data

### Updated File:

- **File**: `apps/web/src/app/business/dashboard/page.tsx`
- **Changes**:
  - Imported `RevenueAnalytics` component
  - Replaced mock "Analytics Coming Soon" with real revenue dashboard

---

## How to Test

### 1. Start the Development Server

```bash
cd apps/web
npm run dev
```

### 2. Navigate to Business Dashboard

1. Open browser to `http://localhost:3000`
2. Go to `/business/login`
3. Log in (demo mode should work)
4. You'll land on `/business/dashboard`

### 3. Click on "Analytics" Tab

- Look for the tab navigation at the top
- Click "Analytics" (should be the 3rd tab)

---

## What You Should See

### ✅ Expected Behaviour:

#### If There Are Completed Bookings:

1. **Four Metric Cards** showing:
   - **Monthly Revenue**: Shows current month's earnings with growth percentage
   - **Total Earned**: Shows all-time revenue with net amount (after 15% platform fee)
   - **Upcoming**: Shows accepted but not completed bookings
   - **Avg. Booking**: Shows average booking value

2. **Revenue Breakdown Section**:
   - Green bar showing completed bookings total
   - Red bar showing 15% platform fee deduction
   - Bold green text showing net earnings

3. **Pending Requests Alert** (if any pending bookings):
   - Yellow alert box showing number of pending requests
   - Shows potential revenue from pending bookings

#### If No Bookings Yet:

- Grey dashed box with message "No revenue yet"
- Prompt to start accepting booking requests

---

## Test Scenarios

### Scenario 1: View Revenue with Existing Bookings

**Steps:**

1. Go to "Bookings" tab
2. Accept at least one booking request
3. Go back to "Analytics" tab
4. **Expected**: Should see the booking reflected in "Upcoming" revenue

### Scenario 2: Complete a Booking (Simulate)

**Note**: Currently we can't mark bookings as "completed" in the UI, but you should see:

- Accepted bookings in "Upcoming" section
- Calculations are based on booking status

### Scenario 3: Check Growth Calculation

**Steps:**

1. Look at "Monthly Revenue" card
2. **Expected**: Shows percentage change from last month
3. Green arrow up = positive growth
4. Red arrow down = negative growth

---

## Things to Check

### ✅ Visual Checks:

- [ ] All numbers display correctly (no NaN or undefined)
- [ ] Currency formatted properly (£X.XX format)
- [ ] Cards have proper spacing and borders
- [ ] Icons show correctly (DollarSign, Calendar, etc.)
- [ ] Colours are appropriate (green for revenue, red for fees)

### ✅ Data Accuracy:

- [ ] Monthly revenue matches bookings for current month
- [ ] Total earned sums all completed bookings
- [ ] Platform fee is exactly 15% of total
- [ ] Net earnings = Total - Platform Fee
- [ ] Average booking = Total / Number of bookings

### ✅ Edge Cases:

- [ ] Works with zero bookings (shows empty state)
- [ ] Works with only pending bookings
- [ ] Works with mix of pending/accepted/completed
- [ ] No console errors when switching tabs

---

## Known Limitations

1. **Demo Data**: Currently using mock booking requests from Zustand store
2. **No Real Database**: Not connected to Prisma/Supabase yet
3. **Can't Mark Completed**: No UI to change booking status to "completed" yet
4. **Fixed Business ID**: Hardcoded to "demo-biz-1"

---

## Potential Issues to Watch For

### ⚠️ If You See Errors:

**Issue**: "useBookingRequests is not a function"

- **Fix**: The store might not be exporting correctly
- **Check**: `apps/web/src/stores/booking-requests-store.ts`

**Issue**: Numbers show as "NaN" or "undefined"

- **Fix**: Booking data might not have `totalCost` field
- **Check**: Booking request structure in store

**Issue**: Component doesn't render

- **Fix**: Import path might be wrong
- **Check**: Import statement in `dashboard/page.tsx`

---

## Next Steps After Testing

Once you've tested and confirmed the Analytics tab works:

1. ✅ **Story 6 Complete**: Real revenue tracking is done
2. ⏳ **Continue Story 6**: Add performance insights (service profitability, peak times)
3. ⏳ **Continue Story 7**: Build advanced filter UI for service discovery
4. ⏳ **Story 8**: Start Stripe payment integration (critical for MVP)

---

## Regression Testing

Make sure these still work after the changes:

- [ ] **Overview Tab**: Should still show basic metrics
- [ ] **Bookings Tab**: Booking requests manager works
- [ ] **Services Tab**: Service management still functions
- [ ] **Settings Tab**: Settings page accessible
- [ ] **Notifications**: Toast notifications still appear
- [ ] **Accept/Decline**: Booking actions still work

---

## Screenshot Locations

When testing, please check these specific locations:

1. **Business Dashboard**: `/business/dashboard` → "Analytics" tab
2. **Metric Cards**: Top row with 4 cards
3. **Revenue Breakdown**: Bar chart section below cards
4. **Pending Alert**: Yellow box (only if pending bookings exist)

---

**👉 Please test the Analytics tab and let me know if you see any issues or if everything works as expected!**
