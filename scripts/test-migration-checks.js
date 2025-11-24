#!/usr/bin/env node

/**
 * Quick test script to check specific objects in the database
 * This helps debug why migrations might be showing as missing
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env.local manually if dotenv is not available
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  // Try dotenv first
  try {
    require('dotenv').config({ path: envPath });
    return;
  } catch (e) {
    // dotenv not available, read file manually
  }

  // Read .env.local manually
  try {
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, 'utf8');
      envFile.split('\n').forEach((line) => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (e) {
    console.warn('⚠️  Could not read .env.local file:', e.message);
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testChecks() {
  console.log('🔍 Testing database objects...\n');

  // Test tables
  console.log('📋 Tables:');
  const tablesToCheck = ['task_types', 'daily_check_ins', 'barrier_selections', 'task_selections'];
  for (const table of tablesToCheck) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        if (error.message.includes('does not exist') || error.code === '42P01') {
          console.log(`  ❌ ${table} - does NOT exist`);
        } else {
          console.log(`  ⚠️  ${table} - error: ${error.message}`);
        }
      } else {
        console.log(`  ✅ ${table} - EXISTS`);
      }
    } catch (e) {
      console.log(`  ❌ ${table} - error: ${e.message}`);
    }
  }

  // Test columns
  console.log('\n📊 Columns:');
  const columnsToCheck = [
    { table: 'focus_items', column: 'task_type' },
    { table: 'focus_items', column: 'complexity' },
    { table: 'user_calendar_entries', column: 'focus_count' },
  ];
  for (const { table, column } of columnsToCheck) {
    try {
      const { error } = await supabase.from(table).select(column).limit(1);
      if (error) {
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.log(`  ❌ ${table}.${column} - does NOT exist`);
        } else if (error.message.includes('does not exist') || error.code === '42P01') {
          console.log(`  ❌ ${table} - table does not exist`);
        } else {
          console.log(`  ⚠️  ${table}.${column} - error: ${error.message}`);
        }
      } else {
        console.log(`  ✅ ${table}.${column} - EXISTS`);
      }
    } catch (e) {
      console.log(`  ❌ ${table}.${column} - error: ${e.message}`);
    }
  }

  // Test functions
  console.log('\n⚙️  Functions:');
  const functionsToCheck = [
    { name: 'update_user_metadata', params: {} },
    { name: 'update_user_metadata', params: { p_metadata: {} } }, // Try with correct param name
  ];
  
  for (const func of functionsToCheck) {
    try {
      // Try calling with params
      const { error, data } = await supabase.rpc(func.name, func.params);
      if (error) {
        const errorMsg = (error.message || '').toLowerCase();
        if (
          errorMsg.includes('function') && errorMsg.includes('does not exist') ||
          errorMsg.includes('no function matches') ||
          error.code === '42883'
        ) {
          console.log(`  ❌ ${func.name}() - does NOT exist`);
          console.log(`     Error: ${error.message}`);
          console.log(`     Tried params: ${JSON.stringify(func.params)}`);
        } else if (
          errorMsg.includes('parameter') ||
          errorMsg.includes('argument') ||
          errorMsg.includes('not authenticated') ||
          errorMsg.includes('permission denied')
        ) {
          console.log(`  ✅ ${func.name}() - EXISTS (got expected param/auth/permission error)`);
          console.log(`     Error: ${error.message}`);
          console.log(`     Error code: ${error.code}`);
          break; // Found it, no need to try other variants
        } else {
          console.log(`  ⚠️  ${func.name}() - unclear: ${error.message}`);
          console.log(`     Error code: ${error.code}`);
          console.log(`     Tried params: ${JSON.stringify(func.params)}`);
        }
      } else {
        console.log(`  ✅ ${func.name}() - EXISTS and callable`);
        console.log(`     Response: ${data ? 'got data' : 'no data'}`);
        break; // Found it
      }
    } catch (e) {
      console.log(`  ❌ ${func.name}() - error: ${e.message}`);
    }
  }
  
  // Also test create_checkin_with_focus
  try {
    const { error } = await supabase.rpc('create_checkin_with_focus', {});
    if (error) {
      const errorMsg = (error.message || '').toLowerCase();
      if (
        errorMsg.includes('parameter') ||
        errorMsg.includes('argument') ||
        errorMsg.includes('not authenticated')
      ) {
        console.log(`  ✅ create_checkin_with_focus() - EXISTS (got expected param/auth error)`);
      } else {
        console.log(`  ⚠️  create_checkin_with_focus() - unclear: ${error.message}`);
      }
    } else {
      console.log(`  ✅ create_checkin_with_focus() - EXISTS and callable`);
    }
  } catch (e) {
    console.log(`  ❌ create_checkin_with_focus() - error: ${e.message}`);
  }

  console.log('\n✅ Test complete!');
}

testChecks().catch(console.error);

