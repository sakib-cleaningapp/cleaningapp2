import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/api-auth';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build',
  {
    apiVersion: '2025-09-30.clover',
  }
);

/**
 * Create a login link for a business to access their Stripe Express Dashboard
 * Requires authentication - only logged-in business users can access their dashboard
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    // Create login link for Stripe Express Dashboard
    const loginLink = await stripe.accounts.createLoginLink(accountId);

    console.log('✅ Created login link for account:', accountId);

    return NextResponse.json({
      success: true,
      url: loginLink.url,
    });
  } catch (error: any) {
    console.error('Error creating login link:', error);

    return NextResponse.json(
      {
        error: error.message || 'Failed to create login link',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
