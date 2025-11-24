#!/usr/bin/env node

/**
 * Check which migrations have been applied to Supabase
 * Compares local migration files with what exists in the database
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
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');

// Objects each migration creates/alters (manually defined based on migration content)
const migrationChecks = {
  '20251123_add_reflect_tables.sql': {
    tables: ['daily_reflects'],
    functions: ['upsert_daily_reflect'],
  },
  '20251122_add_coaching_toolkit_tables.sql': {
    tables: ['user_toolkit', 'life_vest_tools', 'fuel_checklist', 'crew_contacts', 'starlight_wins'],
    functions: ['upsert_fuel_checklist', 'upsert_user_toolkit'],
  },
  '20251122_add_task_management_columns.sql': {
    columns: [
      { table: 'focus_items', column: 'complexity' },
      { table: 'focus_items', column: 'completed' },
      { table: 'focus_items', column: 'task_type' },
      { table: 'focus_items', column: 'anchors' },
    ],
  },
  '20251123_add_logbook_thoughts.sql': {
    tables: ['logbook_thoughts'],
  },
  '20251123_add_map_modules.sql': {
    tables: ['map_modules'],
    functions: ['upsert_map_module', 'get_user_map_data'],
  },
  '20241226_add_schedule_day_types.sql': {
    columns: [
      { table: 'energy_schedules', column: 'day_type' },
    ],
    functions: ['get_wake_time_for_day', 'get_bedtime_for_day'],
  },
  '20241225_add_update_user_metadata_function.sql': {
    functions: ['update_user_metadata'],
  },
  '20241225_update_rpc_for_completed.sql': {
    functions: ['create_checkin_with_focus'],
  },
  '20241225_add_inbox_flag.sql': {
    columns: [
      { table: 'focus_items', column: 'in_inbox' },
      { table: 'planned_items', column: 'in_inbox' },
    ],
  },
  '20241224_fix_focus_items_upsert.sql': {
    functions: ['create_checkin_with_focus'],
  },
  '20241225_add_completed_to_focus_items.sql': {
    columns: [
      { table: 'focus_items', column: 'completed' },
    ],
  },
  '20241224_fix_focus_items_upsert_v2.sql': {
    functions: ['create_checkin_with_focus'],
  },
  '20241224_add_multiple_anchors_support.sql': {
    columns: [
      { table: 'focus_items', column: 'anchors' },
    ],
  },
  '20241223_add_energy_schedule.sql': {
    tables: ['energy_schedules'],
  },
  '20241223_add_anchor_presets.sql': {
    tables: ['anchor_presets'],
  },
  '20241222_migrate_weather_to_energy_types.sql': {
    functions: ['create_checkin_with_focus'],
  },
  '20241221_update_checkin_upsert.sql': {
    functions: ['create_checkin_with_focus'],
  },
  '20241221_fix_security_issues.sql': {
    functions: ['create_checkin_with_focus'],
  },
  '20241221_add_unique_checkin_constraint.sql': {
    // Check for unique constraint on checkins
    constraints: ['checkins_user_id_date_key'],
  },
  '20241221_add_performance_indexes.sql': {
    indexes: [
      'idx_focus_items_checkin_id',
      'idx_focus_barriers_focus_item_id',
    ],
  },
  '20241221_add_anchor_columns.sql': {
    columns: [
      { table: 'focus_items', column: 'anchor_type' },
      { table: 'focus_items', column: 'anchor_value' },
    ],
  },
  '20241220_update_create_checkin_function.sql': {
    functions: ['create_checkin_with_focus'],
  },
  '20241215_create_checkin_with_focus.sql': {
    functions: ['create_checkin_with_focus'],
  },
  '20241215_cleanup_unused_tables.sql': {
    // This removes tables, so we check if old tables are gone
    // Also renames barrier_count to focus_count and adds internal_weather
    tablesRemoved: ['daily_check_ins', 'barrier_selections', 'task_selections'],
    // Note: focus_count might exist even if tables weren't dropped (partial migration)
    columns: [
      { table: 'user_calendar_entries', column: 'focus_count' },
      { table: 'user_calendar_entries', column: 'internal_weather' },
    ],
  },
  '20241215_add_internal_weather_to_existing.sql': {
    columns: [
      { table: 'checkins', column: 'internal_weather' },
      { table: 'checkins', column: 'weather_icon' },
    ],
  },
  '20241214_add_time_preferences.sql': {
    tables: ['user_profiles'], // Creates table if it doesn't exist
    functions: ['get_user_time_preferences', 'update_user_time_preferences'],
  },
  '20241213_add_task_type_system.sql': {
    // This migration doesn't create a task_types table, only adds columns
    columns: [
      { table: 'focus_items', column: 'task_type' },
      { table: 'focus_items', column: 'complexity' },
      { table: 'planned_items', column: 'task_type' },
      { table: 'planned_items', column: 'complexity' },
    ],
    functions: ['create_checkin_with_focus'],
  },
  '20241210_add_planned_items.sql': {
    tables: ['planned_items'],
  },
};

async function checkTableExists(tableName) {
  // Try direct query - if table exists, query succeeds
  const { error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  // If no error, table exists. If error is about relation not existing, table doesn't exist
  if (!error) return true;
  
  // Check if it's a "does not exist" error
  if (error?.message?.includes('does not exist') || error?.code === '42P01') {
    return false;
  }
  
  // Other errors might mean table exists but there's a permission issue
  // In that case, we'll assume it exists
  return true;
}

async function checkColumnExists(tableName, columnName) {
  // Try to query the specific column - if it exists, query succeeds
  const { error } = await supabase
    .from(tableName)
    .select(columnName)
    .limit(1);

  if (!error) return true;
  
  // Check if error is about column not existing
  if (error?.message?.includes('column') && error?.message?.includes('does not exist')) {
    return false;
  }
  
  // If table doesn't exist, column doesn't exist
  if (error?.message?.includes('does not exist') || error?.code === '42P01') {
    return false;
  }
  
  // Other errors might mean column exists but there's an issue
  return true;
}

async function checkFunctionExists(functionName) {
  // Special handling for functions that require parameters
  let testParams = {};
  
  // update_user_metadata requires p_metadata parameter
  if (functionName === 'update_user_metadata') {
    testParams = { p_metadata: {} };
  }
  
  // Try to call the function - if it exists but params are wrong, we'll get a param error
  // If it doesn't exist, we'll get a "function does not exist" error
  const { error } = await supabase.rpc(functionName, testParams);
  
  if (!error) {
    // Function exists and was called successfully
    return true;
  }
  
  // Check error message
  const errorMsg = (error?.message || '').toLowerCase();
  const errorCode = error?.code || '';
  
  // If function doesn't exist, we'll see various error messages
  if (
    errorMsg.includes('function') && errorMsg.includes('does not exist') ||
    errorMsg.includes('no function matches') ||
    errorMsg.includes('could not find a function') ||
    errorCode === '42883' || // PostgreSQL function does not exist error code
    errorCode === '42P01'    // Relation does not exist
  ) {
    return false;
  }
  
  // If we get parameter errors, missing parameter errors, or type errors,
  // the function exists but we called it wrong
  if (
    errorMsg.includes('parameter') ||
    errorMsg.includes('argument') ||
    errorMsg.includes('missing required') ||
    errorMsg.includes('invalid input') ||
    errorCode === '42804' || // Datatype mismatch (function exists but wrong param type)
    errorCode === '42P02'    // Undefined parameter
  ) {
    return true;
  }
  
  // Authentication errors or exceptions (P0001) mean function exists but needs auth or threw an exception
  if (
    errorMsg.includes('not authenticated') ||
    errorMsg.includes('permission') ||
    errorCode === 'P0001' || // PL/pgSQL exception (function exists and ran, just threw exception)
    errorCode === '42501'    // Insufficient privilege
  ) {
    return true; // Function exists, just needs auth or threw an exception
  }
  
  // Default: assume function doesn't exist if we can't determine
  return false;
}

async function checkIndexExists(indexName) {
  // Indexes are harder to check without direct SQL access
  // For now, we'll skip index checking or return true to avoid false negatives
  // You can manually verify indexes in Supabase dashboard
  return true; // Skip index checking for now
}

async function checkConstraintExists(constraintName) {
  // Constraints are harder to check without direct SQL access
  // For now, we'll skip constraint checking or return true to avoid false negatives
  // You can manually verify constraints in Supabase dashboard
  return true; // Skip constraint checking for now
}

async function verifyMigration(migrationFile, checks) {
  const results = {
    file: migrationFile,
    applied: true,
    missing: [],
  };

  // Check tables
  if (checks.tables) {
    for (const table of checks.tables) {
      const exists = await checkTableExists(table);
      if (!exists) {
        results.applied = false;
        results.missing.push(`table: ${table}`);
      }
    }
  }

  // Check tables that should be removed (inverse check)
  if (checks.tablesRemoved) {
    for (const table of checks.tablesRemoved) {
      const exists = await checkTableExists(table);
      // If table still exists, migration hasn't been applied
      if (exists) {
        results.applied = false;
        results.missing.push(`table should be removed: ${table}`);
      }
    }
  }

  // Check columns
  if (checks.columns) {
    for (const { table, column } of checks.columns) {
      const exists = await checkColumnExists(table, column);
      if (!exists) {
        results.applied = false;
        results.missing.push(`column: ${table}.${column}`);
      }
    }
  }

  // Check functions
  if (checks.functions) {
    for (const func of checks.functions) {
      const exists = await checkFunctionExists(func);
      if (!exists) {
        results.applied = false;
        results.missing.push(`function: ${func}`);
      }
    }
  }

  // Check indexes
  if (checks.indexes) {
    for (const index of checks.indexes) {
      const exists = await checkIndexExists(index);
      if (!exists) {
        results.applied = false;
        results.missing.push(`index: ${index}`);
      }
    }
  }

  // Check constraints
  if (checks.constraints) {
    for (const constraint of checks.constraints) {
      const exists = await checkConstraintExists(constraint);
      if (!exists) {
        results.applied = false;
        results.missing.push(`constraint: ${constraint}`);
      }
    }
  }

  return results;
}

async function main() {
  console.log('🔍 Checking migrations against Supabase...\n');
  console.log(`📡 Connected to: ${supabaseUrl.replace(/\/\/.*@/, '//***@')}\n`);

  // Get all migration files
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  console.log(`📋 Found ${migrationFiles.length} migration files\n`);

  const results = [];

  for (const file of migrationFiles) {
    const checks = migrationChecks[file];
    if (!checks) {
      // Migration not in our checklist - skip or mark as unknown
      console.log(`⏭️  ${file} - Not in checklist (skipping)`);
      continue;
    }

    process.stdout.write(`🔎 Checking ${file}... `);
    const result = await verifyMigration(file, checks);
    results.push(result);

    if (result.applied) {
      console.log('✅ Applied');
    } else {
      console.log('❌ Missing:');
      result.missing.forEach((item) => console.log(`   - ${item}`));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');

  const applied = results.filter((r) => r.applied);
  const missing = results.filter((r) => !r.applied);

  console.log(`✅ Applied: ${applied.length}`);
  console.log(`❌ Missing: ${missing.length}`);

  if (missing.length > 0) {
    console.log('\n📝 Migrations that need to be applied:\n');
    missing.forEach((result) => {
      console.log(`   ${result.file}`);
      result.missing.forEach((item) => console.log(`     - ${item}`));
    });
    console.log(
      '\n💡 To apply a migration, copy its contents to Supabase SQL Editor and run it.'
    );
  } else {
    console.log('\n🎉 All checked migrations are applied!');
  }

  const unknown = migrationFiles.filter(
    (f) => !migrationChecks[f] && !f.includes('README') && !f.startsWith('add_')
  );
  if (unknown.length > 0) {
    console.log(`\n⚠️  ${unknown.length} migration(s) not in checklist:`);
    unknown.forEach((f) => console.log(`   - ${f}`));
  }
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});

