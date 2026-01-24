import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-auth';

// Use service role key to bypass RLS for Stripe account operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build',
  {
    apiVersion: '2025-09-30.clover',
  }
);

/**
 * Look up business ID from Stripe account ID
 */
async function getBusinessIdFromAccountId(
  stripeAccountId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('business_stripe_accounts')
      .select('business_id')
      .eq('stripe_connect_account_id', stripeAccountId)
      .single();

    if (error || !data) {
      return null;
    }
    return data.business_id;
  } catch {
    return null;
  }
}

/**
 * Get the status of a Stripe Connect account
 * Requires authentication - only logged-in users can check account status
 *
 * Accepts either:
 * - accountId: Stripe account ID (legacy support)
 * - businessId: Business ID to look up the Stripe account from the database
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    let { accountId, businessId } = body;

    // If businessId is provided, look up the Stripe account ID from the database
    if (businessId && !accountId) {
      const { data: stripeAccount, error: dbError } = await supabaseAdmin
        .from('business_stripe_accounts')
        .select('stripe_connect_account_id')
        .eq('business_id', businessId)
        .single();

      if (dbError || !stripeAccount) {
        return NextResponse.json(
          { error: 'No Stripe account found for this business' },
          { status: 404 }
        );
      }
      accountId = stripeAccount.stripe_connect_account_id;
    }

    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing accountId or businessId' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    // Retrieve account details from Stripe
    const account = await stripe.accounts.retrieve(accountId);

    // Update the account status in the database
    // Also update by accountId in case businessId wasn't provided
    const updateBusinessId =
      businessId || (await getBusinessIdFromAccountId(accountId));

    if (updateBusinessId) {
      // Determine status based on account state
      let status: 'pending' | 'active' | 'restricted' | 'disabled' = 'pending';
      if (
        account.charges_enabled &&
        account.payouts_enabled &&
        account.details_submitted
      ) {
        status = 'active';
      } else if (account.requirements?.disabled_reason) {
        status = 'disabled';
      } else if (
        account.requirements?.currently_due &&
        account.requirements.currently_due.length > 0
      ) {
        status = 'restricted';
      }

      const { error: updateError } = await supabaseAdmin
        .from('business_stripe_accounts')
        .update({
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          status,
        })
        .eq('business_id', updateBusinessId);

      if (updateError) {
        console.error(
          'Error updating Stripe account status in database:',
          updateError
        );
        // Don't fail - we still got the status from Stripe
      } else {
        console.log(
          `✅ Updated Stripe account status in database for business ${updateBusinessId}: ${status}`
        );
      }
    }

    // Get balance if account is active
    let balance = null;
    if (account.charges_enabled) {
      try {
        const balanceData = await stripe.balance.retrieve({
          stripeAccount: accountId,
        });
        balance = {
          available: balanceData.available,
          pending: balanceData.pending,
        };
      } catch (err) {
        console.warn('Could not retrieve balance:', err);
      }
    }

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        country: account.country,
        defaultCurrency: account.default_currency,
        email: account.email,
        requirements: {
          currentlyDue: account.requirements?.currently_due || [],
          errors: account.requirements?.errors || [],
          pendingVerification: account.requirements?.pending_verification || [],
        },
      },
      balance,
    });
  } catch (error: any) {
    console.error('Error retrieving account status:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to retrieve account status',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
