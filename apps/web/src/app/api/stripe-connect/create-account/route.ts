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
 * Create a Stripe Connect account for a business
 * Requires authentication - only logged-in business users can create Connect accounts
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const {
      businessId,
      businessEmail,
      businessName,
      countryCode = 'GB',
    } = body;

    // Validate input
    if (!businessId || !businessEmail || !businessName) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: businessId, businessEmail, businessName',
        },
        { status: 400 }
      );
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    // Create a Stripe Connect Express account (easier onboarding)
    const account = await stripe.accounts.create({
      type: 'express', // Express accounts have simpler onboarding
      country: countryCode,
      email: businessEmail,
      metadata: {
        businessId: businessId,
        platform: 'tap2clean',
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    console.log('✅ Created Stripe Connect account:', account.id);

    // Save the Stripe account to the database
    const { error: dbError } = await supabaseAdmin
      .from('business_stripe_accounts')
      .upsert(
        {
          business_id: businessId,
          stripe_connect_account_id: account.id,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
          status: 'pending',
          connected_at: new Date().toISOString(),
        },
        {
          onConflict: 'business_id',
        }
      );

    if (dbError) {
      console.error('Error saving Stripe account to database:', dbError);
      // Don't fail - account was created in Stripe
    } else {
      console.log(
        '✅ Saved Stripe account to database for business:',
        businessId
      );
    }

    return NextResponse.json({
      success: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (error: any) {
    console.error('Error creating Stripe Connect account:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to create Stripe Connect account',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
