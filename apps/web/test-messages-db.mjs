import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bpdehoxivkvrxpxniwjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM'
);

console.log('=== Messages Database Test ===\n');

// 1. Count current messages
const { data: allMsgs, error: countErr } = await supabase
  .from('messages')
  .select('*');

console.log(`Total messages in database: ${allMsgs?.length || 0}`);
if (allMsgs?.length > 0) {
  console.log('Sample message:', JSON.stringify(allMsgs[0], null, 2));
}

// 2. Get josh@scailer.io's profile ID
const { data: profile, error: profErr } = await supabase
  .from('profiles')
  .select('id, user_id, email, name')
  .eq('email', 'josh@scailer.io')
  .single();

console.log('\nProfile for josh@scailer.io:', profile || profErr?.message);

// 3. Get accepted bookings for this customer
const { data: bookings, error: bookErr } = await supabase
  .from('booking_requests')
  .select('id, business_id, business_name, service_name, status, customer_id')
  .eq('customer_email', 'josh@scailer.io')
  .eq('status', 'accepted');

console.log(`\nAccepted bookings: ${bookings?.length || 0}`);
bookings?.forEach(b => {
  console.log(`  - ${b.id}`);
  console.log(`    Business: ${b.business_name} (${b.business_id})`);
  console.log(`    Service: ${b.service_name}`);
  console.log(`    customer_id: ${b.customer_id}`);
});

// 4. Create a test message for one of the bookings
if (bookings && bookings.length > 0) {
  const testBooking = bookings[0];
  console.log('\n--- Creating test message ---');

  // Get business owner's profile ID (required by FK constraint on sender_id)
  const { data: business } = await supabase
    .from('businesses')
    .select('owner_id, business_name')
    .eq('id', testBooking.business_id)
    .single();

  console.log('Business owner_id:', business?.owner_id);
  console.log('Business name:', business?.business_name);

  const testMessage = {
    sender_id: business?.owner_id, // Use owner's profile ID (FK to profiles)
    recipient_business_id: testBooking.business_id,
    sender_name: business?.business_name || testBooking.business_name || 'Test Business',
    sender_email: 'josh@scailer.io',
    subject: `Test: Booking Confirmed - ${testBooking.service_name}`,
    message: 'This is a test message to verify the messaging system works. Your booking has been confirmed!',
    message_type: 'booking',
    is_urgent: false,
    is_read: false,
    sender_type: 'business',
    sender_business_id: testBooking.business_id,
    conversation_id: testBooking.id, // Use booking ID as conversation_id
  };

  console.log('Inserting message:', JSON.stringify(testMessage, null, 2));

  const { data: newMsg, error: insertErr } = await supabase
    .from('messages')
    .insert([testMessage])
    .select()
    .single();

  if (insertErr) {
    console.log('❌ Insert error:', insertErr.message);
    console.log('Full error:', JSON.stringify(insertErr, null, 2));
  } else {
    console.log('✅ Message created successfully!');
    console.log('Message ID:', newMsg.id);
  }

  // 5. Now test the customer query
  console.log('\n--- Testing customer query ---');

  // Get booking IDs for the customer
  const bookingIds = bookings.map(b => b.id);

  // Query like the API does
  const filters = [`sender_id.eq.${profile?.id || testBooking.customer_id}`];
  if (bookingIds.length > 0) {
    filters.push(`conversation_id.in.(${bookingIds.join(',')})`);
  }

  console.log('Filter:', filters.join(','));

  const { data: customerMsgs, error: qErr } = await supabase
    .from('messages')
    .select('*')
    .or(filters.join(','))
    .order('created_at', { ascending: false });

  if (qErr) {
    console.log('Query error:', qErr.message);
  } else {
    console.log(`Found ${customerMsgs?.length || 0} messages for customer`);
    customerMsgs?.forEach(m => {
      console.log(`  - ${m.id}: ${m.subject}`);
    });
  }
}

console.log('\n=== Test complete ===');
