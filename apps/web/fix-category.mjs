import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCategories() {
  console.log('Updating businesses with HOME_CLEANING category to CLEANING...');

  const { data, error } = await supabase
    .from('businesses')
    .update({ service_category: 'CLEANING' })
    .eq('service_category', 'HOME_CLEANING')
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    const count = data ? data.length : 0;
    console.log(`Updated ${count} businesses`);
    if (data && data.length > 0) {
      console.log('Updated businesses:', data.map(b => b.business_name));
    }
  }
}

fixCategories();
