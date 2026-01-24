const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qekhwmehjvzktvteopej.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla2h3bWVoanZ6a3R2dGVvcGVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQwNjU4MCwiZXhwIjoyMDcyOTgyNTgwfQ.Z7lmmSfZyuN3mw7YqJJ5nVKQ06ojA9M8i2pq4LDaiUg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    // Query to get all tables in the public schema
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;`,
    });

    if (error) {
      console.error('Error:', error);
      // Try a direct query instead
      const { data: tables, error: err2 } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (err2) {
        console.error('Also failed:', err2);
      } else {
        console.log('Tables found:', tables);
      }
    } else {
      console.log('Tables:', data);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

checkTables();
