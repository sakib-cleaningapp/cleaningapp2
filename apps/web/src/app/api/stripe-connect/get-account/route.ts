import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for Stripe account operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/stripe-connect/get-account
 * Get the stored Stripe Connect account ID for a business
 *
 * Query params:
 *   - business_id: string (required) - The business ID to look up
 *
 * Returns:
 *   - success: boolean
 *   - stripeAccountId: string (if found)
 *   - account: object with stored account details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Missing required query param: business_id' },
        { status: 400 }
      );
    }

    // Look up the Stripe account from the database
    const { data: stripeAccount, error: dbError } = await supabaseAdmin
      .from('business_stripe_accounts')
      .select('*')
      .eq('business_id', businessId)
      .single();

    if (dbError) {
      // PGRST116 means no rows returned (not found)
      if (dbError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: 'No Stripe account found for this business',
          },
          { status: 404 }
        );
      }
      console.error('Error fetching Stripe account from database:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stripeAccountId: stripeAccount.stripe_account_id,
      account: {
        businessId: stripeAccount.business_id,
        stripeAccountId: stripeAccount.stripe_account_id,
        chargesEnabled: stripeAccount.charges_enabled,
        payoutsEnabled: stripeAccount.payouts_enabled,
        detailsSubmitted: stripeAccount.details_submitted,
        country: stripeAccount.country,
        email: stripeAccount.email,
        createdAt: stripeAccount.created_at,
        updatedAt: stripeAccount.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Stripe account:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch Stripe account',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
