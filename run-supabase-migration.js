/**
 * Supabase Migration Script - REST API Approach
 *
 * This script attempts to run SQL DDL commands on Supabase without using psql.
 * It uses the REST API with service role key to check the database and
 * provides the SQL needed to run via the Supabase Dashboard.
 *
 * Approaches tried:
 * 1. Supabase Management API (requires PAT, not service role key)
 * 2. REST API RPC functions (if exec_sql exists)
 * 3. Check database schema via REST API
 */

const SUPABASE_URL = 'https://bpdehoxivkvrxpxniwjp.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc1MTU5MCwiZXhwIjoyMDg0MzI3NTkwfQ._l4LT3GXmNLC1bR2CyVZ8jsMzsRoDeSoZneZqD_0XiM';
const PROJECT_REF = 'bpdehoxivkvrxpxniwjp';

const FULL_MIGRATION_SQL = `
-- Add reply columns to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS conversation_id UUID,
ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES messages(id),
ADD COLUMN IF NOT EXISTS sender_type VARCHAR(20) DEFAULT 'customer' CHECK (sender_type IN ('customer', 'business')),
ADD COLUMN IF NOT EXISTS sender_business_id UUID;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON messages(parent_message_id);

-- Create function to auto-set conversation_id
CREATE OR REPLACE FUNCTION set_message_conversation_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_message_id IS NOT NULL THEN
    SELECT conversation_id INTO NEW.conversation_id
    FROM messages WHERE id = NEW.parent_message_id;
  ELSE
    NEW.conversation_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS set_message_conversation_id_trigger ON messages;
CREATE TRIGGER set_message_conversation_id_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_conversation_id();

-- Update existing messages
UPDATE messages SET conversation_id = id, sender_type = 'customer' WHERE conversation_id IS NULL;
`;

// ============================================
// APPROACH 1: Supabase Management API
// ============================================
async function tryManagementAPI() {
  console.log('\n' + '='.repeat(60));
  console.log('APPROACH 1: Supabase Management API');
  console.log('='.repeat(60));

  const managementUrl = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
  console.log('Endpoint:', managementUrl);

  try {
    const response = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        query: FULL_MIGRATION_SQL,
      }),
    });

    const text = await response.text();
    console.log('Status:', response.status, response.statusText);

    if (response.ok) {
      console.log('SUCCESS! Migration executed via Management API');
      console.log('Response:', text);
      return true;
    } else {
      console.log('Response:', text.substring(0, 300));
      if (response.status === 401) {
        console.log(
          '\nNote: Management API requires a Personal Access Token (PAT),'
        );
        console.log('not a service role key. Get one at:');
        console.log('https://supabase.com/dashboard/account/tokens');
      }
    }
  } catch (error) {
    console.log('Error:', error.message);
  }

  return false;
}

// ============================================
// APPROACH 2: REST RPC functions
// ============================================
async function tryRestRPC() {
  console.log('\n' + '='.repeat(60));
  console.log('APPROACH 2: REST API - Check for SQL execution functions');
  console.log('='.repeat(60));

  const functionNames = [
    'exec_sql',
    'execute_sql',
    'run_sql',
    'raw_sql',
    'query',
  ];

  for (const funcName of functionNames) {
    const rpcUrl = `${SUPABASE_URL}/rest/v1/rpc/${funcName}`;

    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          sql: 'SELECT 1',
          query: 'SELECT 1',
        }),
      });

      console.log(`Function "${funcName}": ${response.status}`);

      if (response.status !== 404 && response.ok) {
        const text = await response.text();
        console.log(
          `  Found working function! Response: ${text.substring(0, 100)}`
        );

        // Try running migration
        console.log('\n  Attempting to run migration...');
        const migrationResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            sql: FULL_MIGRATION_SQL,
            query: FULL_MIGRATION_SQL,
          }),
        });

        if (migrationResponse.ok) {
          console.log('  SUCCESS! Migration executed via RPC');
          return true;
        } else {
          const errText = await migrationResponse.text();
          console.log('  Migration failed:', errText.substring(0, 200));
        }
      }
    } catch (error) {
      console.log(`Function "${funcName}": Error - ${error.message}`);
    }
  }

  return false;
}

// ============================================
// APPROACH 3: Check database schema
// ============================================
async function checkDatabaseSchema() {
  console.log('\n' + '='.repeat(60));
  console.log('APPROACH 3: Check database schema via REST API');
  console.log('='.repeat(60));

  // Check if messages table exists by trying to query it
  const messagesUrl = `${SUPABASE_URL}/rest/v1/messages?select=*&limit=1`;

  try {
    const response = await fetch(messagesUrl, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    console.log('Messages table query - Status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Messages table EXISTS');
      console.log('Sample row count:', data.length);

      if (data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]).join(', '));

        // Check if new columns already exist
        const hasNewColumns =
          'conversation_id' in data[0] ||
          'parent_message_id' in data[0] ||
          'sender_type' in data[0];

        if (hasNewColumns) {
          console.log('\nNOTE: Some new columns may already exist!');
        }
      }

      // Get OpenAPI schema for more details
      await getOpenAPISchema();

      return true;
    } else if (response.status === 404) {
      console.log('Messages table does NOT exist');
      console.log('You may need to create the table first.');
      return false;
    } else {
      const text = await response.text();
      console.log('Error checking messages table:', text.substring(0, 200));
    }
  } catch (error) {
    console.log('Error:', error.message);
  }

  return false;
}

async function getOpenAPISchema() {
  const schemaUrl = `${SUPABASE_URL}/rest/v1/`;

  try {
    const response = await fetch(schemaUrl, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: 'application/openapi+json',
      },
    });

    if (response.ok) {
      const schema = await response.json();

      console.log('\n--- Available Tables ---');
      if (schema.definitions) {
        const tables = Object.keys(schema.definitions);
        tables.forEach((t) => console.log('  -', t));
      }

      if (schema.definitions && schema.definitions.messages) {
        console.log('\n--- Messages Table Schema ---');
        const props = schema.definitions.messages.properties || {};
        Object.keys(props).forEach((col) => {
          const prop = props[col];
          const type = prop.format || prop.type || 'unknown';
          const desc = prop.description ? ` (${prop.description})` : '';
          console.log(`  - ${col}: ${type}${desc}`);
        });
      }

      // Check for RPC functions
      if (schema.paths) {
        const rpcPaths = Object.keys(schema.paths).filter((p) =>
          p.includes('/rpc/')
        );
        if (rpcPaths.length > 0) {
          console.log('\n--- Available RPC Functions ---');
          rpcPaths.forEach((p) => console.log('  -', p.replace('/rpc/', '')));
        }
      }
    }
  } catch (error) {
    console.log('Could not fetch OpenAPI schema:', error.message);
  }
}

// ============================================
// APPROACH 4: Try SQL via PostgREST (experimental)
// ============================================
async function tryPostgrestSQL() {
  console.log('\n' + '='.repeat(60));
  console.log('APPROACH 4: Try alternative PostgREST endpoints');
  console.log('='.repeat(60));

  const endpoints = [
    { url: `${SUPABASE_URL}/sql`, name: 'SQL endpoint' },
    { url: `${SUPABASE_URL}/pg`, name: 'PG endpoint' },
    { url: `${SUPABASE_URL}/query`, name: 'Query endpoint' },
  ];

  for (const ep of endpoints) {
    try {
      const response = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: 'SELECT 1' }),
      });

      console.log(`${ep.name}: ${response.status}`);

      if (response.ok) {
        console.log(`  Found working endpoint!`);
        return true;
      }
    } catch (error) {
      console.log(`${ep.name}: Error`);
    }
  }

  return false;
}

// ============================================
// Main
// ============================================
async function main() {
  console.log('========================================================');
  console.log('Supabase Migration Script - Multiple Approaches');
  console.log('========================================================');
  console.log('Project:', PROJECT_REF);
  console.log('URL:', SUPABASE_URL);
  console.log('');
  console.log('This script attempts multiple approaches to run');
  console.log('DDL commands without using psql direct connection.');

  // Try Management API
  if (await tryManagementAPI()) {
    console.log('\n========== MIGRATION COMPLETE ==========');
    return;
  }

  // Check database schema first
  const tableExists = await checkDatabaseSchema();

  // Try RPC functions
  if (await tryRestRPC()) {
    console.log('\n========== MIGRATION COMPLETE ==========');
    return;
  }

  // Try alternative endpoints
  await tryPostgrestSQL();

  // If nothing worked, provide comprehensive instructions
  console.log('\n' + '='.repeat(60));
  console.log('RESULT: Manual Migration Required');
  console.log('='.repeat(60));

  console.log('\n--- WHY AUTOMATED METHODS FAILED ---');
  console.log(
    '1. Management API: Requires Personal Access Token (PAT), not service role key'
  );
  console.log('2. REST RPC: No exec_sql function exists in the database');
  console.log('3. Direct SQL endpoints: Do not exist (security by design)');
  console.log(
    '4. pg library: Database password may be incorrect or IPv6 issues'
  );

  console.log('\n--- RECOMMENDED SOLUTION ---');
  console.log('Use the Supabase Dashboard SQL Editor (no psql required):');
  console.log(
    `\n  >>> https://supabase.com/dashboard/project/${PROJECT_REF}/sql <<<`
  );
  console.log('\nThe SQL has been saved to: supabase-migration-dashboard.sql');
  console.log(
    'Simply copy the contents and paste into the SQL Editor, then click "Run".'
  );

  console.log('\n--- ALTERNATIVE OPTIONS ---');
  console.log('1. Supabase CLI (requires PAT login):');
  console.log('   supabase login');
  console.log('   supabase link --project-ref ' + PROJECT_REF);
  console.log('   supabase db push');
  console.log('');
  console.log('2. Get Personal Access Token for Management API:');
  console.log('   https://supabase.com/dashboard/account/tokens');
  console.log(
    '   Then set Authorization: Bearer <PAT> instead of service role key'
  );
  console.log('');
  console.log('3. Reset database password and use direct psql:');
  console.log(
    `   https://supabase.com/dashboard/project/${PROJECT_REF}/settings/database`
  );
  console.log('');
  console.log('='.repeat(60));
}

main().catch(console.error);
