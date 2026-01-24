const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bpdehoxivkvrxpxniwjp.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NTE1OTAsImV4cCI6MjA4NDMyNzU5MH0.eyxoaeDRMjYqh_E_nGXmM9sJE-6wvTCuf-HYIQOhCLE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('Testing Supabase authentication...');

  // Try to sign in as customer
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'customer@test.cleanly.com',
    password: 'TestPass123!',
  });

  if (error) {
    console.log('Auth error:', error.message);
  } else {
    console.log('Auth success!');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Session exists:', !!data.session);
  }
}

testAuth();
