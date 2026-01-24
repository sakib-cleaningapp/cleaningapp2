const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bpdehoxivkvrxpxniwjp.supabase.co';
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createTestUsers() {
  const users = [
    {
      email: 'customer@test.cleanly.com',
      password: 'TestPass123!',
      fullName: 'Test Customer',
      role: 'CUSTOMER',
    },
    {
      email: 'business@test.cleanly.com',
      password: 'TestPass123!',
      fullName: 'Test Business Owner',
      role: 'BUSINESS_OWNER',
    },
    {
      email: 'admin@test.cleanly.com',
      password: 'TestPass123!',
      fullName: 'Test Admin',
      role: 'ADMIN',
    },
  ];

  for (const user of users) {
    console.log('Creating user:', user.email);
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.fullName },
    });

    if (error) {
      console.log('Error creating', user.email, ':', error.message);
    } else {
      console.log('Created:', user.email, '- ID:', data.user.id);

      // Update role if not CUSTOMER
      if (user.role !== 'CUSTOMER') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: user.role })
          .eq('user_id', data.user.id);
        if (updateError) {
          console.log('Error updating role:', updateError.message);
        } else {
          console.log('Updated role to:', user.role);
        }
      }
    }
  }

  // Verify profiles created
  const { data: profiles } = await supabase.from('profiles').select('*');
  console.log('\nProfiles in database:', profiles?.length || 0);
  profiles?.forEach((p) => console.log('-', p.email, '|', p.role));
}

createTestUsers();
