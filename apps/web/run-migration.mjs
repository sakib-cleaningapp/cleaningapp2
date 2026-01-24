import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdehoxivkvrxpxniwjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM'
);

console.log('Testing connection...');
const { data, error } = await supabase.from('messages').select('id').limit(1);
if (error) {
  console.error('Connection test failed:', error);
  process.exit(1);
}
console.log('Connection successful!');

// Test if conversation_id exists
console.log('\nChecking if migration is needed...');
const { data: test, error: testErr } = await supabase
  .from('messages')
  .select('conversation_id')
  .limit(1);

if (testErr && testErr.message.includes('does not exist')) {
  console.log('conversation_id column does NOT exist - migration needed');
  console.log('\n>>> Please run the migration SQL in Supabase Dashboard > SQL Editor');
} else if (!testErr) {
  console.log('conversation_id column already exists!');
  
  // Check other columns
  const { error: e1 } = await supabase.from('messages').select('parent_message_id').limit(1);
  const { error: e2 } = await supabase.from('messages').select('sender_type').limit(1);
  const { error: e3 } = await supabase.from('messages').select('sender_business_id').limit(1);
  
  console.log('parent_message_id:', e1 ? 'MISSING' : 'exists');
  console.log('sender_type:', e2 ? 'MISSING' : 'exists');
  console.log('sender_business_id:', e3 ? 'MISSING' : 'exists');
} else {
  console.log('Unexpected error:', testErr.message);
}
