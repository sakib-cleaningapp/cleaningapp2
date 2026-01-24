const { createClient } = require('@supabase/supabase-js');

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://bpdehoxivkvrxpxniwjp.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Adding refund/cancellation columns to booking_requests...\n');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20);
      ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);
      ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
      ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20);
    `,
  });

  if (error) {
    // rpc might not exist, try raw query approach
    console.log('RPC not available, trying direct approach...');

    // We can't run raw SQL directly from client, need to use Supabase dashboard
    console.log(
      '\n⚠️  Please run this SQL in Supabase Dashboard > SQL Editor:\n'
    );
    console.log(`
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20);
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20);
    `);
    console.log(
      '\nGo to: https://supabase.com/dashboard/project/bpdehoxivkvrxpxniwjp/sql/new'
    );
    return;
  }

  console.log('✅ Migration completed successfully!');
}

runMigration().catch(console.error);
