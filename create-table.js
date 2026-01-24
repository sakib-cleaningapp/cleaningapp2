const { Client } = require('pg');

const sql = `
CREATE TABLE IF NOT EXISTS business_stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id TEXT NOT NULL UNIQUE,
  stripe_connect_account_id VARCHAR(255) NOT NULL,
  connected_at TIMESTAMPTZ,
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'restricted', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_business_stripe_accounts_business
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_business_stripe_accounts_stripe_id
  ON business_stripe_accounts(stripe_connect_account_id);

ALTER TABLE business_stripe_accounts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage all stripe accounts'
  ) THEN
    CREATE POLICY "Service role can manage all stripe accounts"
      ON business_stripe_accounts FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

async function tryConnect(config, label) {
  const client = new Client(config);

  try {
    console.log(`Trying ${label}...`);
    await client.connect();
    console.log('Connected! Running migration...');
    await client.query(sql);
    console.log('✅ Table created successfully!');
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_name = 'business_stripe_accounts'"
    );
    if (result.rows.length > 0) {
      console.log('✅ Verified: business_stripe_accounts table exists');
    }
    await client.end();
    return true;
  } catch (err) {
    console.log(`Failed: ${err.message}`);
    try {
      await client.end();
    } catch {}
    return false;
  }
}

async function createTable() {
  // URL encode password (. becomes %2E)
  const password = '1234gbm.675g';
  const encodedPassword = encodeURIComponent(password);

  // Try different connection configs
  const connections = [
    // Config object approach (recommended)
    [
      {
        host: 'aws-0-eu-west-2.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: 'postgres.bpdehoxivkvrxpxniwjp',
        password: password,
        ssl: { rejectUnauthorized: false },
      },
      'config-pooler-6543',
    ],
    [
      {
        host: 'aws-0-eu-west-2.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        user: 'postgres.bpdehoxivkvrxpxniwjp',
        password: password,
        ssl: { rejectUnauthorized: false },
      },
      'config-pooler-5432',
    ],
    // Connection string with encoded password
    [
      {
        connectionString: `postgres://postgres.bpdehoxivkvrxpxniwjp:${encodedPassword}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres`,
        ssl: { rejectUnauthorized: false },
      },
      'string-pooler-encoded',
    ],
  ];

  for (const [config, label] of connections) {
    if (await tryConnect(config, label)) {
      return;
    }
  }

  console.log('\n❌ All connection methods failed.');
  console.log(
    '\nThe password might be incorrect or the project settings may block external connections.'
  );
  console.log('Please copy and run this SQL in your Supabase dashboard:');
  console.log(
    'https://supabase.com/dashboard/project/bpdehoxivkvrxpxniwjp/sql/new\n'
  );
  console.log(sql);
}

createTable();
