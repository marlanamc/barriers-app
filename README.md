# ADHD Barrier Tracker

A lightweight companion app to [ADHD First Aid](https://adhd-first-aid.vercel.app) that helps people with ADHD identify daily barriers and receive quick, supportive guidance.

## Features

- **Two-Step Barrier Selection**: Pick 1-3 ADHD-related barriers, then select specific tasks that feel hard
- **Beautiful Pastel UI**: Gradient cards with icons for visual clarity
- **Contextual Guidance**: Empathetic tips and questions based on your barriers
- **Calendar View**: Track barrier patterns over time
- **Simple Authentication**: Secure sign-up and login with Supabase
- **Light/Dark Themes**: Match ADHD First Aid aesthetic

## Tech Stack

- **Next.js 15** with TypeScript
- **Supabase** - Authentication and database (shared with ADHD First Aid)
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

1. Clone the repository
2. Copy `.env.local.example` to `.env.local` and add your Supabase credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

This app shares the Supabase project with ADHD First Aid Kit. It reads from existing content tables and creates its own user-specific tables.

See `database/schema.sql` for the complete database schema.

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Supabase Project                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │  ADHD First Aid Kit  │        │  Barrier Tracker App │  │
│  │  (Reference Tool)    │        │  (Personal Tracking) │  │
│  └──────────┬───────────┘        └──────────┬───────────┘  │
│             │                               │               │
│             │  READ                         │  READ + WRITE │
│             ↓                               ↓               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Shared Content Tables (Read-Only)            │  │
│  │  • content_types  • content_pages                    │  │
│  │    (barriers, tasks, feelings, etc.)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         User Tracking Tables (Barrier Tracker)       │  │
│  │  • user_profiles      • daily_check_ins              │  │
│  │  • barrier_selections • task_selections              │  │
│  │  • user_calendar_entries                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Supabase Auth (auth.users)              │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Content**: Reads barriers/tasks from `content_pages` (shared with ADHD First Aid)
2. **Authentication**: Supabase Auth handles user sign up/login
3. **Check-ins**: User selections stored in `daily_check_ins`
4. **Tracking**: Granular selections in `barrier_selections` and `task_selections`
5. **Calendar**: Auto-synced via database triggers to `user_calendar_entries`
6. **Security**: Row Level Security ensures users only see their own data

### Key Features

- **Shared Content**: Reads from existing content tables (barriers, tasks, feelings)
- **User Data**: Stores check-ins, selections, and calendar entries in separate tables
- **Authentication**: Uses Supabase Auth for user management
- **Auto-sync**: Calendar entries update automatically via database triggers
- **Privacy**: RLS policies ensure data isolation between users

## Documentation

- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[NEXT_STEPS.md](NEXT_STEPS.md)** - Development roadmap and build guide
- **[database/README.md](database/README.md)** - Database schema documentation
- **[database/schema.sql](database/schema.sql)** - SQL migration script
