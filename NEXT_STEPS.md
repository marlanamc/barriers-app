# Next Steps - Building the ADHD Barrier Tracker

## ✅ What's Done

- [x] Project structure created
- [x] Dependencies configured (Next.js 15, TypeScript, Tailwind, Supabase)
- [x] Database schema designed with RLS and triggers
- [x] Supabase client and query functions
- [x] Pastel gradient CSS classes
- [x] Basic landing page
- [x] Complete documentation

## 🚀 What to Build Next

### Phase 1: Core Functionality (MVP)

#### 1. Authentication Pages
**Priority: HIGH**

Create these pages:
- `/app/auth/login/page.tsx` - Login form
- `/app/auth/signup/page.tsx` - Sign up form
- `/app/auth/callback/page.tsx` - OAuth callback handler
- `/components/AuthProvider.tsx` - Auth context wrapper

**Features:**
- Email/password authentication
- "Remember me" functionality
- Password reset flow
- Redirect after login to dashboard

#### 2. Dashboard
**Priority: HIGH**

Create: `/app/dashboard/page.tsx`

**Features:**
- Welcome message with user's name
- "Start Today's Check-in" button (prominent)
- Quick stats: check-ins this week, most common barrier
- Recent check-ins list (last 7 days)

#### 3. Two-Step Check-in Flow
**Priority: HIGH**

Create these pages:
- `/app/check-in/barriers/page.tsx` - Step 1: Select barriers
- `/app/check-in/tasks/page.tsx` - Step 2: Select tasks
- `/app/check-in/complete/page.tsx` - Summary & confirmation

**Step 1: Barriers (Select 1-3)**
```tsx
// Beautiful pastel gradient cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {barriers.map(barrier => (
    <BarrierCard
      key={barrier.slug}
      name={barrier.name}
      emoji={barrier.emoji}
      gradient="gradient-pink" // Rotate through pastel gradients
      selected={selectedBarriers.includes(barrier.slug)}
      onToggle={() => toggleBarrier(barrier.slug)}
    />
  ))}
</div>
```

**Step 2: Tasks (Select specific ones)**
```tsx
// Show only after barriers selected
// Filter tasks by relevance to selected barriers (optional enhancement)
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {tasks.map(task => (
    <TaskCard
      key={task.slug}
      name={task.name}
      emoji={task.emoji}
      selected={selectedTasks.includes(task.slug)}
      onToggle={() => toggleTask(task.slug)}
    />
  ))}
</div>
```

**Step 3: Complete**
```tsx
// Summary of selections
// Optional: mood & energy sliders (1-5)
// Notes textarea
// "Complete Check-in" button → saves to database
```

#### 4. Calendar View
**Priority: MEDIUM**

Create: `/app/calendar/page.tsx`

**Features:**
- Month view showing check-in dates
- Color-coded by barrier count (more barriers = darker color)
- Click date → see that day's check-in details
- Navigate between months
- Highlight today

**Implementation tip:**
```tsx
// Fetch calendar data for the month
const entries = await getCalendarEntries(
  userId,
  startOfMonth,
  endOfMonth
);

// Render calendar grid
<CalendarGrid entries={entries} />
```

#### 5. Pattern Insights
**Priority: MEDIUM**

Create: `/app/insights/page.tsx`

**Features:**
- "Your Most Common Barriers" (bar chart or simple list)
- "Barrier Trends" (line graph over time - optional)
- "Task Completion Rate" (percentage)
- Links to ADHD First Aid for each barrier

### Phase 2: Enhanced Features

#### 6. Check-in History
Create: `/app/history/page.tsx`

- List of all check-ins
- Filter by date range
- Search by barrier/task
- Export to CSV (optional)

#### 7. User Settings
Create: `/app/settings/page.tsx`

- Edit display name
- Change timezone
- Notification preferences
- Delete account

#### 8. Contextual Guidance
Enhance: `/app/check-in/complete/page.tsx`

After check-in, show:
- Personalized tips based on selected barriers
- Links to relevant ADHD First Aid content
- Suggested strategies

### Phase 3: Polish

#### 9. Dark Mode
- Implement dark mode toggle
- Store preference in user_profiles
- Adjust pastel gradients for dark mode

#### 10. Mobile Optimization
- Test on mobile devices
- Add touch-friendly interactions
- Install as PWA

#### 11. Onboarding
Create: `/app/onboarding/page.tsx`

- Show on first login
- Explain how to use the app
- Sample check-in walkthrough

## 🎨 Component Library Suggestions

### Key Components to Build

1. **BarrierCard** - Pastel gradient card with emoji, name, checkbox
2. **TaskCard** - Simpler card for task selection
3. **CalendarGrid** - Month view with clickable dates
4. **CheckInSummary** - Shows completed check-in details
5. **PatternChart** - Visualize barrier frequency
6. **StepIndicator** - Progress indicator for multi-step flow

### Styling Tips

**Pastel Gradients (Already in globals.css):**
- `.gradient-pink` - Pink pastel
- `.gradient-purple` - Purple pastel
- `.gradient-blue` - Blue pastel
- `.gradient-green` - Green pastel
- `.gradient-yellow` - Yellow pastel
- `.gradient-peach` - Peach pastel

**Assign gradients dynamically:**
```tsx
const gradients = [
  'gradient-pink',
  'gradient-purple',
  'gradient-blue',
  'gradient-green',
  'gradient-yellow',
  'gradient-peach'
];

const gradient = gradients[index % gradients.length];
```

## 📊 Data Flow Examples

### Creating a Check-in

```tsx
// 1. User selects barriers and tasks in UI
const selectedBarriers = ['overwhelmed', 'low-energy', 'cant-focus'];
const selectedTasks = ['phone-calls', 'laundry', 'emails'];

// 2. Submit check-in
const checkIn = await createCheckIn(userId, {
  selected_barriers: selectedBarriers,
  selected_tasks: selectedTasks,
  mood_level: 3,
  energy_level: 2,
  notes: "Feeling extra scattered today"
});

// 3. Create barrier selections (loop through)
for (const barrierSlug of selectedBarriers) {
  const barrier = await getBarrierBySlug(barrierSlug);
  await supabase.from('barrier_selections').insert({
    check_in_id: checkIn.id,
    user_id: userId,
    barrier_slug: barrierSlug,
    barrier_name: barrier.name
  });
}

// 4. Create task selections (similar)
// 5. Calendar auto-updates via trigger!
```

### Viewing Calendar

```tsx
// Get current month range
const startDate = '2025-01-01';
const endDate = '2025-01-31';

// Fetch calendar entries
const entries = await getCalendarEntries(userId, startDate, endDate);

// entries will have:
// - date
// - barrier_count
// - task_count
// - top_barriers
// - has_check_in (boolean)
```

## 🔗 Integration with ADHD First Aid

### Reading Content

```tsx
// Get all barriers from ADHD First Aid
const barriers = await getBarriers();

// Filter to only barrier content type
// You may need to adjust the query to join with content_types
const { data } = await supabase
  .from('content_pages')
  .select('*, content_types!inner(*)')
  .eq('content_types.name', 'barrier')
  .eq('is_published', true);
```

### Linking to Content

```tsx
// When showing barrier insights
<a
  href={`https://adhd-first-aid.vercel.app/barriers/${barrier.slug}`}
  className="text-purple-600 hover:underline"
  target="_blank"
>
  Learn more about {barrier.name} →
</a>
```

## 🚢 Deployment Checklist

Before deploying:

- [ ] Run database migration in production Supabase
- [ ] Set up Vercel project
- [ ] Add environment variables in Vercel
- [ ] Update Supabase redirect URLs
- [ ] Test authentication flow
- [ ] Test check-in creation
- [ ] Verify RLS policies work correctly

## 📝 Quick Commands

```bash
# Start development
npm run dev

# Type checking
npx tsc --noEmit

# Build for production
npm run build

# Test production build locally
npm run build && npm start
```

## 🎯 Success Criteria

Your MVP is complete when users can:

1. ✅ Sign up and log in
2. ✅ Complete a daily check-in (barriers + tasks)
3. ✅ View their check-in history
4. ✅ See a calendar of their check-ins
5. ✅ View their most common barriers

## 💡 Future Enhancements

- Push notifications for daily check-ins
- Weekly email summaries
- Share progress with therapist/coach
- Community features (anonymous barrier sharing)
- Integration with calendar apps (iCal, Google Calendar)
- Streak tracking and gamification
- AI-powered pattern insights

---

**Ready to start?** Begin with Phase 1, Step 1 (Authentication Pages).

Need help? Check:
- `SETUP.md` for environment setup
- `database/README.md` for database queries
- `lib/supabase.ts` for available functions
