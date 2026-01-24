const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bpdehoxivkvrxpxniwjp.supabase.co';
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createTestBusiness() {
  // Get the business owner's profile ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'business@test.cleanly.com')
    .single();

  if (profileError || !profile) {
    console.log('Error finding business owner profile:', profileError?.message);
    return;
  }

  console.log('Found business owner profile:', profile.id);

  // Create a test business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      owner_id: profile.id,
      business_name: 'Sparkle Clean Services',
      bio: 'Professional home cleaning services with 5+ years of experience. We offer deep cleaning, regular maintenance, and move-in/move-out cleaning.',
      service_category: 'HOME_CLEANING',
      postcode: 'SW1A 1AA',
      rating: 4.8,
      review_count: 23,
    })
    .select()
    .single();

  if (businessError) {
    console.log('Error creating business:', businessError.message);
    return;
  }

  console.log(
    'Created business:',
    business.business_name,
    '- ID:',
    business.id
  );

  // Create test services
  const services = [
    {
      name: 'Standard Home Cleaning',
      description:
        'Regular cleaning of all rooms, vacuuming, mopping, and dusting.',
      price: 75.0,
      pricing_type: 'fixed',
    },
    {
      name: 'Deep Cleaning',
      description:
        'Thorough cleaning including inside appliances, behind furniture, and detailed bathroom/kitchen cleaning.',
      price: 150.0,
      pricing_type: 'fixed',
    },
    {
      name: 'Move-in/Move-out Cleaning',
      description:
        'Comprehensive cleaning for when you move into or out of a property.',
      price: 200.0,
      pricing_type: 'fixed',
    },
    {
      name: 'Hourly Cleaning',
      description: 'Flexible cleaning service billed by the hour.',
      price: 25.0,
      pricing_type: 'hourly',
    },
  ];

  for (const service of services) {
    const { data: svc, error: svcError } = await supabase
      .from('services')
      .insert({
        business_id: business.id,
        ...service,
        is_active: true,
      })
      .select()
      .single();

    if (svcError) {
      console.log('Error creating service:', svcError.message);
    } else {
      console.log('Created service:', svc.name, '- £' + svc.price);
    }
  }

  // Verify
  const { data: allServices } = await supabase.from('services').select('*');
  const { data: allBusinesses } = await supabase.from('businesses').select('*');

  console.log('\n--- Database Summary ---');
  console.log('Total businesses:', allBusinesses?.length || 0);
  console.log('Total services:', allServices?.length || 0);
}

createTestBusiness();
