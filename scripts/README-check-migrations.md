# Check Migrations Script

This script helps you see which database migrations have been applied to your Supabase database vs what exists locally.

## Usage

```bash
npm run check-migrations
```

Or directly:

```bash
node scripts/check-migrations.js
```

## Prerequisites

1. Make sure you have a `.env.local` file with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (needed to query the database)

2. Install dotenv (optional, but recommended):
   ```bash
   npm install dotenv --save-dev
   ```

## What it does

1. Scans all migration files in `database/migrations/`
2. For each migration, checks if the tables/columns/functions it creates exist in Supabase
3. Reports which migrations are:
   - ✅ Applied (all objects exist)
   - ❌ Missing (some objects don't exist)

## Limitations

- Index and constraint checking is currently skipped (too complex without direct SQL access)
- Function checking attempts to call functions, which may show false positives if functions require specific parameters
- The script uses a manual mapping of what each migration creates - new migrations need to be added to the checklist

## Adding New Migrations

To add a new migration to the checklist, edit `scripts/check-migrations.js` and add an entry to the `migrationChecks` object:

```javascript
'your_migration_file.sql': {
  tables: ['table1', 'table2'],      // Tables created
  columns: [                          // Columns added
    { table: 'table_name', column: 'column_name' },
  ],
  functions: ['function_name'],       // Functions created
},
```

