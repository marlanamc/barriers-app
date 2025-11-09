# ADHD Barrier Tracker - Setup Guide

## Quick Start

This is a companion app to [ADHD First Aid](https://adhd-first-aid.vercel.app). It shares the same Supabase project but adds user authentication and personal tracking features.

## Prerequisites

- Node.js 18+ installed
- Access to the ADHD First Aid Supabase project
- Supabase CLI (optional, for local development)

## Step 1: Install Dependencies

```bash
cd /path/to/adhd-barrier-tracker
npm install
```

## Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** Use the **same credentials** as your ADHD First Aid app.

## Step 3: Set Up Database

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `database/schema.sql` from this project
4. Copy and paste the entire file into the SQL editor
5. Click **Run**

### Option B: Using Supabase CLI

```bash
# Link to your project (if not already linked)
npx supabase link --project-ref your-project-ref

# Apply the migration
npx supabase db push
```

### Verify Database Setup

Run this query in the SQL Editor:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'user_%'
OR table_name LIKE '%_check_%'
OR table_name LIKE '%_selection%'
ORDER BY table_name;
```

You should see:
- `barrier_selections`
- `daily_check_ins`
- `task_selections`
- `user_calendar_entries`
- `user_profiles`

## Step 4: Configure Authentication

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   - `http://localhost:3000/**` (for development)
   - `https://your-production-domain.com/**` (when deployed)

3. Enable Email provider:
   - Go to **Authentication** → **Providers**
   - Enable **Email**
   - Configure email templates if desired

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Step 6: Test the App

1. **Sign Up**: Create a test account
2. **Daily Check-in**: Select 1-3 barriers and tasks
3. **View Calendar**: See your check-ins tracked over time
4. **View Patterns**: See which barriers you select most often

## Project Structure

```
adhd-barrier-tracker/
├── app/                    # Next.js 15 app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── lib/
│   └── supabase.ts        # Supabase client & query functions
├── database/
│   ├── schema.sql         # Database schema & migrations
│   └── README.md          # Database documentation
├── .env.local.example     # Environment template
├── package.json           # Dependencies
└── README.md              # Project overview
```

## Architecture Overview

### Shared Supabase Project

```
ADHD First Aid Kit               ADHD Barrier Tracker
(Read-only reference)            (Personal tracking)
      ↓                                ↓
   content_types  ←──────SHARED────→  content_types
   content_pages  ←──────SHARED────→  content_pages
                                       ↓
                                  user_profiles
                                  daily_check_ins
                                  barrier_selections
                                  task_selections
                                  user_calendar_entries
```

### Data Flow

1. **User signs up/logs in** → Supabase Auth
2. **Profile created** → `user_profiles` table
3. **Daily check-in** → `daily_check_ins` table
4. **Barrier selection** → `barrier_selections` table (references `content_pages`)
5. **Task selection** → `task_selections` table (references `content_pages`)
6. **Calendar auto-updates** → `user_calendar_entries` (via trigger)

## Available Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push this repo to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Recommended Deployment URL

- Option 1: `barrier-tracker.vercel.app`
- Option 2: `app.adhd-first-aid.com` (custom subdomain)

Update your Supabase redirect URLs after deployment!

## Linking Between Apps

You can link from Barrier Tracker to ADHD First Aid for more information:

```tsx
// In your components
<a href="https://adhd-first-aid.vercel.app/barriers/overwhelmed">
  Learn more about this barrier →
</a>
```

## Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env.local` exists and has correct values
- Restart the dev server after adding environment variables

### "Row Level Security policy violation"
- Make sure you're logged in (auth.uid() must exist)
- Check that RLS policies were created correctly (see `database/schema.sql`)

### "Cannot read from content_pages"
- Verify the ADHD First Aid content tables exist
- Check that you're using the same Supabase project
- Run: `SELECT * FROM content_types LIMIT 1;` to verify

### "Calendar not updating"
- The calendar auto-updates via database triggers
- Check trigger was created: `SELECT * FROM pg_trigger WHERE tgname LIKE '%calendar%';`

## Next Steps

After setup is complete:

1. **Build the UI**: Create barrier selection cards with pastel gradients
2. **Add Authentication**: Implement sign up/login pages
3. **Create Check-in Flow**: Two-step barrier → task selection
4. **Build Calendar View**: Month view showing check-in patterns
5. **Add Analytics**: Show barrier trends and insights

## Support

- See `database/README.md` for database details
- See main `README.md` for project overview
- Check ADHD First Aid Kit docs for content structure

## License

Same license as ADHD First Aid Kit (check parent project)
