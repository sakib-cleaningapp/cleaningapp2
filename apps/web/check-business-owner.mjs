import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdehoxivkvrxpxniwjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM'
);

// Check business record
const businessId = '9fa1a479-dd46-472d-b8a4-bb343803fd5b';

console.log('=== Checking Business ===\n');

const { data: business, error: bizErr } = await supabase
  .from('businesses')
  .select('*')
  .eq('id', businessId)
  .single();

console.log('Business record:');
console.log(JSON.stringify(business, null, 2));
if (bizErr) console.log('Error:', bizErr.message);

// List all columns in businesses table
console.log('\n=== All businesses ===');
const { data: allBiz } = await supabase
  .from('businesses')
  .select('id, owner_id, name')
  .limit(5);
console.log(allBiz);

// Check profiles table
console.log('\n=== Profiles ===');
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, user_id, email, role')
  .limit(10);
console.log(profiles);

// Check if owner_id column exists in businesses
console.log('\n=== Check owner_id column ===');
const { data: ownerTest, error: ownerErr } = await supabase
  .from('businesses')
  .select('owner_id')
  .limit(1);
if (ownerErr) {
  console.log('owner_id column error:', ownerErr.message);
} else {
  console.log('owner_id column exists, sample:', ownerTest);
}
