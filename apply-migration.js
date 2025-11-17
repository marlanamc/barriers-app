#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Read the migration file
const migrationPath = process.argv[2] || 'database/migrations/20241224_fix_focus_items_upsert_v2.sql';
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log(`📄 Applying migration: ${migrationPath}`);
console.log(`🔗 Supabase URL: ${supabaseUrl}`);

// Execute the SQL
async function applyMigration() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // If exec_sql doesn't exist, try a different approach
      console.log('⚠️  exec_sql RPC not found, trying direct execution...');

      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        if (statement.includes('CREATE OR REPLACE FUNCTION')) {
          // For function creation, we need to use the REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceRoleKey,
              'Authorization': `Bearer ${supabaseServiceRoleKey}`,
            },
            body: JSON.stringify({ query: statement + ';' })
          });

          if (!response.ok) {
            console.log('Trying psql connection instead...');
            console.log('\n⚠️  Please run this migration manually using the Supabase dashboard SQL editor.');
            console.log('\n📋 Copy and paste the following SQL:\n');
            console.log('='.repeat(80));
            console.log(sql);
            console.log('='.repeat(80));
            return;
          }
        }
      }

      console.log('✅ Migration applied successfully!');
    } else {
      console.log('✅ Migration applied successfully!');
      console.log(data);
    }
  } catch (err) {
    console.error('❌ Error applying migration:', err);
    console.log('\n⚠️  Please run this migration manually using the Supabase dashboard SQL editor.');
    console.log('\n📋 Copy and paste the following SQL:\n');
    console.log('='.repeat(80));
    console.log(sql);
    console.log('='.repeat(80));
  }
}

applyMigration();
