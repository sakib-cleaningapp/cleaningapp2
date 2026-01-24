import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdehoxivkvrxpxniwjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM'
);

console.log('Testing connection...');
const { data: testData, error: testError } = await supabase.from('booking_requests').select('id').limit(1);
if (testError) {
  console.error('Connection test failed:', testError);
  process.exit(1);
}
console.log('Connection successful!');

// Check if response_message column exists
console.log('\nChecking if response_message column exists...');
const { error: colError } = await supabase
  .from('booking_requests')
  .select('response_message')
  .limit(1);

if (colError && colError.message.includes('does not exist')) {
  console.log('response_message column does NOT exist - adding it now...');

  // Use Supabase RPC to run raw SQL
  // Since we can't run raw SQL directly, we'll use the REST API
  const response = await fetch(
    'https://bpdehoxivkvrxpxniwjp.supabase.co/rest/v1/rpc/exec_sql',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM',
      },
      body: JSON.stringify({
        sql: "ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS response_message TEXT;"
      })
    }
  );

  if (response.ok) {
    console.log('✅ Column added successfully!');
  } else {
    console.log('Note: Direct SQL execution via RPC not available.');
    console.log('\n>>> Please run this SQL in Supabase Dashboard > SQL Editor:');
    console.log('ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS response_message TEXT;');
  }
} else if (!colError) {
  console.log('✅ response_message column already exists!');
} else {
  console.log('Unexpected error:', colError.message);
}

// Also check the messages table exists and has the right columns
console.log('\nChecking messages table...');
const { data: msgCount, error: msgError } = await supabase
  .from('messages')
  .select('id', { count: 'exact', head: true });

if (msgError) {
  console.log('Error checking messages table:', msgError.message);
} else {
  console.log('Messages table accessible');
}

// Count bookings for josh@scailer.io
console.log('\nLooking up bookings for josh@scailer.io...');
const { data: bookings, error: bookErr } = await supabase
  .from('booking_requests')
  .select('id, status, customer_email')
  .eq('customer_email', 'josh@scailer.io');

if (bookErr) {
  console.log('Error:', bookErr.message);
} else {
  console.log(`Found ${bookings?.length || 0} bookings for josh@scailer.io`);
  bookings?.forEach(b => console.log(`  - ${b.id}: ${b.status}`));
}
