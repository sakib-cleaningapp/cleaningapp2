/**
 * Script to create test users in Supabase for E2E testing
 * Run with: npx tsx e2e/setup-test-users.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://bpdehoxivkvrxpxniwjp.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM';

// Use service role to bypass email verification
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: 'customer@test.cleanly.com',
    password: 'TestPass123!',
    role: 'CUSTOMER',
    fullName: 'Test Customer',
  },
  {
    email: 'business@test.cleanly.com',
    password: 'TestPass123!',
    role: 'BUSINESS_OWNER',
    fullName: 'Test Business Owner',
  },
  {
    email: 'admin@test.cleanly.com',
    password: 'TestPass123!',
    role: 'ADMIN',
    fullName: 'Test Admin',
  },
];

async function createTestUsers() {
  console.log('Creating test users in Supabase...\n');

  for (const user of testUsers) {
    console.log(`Creating user: ${user.email}`);

    try {
      // Create auth user with service role (bypasses email verification)
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Skip email verification
          user_metadata: {
            full_name: user.fullName,
          },
        });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          console.log(`  User already exists, skipping...`);

          // Get existing user to create profile if needed
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existingUser = existingUsers?.users?.find(
            (u) => u.email === user.email
          );

          if (existingUser) {
            // Ensure profile exists
            await ensureProfile(existingUser.id, user);
          }
          continue;
        }
        throw authError;
      }

      console.log(`  Auth user created: ${authData.user?.id}`);

      // Create profile in profiles table
      if (authData.user) {
        await ensureProfile(authData.user.id, user);
      }

      console.log(`  ✅ User ${user.email} created successfully\n`);
    } catch (error: any) {
      console.error(`  ❌ Error creating ${user.email}:`, error.message);
    }
  }

  // Create test business for business owner
  await createTestBusiness();

  console.log('\n✅ Test user setup complete!');
}

async function ensureProfile(userId: string, user: (typeof testUsers)[0]) {
  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      user_id: userId,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
    },
    {
      onConflict: 'user_id',
    }
  );

  if (profileError) {
    console.log(`  Warning: Could not create profile:`, profileError.message);
  } else {
    console.log(`  Profile created/updated`);
  }
}

async function createTestBusiness() {
  console.log('\nCreating test business...');

  // Get business owner user
  const { data: users } = await supabase.auth.admin.listUsers();
  const businessUser = users?.users?.find(
    (u) => u.email === 'business@test.cleanly.com'
  );

  if (!businessUser) {
    console.log('  Business owner user not found, skipping business creation');
    return;
  }

  // Get profile ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', businessUser.id)
    .single();

  if (!profile) {
    console.log('  Profile not found, skipping business creation');
    return;
  }

  // Check if business already exists for this owner
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', profile.id)
    .single();

  let businessId: string;

  if (existingBusiness) {
    console.log('  Business already exists:', existingBusiness.id);
    businessId = existingBusiness.id;
  } else {
    // Create new test business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        owner_id: profile.id,
        business_name: 'Test Cleaning Business',
        bio: 'A test business for E2E testing',
        service_category: 'CLEANING',
      })
      .select('id')
      .single();

    if (businessError) {
      console.log(
        '  Warning: Could not create business:',
        businessError.message
      );
      return;
    }
    businessId = business.id;
    console.log('  ✅ Test business created:', businessId);
  }

  const business = { id: businessId };

  // Check if service already exists
  const { data: existingService } = await supabase
    .from('services')
    .select('id')
    .eq('business_id', business.id)
    .eq('name', 'Standard Home Cleaning')
    .single();

  if (existingService) {
    console.log('  Service already exists:', existingService.id);
  } else {
    const { error: serviceError } = await supabase.from('services').insert({
      business_id: business.id,
      name: 'Standard Home Cleaning',
      description: 'Complete home cleaning service',
      price: 75,
      pricing_type: 'fixed',
      is_active: true,
    });

    if (serviceError) {
      console.log('  Warning: Could not create service:', serviceError.message);
    } else {
      console.log('  ✅ Test service created');
    }
  }
}

createTestUsers().catch(console.error);
