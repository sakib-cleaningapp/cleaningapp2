/**
 * Test Stripe Payment Intent Creation
 * Run with: node test-stripe.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bpdehoxivkvrxpxniwjp.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NTE1OTAsImV4cCI6MjA4NDMyNzU5MH0.eyxoaeDRMjYqh_E_nGXmM9sJE-6wvTCuf-HYIQOhCLE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStripePaymentIntent() {
  console.log('=== Stripe Payment Intent Test ===\n');

  // Step 1: Sign in as test customer
  console.log('1. Signing in as test customer...');
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: 'customer@test.cleanly.com',
      password: 'TestPass123!',
    });

  if (authError) {
    console.error('❌ Auth failed:', authError.message);
    return;
  }
  console.log('✅ Signed in as:', authData.user.email);
  console.log('   Session token exists:', !!authData.session?.access_token);

  // Step 2: Try to create a payment intent via API
  console.log('\n2. Creating payment intent via API...');

  const baseUrl = 'http://localhost:3001'; // Assuming dev server on 3001

  try {
    const response = await fetch(`${baseUrl}/api/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authData.session?.access_token}`,
      },
      body: JSON.stringify({
        amount: 75.0,
        currency: 'gbp',
        metadata: {
          serviceName: 'Test Service',
          businessName: 'Test Business',
          serviceId: 'test-service-id',
          businessId: 'test-business-id',
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', response.status, result);
      return;
    }

    console.log('✅ Payment Intent created successfully!');
    console.log(
      '   Client Secret:',
      result.clientSecret?.substring(0, 30) + '...'
    );
    console.log('   Payment Intent ID:', result.paymentIntentId);
    console.log('   Using Connect:', result.usingConnect);
    console.log('   Demo Mode:', result.demoMode || false);

    if (result.demoMode) {
      console.log('\n⚠️  Warning: API returned demo mode response');
      console.log(
        '   This means Stripe is not properly configured on the server'
      );
    }
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }

  // Sign out
  await supabase.auth.signOut();
  console.log('\n3. Signed out');
}

testStripePaymentIntent();
