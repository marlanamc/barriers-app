# ADHD Barrier Tracker - Product Vision & Strategy

> **Last Updated:** 2025-11-12
>
> **Purpose:** This document captures the vision, strategy, and implementation plan for the ADHD Barrier Tracker app - a kind, research-backed tool that helps people work WITH their nervous system, not against it.

---

## Table of Contents

1. [Core Vision](#core-vision)
2. [Core Problem & Philosophy](#core-problem--philosophy)
3. [Current State Analysis](#current-state-analysis)
4. [Strategic Phases](#strategic-phases)
5. [Priority Implementation Plan](#priority-implementation-plan)
6. [Feature Deep Dives](#feature-deep-dives)
   - [Capacity Calculation System](#capacity-calculation-system)
   - [Time-of-Day Windows](#time-of-day-windows)
   - [Medication Tracking](#medication-tracking)
   - [Command Center Homepage](#command-center-homepage)
7. [User Experience & Design](#user-experience--design)
8. [Onboarding Flow](#onboarding-flow)
9. [Technical Implementation](#technical-implementation)

---

## Core Vision

**The ultimate purpose:** Help people understand their energy levels, manage their day realistically, and understand the barriers preventing them from "just getting it done."

### Key Insight
ADHD people KNOW what they need to do, but executive function issues prevent them from starting. This app:
- Helps identify ideal hours for productivity
- Identifies when to rest and shut it down
- Provides structure and constraints (which ADHD brains need more than we think)
- Focuses on capacity, not productivity theater

### What This Is NOT
- ❌ A "hustle culture" 100-tasks-per-day app
- ❌ A "just do it" motivational app
- ❌ A generic todo list

### What This IS
- ✅ Work WITH your body and mind
- ✅ Success = 1-2 meaningful tasks completed
- ✅ Focus on capacity, not productivity theater
- ✅ Research-backed tips from [ADHD First Aid Kit](https://adhd-first-aid.vercel.app/)

---

## Core Problem & Philosophy

### The ADHD Paradox
People with ADHD know exactly what they need to do, but executive dysfunction creates an invisible wall between knowing and doing. They spend entire days worrying about tasks instead of doing them, wasting precious energy on task-avoidance rather than task-completion.

**Real Example:** "I need to apply to jobs today" → No plan + open day + executive dysfunction = 7pm panic-mode work with depleted energy from a full day of worry.

### Core Principles

#### 1. Work WITH Your Body and Mind
- Structure + Constraints = ADHD Success
- Open days are the enemy
- Energy awareness prevents self-sabotage (deep cleaning instead of emailing)
- Time-boxing and anchoring create guardrails

#### 2. Barriers Are Solvable
- Can't start? → 5-minute timer
- Shame spiral? → Name it, interrupt it, reframe it
- Research-backed interventions

#### 3. Respect the Nervous System
- After 6pm: No deep work (maybe light cleaning, but done)
- Prevent time blindness with structure
- Honor hard stop times

---

## Current State Analysis

### ✅ What's Working Well

| Feature | Status | Notes |
|---------|--------|-------|
| Internal Weather Check-in | ✅ Live | Captures energy (sparky/steady/flowing/foggy/resting) |
| Focus Items | ✅ Live | Up to 5 tasks with categories |
| Barrier Identification | ✅ Live | Named barriers (overwhelm, energy, time, etc.) |
| Anchoring System | ✅ Live | Multiple anchors (at 3pm while listening to music) |
| Calendar View | ✅ Live | Historical tracking of energy patterns |
| Gentle Support | ✅ Live | Tips based on selected barriers |

### ⚠️ Missing Critical Pieces

| Missing Feature | Impact | Priority |
|----------------|--------|----------|
| Energy-based scheduling recommendations | 🔥 HUGE | HIGH |
| Capacity planning & warnings | 🔥 HUGE | HIGH |
| Morning Command Center | 🔥 HUGE | HIGH |
| Active barrier interruption | 💡 MEDIUM | MEDIUM |
| Medication/routine integration | 🔥 HIGH | HIGH |
| Actionable pattern insights | 💡 MEDIUM | MEDIUM |

---

## Strategic Phases

### Phase 1: Energy Intelligence (Foundation) ⭐ HIGH PRIORITY

**Goal:** Help users understand their energy patterns and optimal work windows

**Features:**
1. **Energy Schedule Enhancement**
   - ✅ DONE: Energy schedule feature exists
   - ⚠️ NEEDS: Make more prominent in daily planning
   - Add: "Predicted Energy" widget on homepage
   - Add: Visual timeline showing peaks/valleys

2. **Smart Scheduling Recommendations**
   - When adding focus item, show: "Based on your patterns, you're most productive 9-11am (sparky) or 2-4pm (steady)"
   - Suggest anchors tied to energy peaks

3. **Medication-Aware Scheduling**
   - Track medication in settings
   - Factor medication windows into recommendations
   - Example: "Adderall peaks 10am-2pm" → Suggest hard tasks then

---

### Phase 2: Capacity Management 🎯 HIGH PRIORITY

**Goal:** Prevent over-scheduling and honor actual capacity

**Features:**
1. **Daily Capacity Calculator**
   - Foggy = 1 meaningful task
   - Sparky = 2-3 tasks (watch for burnout)
   - Steady = 2-3 tasks

2. **Focus Item Difficulty Rating**
   - Add "How hard is this?" (Easy/Medium/Hard)
   - Hard task = 2x capacity cost
   - Show: "2/3 tasks for your foggy day"

3. **Protective Warnings**
   - User tries 5th task on foggy day: "⚠️ This is more than your capacity today. Consider moving something to tomorrow."

---

### Phase 3: Barrier Interruption System 💡 MEDIUM PRIORITY

**Goal:** Active intervention when barriers prevent action

**Features:**
1. **"Can't Get Started" Flow**
   - Task incomplete multiple times → "Still stuck? Let's break it down."
   - Mini-flow: 5-min timer / body doubling / break into steps

2. **Shame Spiral Detector**
   - "Shame" barrier repeated → "I notice shame coming up. Let's interrupt that pattern."
   - Guided reframe: "What would you tell a friend?"

3. **Procrastination Pattern Alert**
   - Task postponed 3+ days → "What's really in the way?"
   - Offer barrier breakdown workshop

---

### Phase 4: Pattern Intelligence 📊 MEDIUM PRIORITY

**Goal:** Turn historical data into actionable insights

**Features:**
1. **Weekly Energy Report**
   - "Most productive: Tuesday mornings (steady)"
   - "Hardest: Thursday afternoons (foggy)"
   - Actionable tips based on patterns

2. **Barrier Frequency Analysis**
   - "Top barriers: Overwhelm (45%), Energy (30%), Time (15%)"
   - Focus strategies on most common barriers

3. **Success Pattern Recognition**
   - "You completed 8/10 tasks that were: scheduled before 11am, anchored to 'coffee', had barrier plan"

---

### Phase 5: Morning Command Center 🌅 HIGH PRIORITY

**Goal:** Replace "open day anxiety" with structured morning planning

**Route:** `/morning-plan`

**Flow:**
1. Energy Check → "How are you feeling?"
2. Capacity Assessment → "Based on foggy energy: 1-2 tasks"
3. Medication/Routine Check → "Did you take meds? Optimal: 10am-2pm"
4. Smart Task Selection → Show planned items + suggestions
5. Time-blocking → Visual schedule with breaks
6. Barrier Pre-planning → Set interventions ahead of time

**Features:**
- Visual timeline with drag-drop blocks
- Color-coded by energy requirement
- Protected "rest" blocks
- Automatic break reminders

---

## Priority Implementation Plan

### Implementation Priority Matrix

| Phase | Impact | Effort | Priority | Why |
|-------|--------|--------|----------|-----|
| Phase 5: Morning Command Center | 🔥 HUGE | 🔨 Medium | **DO FIRST** | Solves core "open day" problem |
| Phase 1: Energy Intelligence | 🔥 HUGE | 🔨 Small | **DO SECOND** | Builds on existing energy schedule |
| Phase 2: Capacity Management | 🔥 HIGH | 🔨 Small | **DO THIRD** | Prevents over-scheduling |
| Phase 3: Barrier Interruption | 💡 MEDIUM | 🔨 Large | Later | Nice-to-have, complex |
| Phase 4: Pattern Intelligence | 💡 MEDIUM | 🔨 Medium | Later | Needs data history |

### Quick Wins (Start Here)

#### 1. Morning Planning Page ⭐ START HERE
- **File:** `app/morning-plan/page.tsx`
- **Flow:** Energy → Capacity → Tasks → Time-blocks → Barriers
- **Output:** Structured day with realistic goals

#### 2. Capacity Indicator on Homepage
- **File:** `app/page.tsx`
- **Show:** "2/3 tasks for your energy today"
- **Warning:** When approaching capacity
- **Encourage:** Rest when needed

#### 3. Energy-Aware Task Suggestions
- **File:** `app/focus/page.tsx`
- **Show:** "Best time for this: 10-11am"
- **Based on:** Energy schedule + patterns + anchoring

#### 4. Medication Tracking in Settings
- **File:** `app/settings/page.tsx`
- **Add:** "Medication Schedule" section
- **Track:** Name, time taken, peak window
- **Use:** In recommendations

---

## Feature Deep Dives

### Capacity Calculation System

#### The Core Problem
⏰ Hard stop time (when brain shuts down)
🔋 Energy depletion (decreases throughout day)
🧠 Task complexity (deep vs light work)
📅 Time remaining awareness (prevent "I have all day" illusion)

#### Step 1: Define User's Productive Window

**In Settings → Daily Work Window:**

```
┌─────────────────────────────────────┐
│ When can you do deep work?          │
│                                      │
│ Start time: [8:00 AM] ▼             │
│ Hard stop: [6:00 PM] ▼              │
│                                      │
│ After hard stop, you can still do   │
│ light tasks (cleaning, organizing)  │
└─────────────────────────────────────┘
```

**Why this matters:**
- Sets realistic boundaries
- Works with nervous system
- Prevents "I'll do it tonight" trap

#### Step 2: Calculate Available Time + Energy

```javascript
function calculateCapacity(user, currentTime) {
  // 1. Get user's productive window
  const workStart = user.settings.workStartTime || "8:00";
  const hardStop = user.settings.hardStopTime || "18:00"; // 6pm

  // 2. Calculate remaining productive hours
  const now = parseTime(currentTime);
  const stopTime = parseTime(hardStop);
  const hoursRemaining = Math.max(0, stopTime - now);

  // 3. Get current energy level
  const currentEnergy = getCurrentEnergy(user);

  // 4. Calculate capacity
  return calculateCapacityScore(hoursRemaining, currentEnergy);
}
```

#### Step 3: The Capacity Formula

```javascript
function calculateCapacityScore(hoursRemaining, energyLevel) {
  // Base capacity by energy type
  const energyCapacity = {
    resting: 0,      // Can't do deep work
    foggy: 1,        // 1 simple task
    flowing: 2,      // 2 moderate tasks
    steady: 2.5,     // 2-3 tasks
    sparky: 3        // 3 tasks max (watch burnout)
  };

  const baseCapacity = energyCapacity[energyLevel];

  // Adjust for time remaining
  if (hoursRemaining < 2) {
    return Math.min(baseCapacity, 1); // Only 1 task left
  }
  else if (hoursRemaining < 4) {
    return Math.min(baseCapacity, 2); // Max 2 tasks
  }

  return baseCapacity;
}
```

#### Step 4: Task Complexity Weights

```javascript
const taskWeights = {
  quick: 0.5,   // "Send email" = half a task
  medium: 1.0,  // "Apply to 1 job" = one task
  deep: 2.0     // "Write project proposal" = two tasks
};

function checkCapacity(user, newTask) {
  const currentTasks = getUserTasks(user);
  const usedCapacity = currentTasks.reduce((sum, task) => {
    return sum + taskWeights[task.difficulty];
  }, 0);

  const totalCapacity = calculateCapacity(user, Date.now());
  const newWeight = taskWeights[newTask.difficulty];

  if (usedCapacity + newWeight > totalCapacity) {
    return {
      allowed: false,
      message: "⚠️ This exceeds your capacity for today."
    };
  }

  return { allowed: true };
}
```

#### UI Examples

**9am (Full day ahead):**
```
┌─────────────────────────────────────┐
│ ⚡ Sparky Energy                    │
│ Capacity: 3 tasks today             │
│ 9 hours until hard stop (6pm)      │
│                                     │
│ Focus Items: 1/3 added              │
│ ████░░░░░░ 33%                      │
└─────────────────────────────────────┘
```

**2pm (Afternoon, some tasks done):**
```
┌─────────────────────────────────────┐
│ ☀️ Steady Energy                    │
│ Capacity: 1 task remaining          │
│ 4 hours until hard stop             │
│                                     │
│ Focus Items: 2/3 complete ✓         │
│ ████████░░ 80%                      │
└─────────────────────────────────────┘
```

**5pm (Near hard stop):**
```
┌─────────────────────────────────────┐
│ ⏰ 1 hour until deep work ends      │
│                                     │
│ This is your last window for        │
│ focused tasks today.                │
│                                     │
│ 1 incomplete task:                  │
│ • Email recruiter (Quick - 15min)  │
└─────────────────────────────────────┘
```

**6:30pm (After hard stop, before full stop):**
```
┌─────────────────────────────────────┐
│ 🌙 Deep work is done for today      │
│                                     │
│ You can still do:                   │
│ • Quick emails                      │
│ • Tidying/organizing                │
│ • Self-care tasks                   │
│                                     │
│ No deep work until tomorrow.        │
└─────────────────────────────────────┘
```

---

### Time-of-Day Windows

#### Three-Tier System

**Settings Configuration:**
```
┌─────────────────────────────────────┐
│ Your daily work windows:            │
│                                     │
│ Deep work ends: [6:00 PM] ▼        │
│ Light tasks end: [8:00 PM] ▼       │
│ Full stop: [10:30 PM] ▼            │
└─────────────────────────────────────┘
```

**Example Times:**
- **Deep Work Window:** 8am - 6pm (executive function work)
- **Light Tasks Window:** 6pm - 8pm (emails, tidying, low-stakes)
- **Wind-Down Window:** 8pm - 10:30pm (self-care, preparing for next day)
- **Full Stop:** 10:30pm+ (sleep hygiene)

#### Implementation

```javascript
function getCapacityForTime(currentTime, settings) {
  const { deepWorkEnd, lightTaskEnd, fullStop } = settings;

  if (currentTime < deepWorkEnd) {
    return calculateNormalCapacity();
  }
  else if (currentTime < lightTaskEnd) {
    return {
      capacity: "Light tasks only",
      allowedTypes: ["quick"],
      message: "Your brain is done with deep work."
    };
  }
  else if (currentTime < fullStop) {
    return {
      capacity: "Wind-down time",
      allowedTypes: [],
      message: "Time to wrap up. Tomorrow is a fresh start."
    };
  }
  else {
    return {
      capacity: "Rest",
      message: "You should be winding down for bed."
    };
  }
}
```

---

### Medication Tracking

#### Phase 1: Simple Medication Tracking

**Settings → Medication:**
```
┌─────────────────────────────────────┐
│ 💊 Medication Schedule              │
│                                     │
│ Do you take ADHD medication?        │
│ ○ Yes  ○ No                         │
│                                     │
│ [+ Add Medication]                  │
└─────────────────────────────────────┘
```

**When Adding:**
```
┌─────────────────────────────────────┐
│ Medication: [Adderall XR] ▼         │
│ Dose: [20mg]                        │
│ Time taken: [8:00 AM] ▼             │
│                                     │
│ Formulation:                        │
│ ○ Immediate Release (4-6 hrs)       │
│ ○ Extended Release (8-12 hrs)       │
└─────────────────────────────────────┘
```

#### Medication Profiles

```javascript
const medicationProfiles = {
  "Adderall IR": { onset: 30, peak: 2, duration: 4 },
  "Adderall XR": { onset: 60, peak: 4, duration: 10 },
  "Vyvanse": { onset: 60, peak: 5, duration: 12 },
  "Ritalin IR": { onset: 20, peak: 1, duration: 3 },
  "Concerta": { onset: 60, peak: 6, duration: 12 }
};

function calculateMedicationWindows(medication, timeTaken) {
  const profile = medicationProfiles[medication.name];

  return {
    onsetTime: addMinutes(timeTaken, profile.onset),
    peakTime: addHours(timeTaken, profile.peak),
    endTime: addHours(timeTaken, profile.duration)
  };
}
```

#### Using Medication Data

**In Task Recommendations:**
```
┌─────────────────────────────────────┐
│ 💊 Optimal focus window: 10am-2pm   │
│ (Adderall XR peak effectiveness)    │
│                                     │
│ Suggested tasks for this window:    │
│ • Apply to jobs (Deep)              │
│ • Write cover letter (Deep)         │
└─────────────────────────────────────┘
```

---

### Command Center Homepage

#### Design Structure

```
┌─────────────────────────────────────┐
│ HEADER: Context Bar                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 2:34 PM  •  3h 26m until stop       │
│ ☀️ Steady  •  💊 Meds active        │
│ Capacity: 2/3 tasks  ████░░         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ MAIN: Primary Focus                 │
│                                     │
│ 🎯 Today's Focus (2/3 capacity)     │
│                                     │
│ ☑ Apply to 3 jobs          [Deep]  │
│   ✓ Completed at 10:45am            │
│                                     │
│ ☐ Email recruiter          [Quick] │
│   🕐 at 2pm (NOW - optimal!)        │
│   💡 Your best time for this        │
│                                     │
│ ☐ Update resume            [Medium]│
│   ⚠️ Exceeds today's capacity       │
│   💡 Move to tomorrow?              │
│                                     │
│ [+ Add Focus Item] (1/3 left)       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ SECONDARY: Life Maintenance         │
│                                     │
│ ✨ Life Maintenance (5 items)       │
│                                     │
│ ☑ Take morning meds (8am)           │
│ ☑ Drink water                       │
│ ☐ Feed cat                          │
│                                     │
│ [+ Quick Add]                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ FOOTER: Navigation                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│    🏠        📅      📊      ⚙️     │
│   Today   Calendar Insights Settings│
└─────────────────────────────────────┘
```

#### Key Design Principles

1. **Glanceable Status (Header)**
   - Current time + time until hard stop
   - Current energy level
   - Medication status
   - Capacity at a glance

2. **Visual Hierarchy (Main)**
   - Most Important (Top): Focus Items (limited, high-stakes)
   - Still Important (Bottom): Life Maintenance (unlimited, low-stakes)

3. **Progressive Disclosure**
   - Collapsed: Simple task view
   - Expanded: Shows barriers, anchors, timing, suggestions

4. **Smart Contextual Guidance**
   - Morning: "Let's plan your day"
   - Mid-day: "You're on track!"
   - Evening: "Past hard stop - rest time"

---

## User Experience & Design

### ADHD-Friendly Design Principles

#### ✅ Do:
- Large, tappable buttons (min 44px height)
- Clear visual hierarchy
- One primary action per screen
- Progress indicators (dots or bars)
- Skip options always visible
- High contrast text
- Generous whitespace

#### ❌ Don't:
- Walls of text
- Small tap targets
- Ambiguous buttons
- Hidden navigation
- Multiple paths forward
- Low contrast
- Cluttered layouts

### Tone & Voice

#### ✅ Do:
- Friendly, encouraging
- Honest about ADHD challenges
- Celebrate small wins
- Use "we" language
- Short sentences
- Active voice

#### ❌ Don't:
- Patronizing
- Overly clinical
- Shame-inducing
- "Just do it" energy
- Long explanations
- Passive voice

### Preventing "Getting Lost"

1. **Always Know Where You Are**
   - Header shows: current page, time, energy, capacity
   - No mystery about location or state

2. **One Primary Action**
   - Each screen: ONE clear next step
   - No decision paralysis

3. **Clear Exit Paths**
   - Back button always visible
   - "Save for later" options
   - Cancel without losing progress

---

## Onboarding Flow

### Goals
- ⏱️ **Time to value:** 2 minutes
- 🎯 **Core metric:** User adds first task within 2 minutes
- 🎓 **Progressive disclosure:** Introduce features gradually

### Onboarding Screens

#### Screen 1: Welcome
```
┌─────────────────────────────────────┐
│                                     │
│         [App Logo/Icon]             │
│                                     │
│   Welcome to ADHD Barrier Tracker   │
│                                     │
│   This app works WITH your brain,   │
│   not against it.                   │
│                                     │
│   [Get Started →]                   │
│                                     │
└─────────────────────────────────────┘
```
**Duration:** 5 seconds

---

#### Screen 2: Why This Is Different
```
┌─────────────────────────────────────┐
│   This app is different:            │
│                                     │
│   ✅ Focus on 1-2 tasks, not 100    │
│   ✅ Work with your energy          │
│   ✅ Understand your barriers       │
│   ✅ Build structure that helps     │
│                                     │
│   [Continue →]                      │
└─────────────────────────────────────┘
```
**Duration:** 10 seconds

---

#### Screen 3: Quick Account Setup
```
┌─────────────────────────────────────┐
│   Create your account               │
│                                     │
│   Email: [____________]             │
│   Password: [____________]          │
│                                     │
│   [Create Account]                  │
│   [Sign in with Google]             │
│                                     │
│   Already have account? [Sign in]   │
└─────────────────────────────────────┘
```
**Duration:** 15 seconds

---

#### Screen 4: Set Work Hours
```
┌─────────────────────────────────────┐
│   When can you do deep work?        │
│                                     │
│   Start: [8:00 AM] ▼                │
│   Hard stop: [6:00 PM] ▼            │
│                                     │
│   After 6pm, your brain is done     │
│   with focused work. We'll help     │
│   you honor that boundary.          │
│                                     │
│   [Continue →] [Skip for now]       │
└─────────────────────────────────────┘
```
**Duration:** 30 seconds

---

#### Screen 5: Energy Schedule (Optional)
```
┌─────────────────────────────────────┐
│   Your typical energy flow          │
│                                     │
│   [Interactive energy timeline]     │
│   8am  ━━━ ☀️ Steady                │
│   12pm ━━━ ⚡ Sparky                │
│   3pm  ━━━ 🌊 Flowing               │
│   6pm  ━━━ 🌙 Resting               │
│                                     │
│   [+ Add medication schedule]       │
│   [Save →] [Skip for now]           │
└─────────────────────────────────────┘
```
**Duration:** 45 seconds (skippable)

---

#### Screen 6: Add First Task
```
┌─────────────────────────────────────┐
│   Let's add your first focus item   │
│                                     │
│   What matters most today?          │
│                                     │
│   [________________]                │
│                                     │
│   How hard is this?                 │
│   ○ Quick  ○ Medium  ○ Deep         │
│                                     │
│   [Add Task →]                      │
└─────────────────────────────────────┘
```
**Duration:** 60 seconds

---

#### Screen 7: You're All Set!
```
┌─────────────────────────────────────┐
│   🎉 You're all set!                │
│                                     │
│   Your first task is added.         │
│   Let's make today manageable.      │
│                                     │
│   [Go to Today →]                   │
└─────────────────────────────────────┘
```
**Duration:** 5 seconds

---

### Progressive Feature Introduction

**Day 1:** Focus items only
**Day 2:** Introduce Life Maintenance section
**Day 3:** Introduce barriers concept
**Day 4:** Introduce time anchoring
**Day 7:** Introduce patterns page

### Skip Options

Every setup screen has:
- [Skip for now] button
- [Do this later] option
- Quick defaults

**Why:** Setup fatigue is real, executive function is limited. Better to get them using the app than perfect setup.

---

## Technical Implementation

### File Structure

```
app/
├─ page.tsx                    # Command Center homepage
├─ morning-plan/
│  ├─ page.tsx                # Morning planning flow
│  ├─ energy/page.tsx
│  ├─ capacity/page.tsx
│  └─ schedule/page.tsx
├─ onboarding/
│  ├─ welcome/page.tsx
│  ├─ signup/page.tsx
│  ├─ work-hours/page.tsx
│  ├─ energy-schedule/page.tsx
│  ├─ first-task/page.tsx
│  └─ complete/page.tsx
├─ focus/page.tsx             # Add/edit focus items
├─ barriers/page.tsx          # Barrier identification
├─ gentle-support/page.tsx    # Tips and support
├─ calendar/page.tsx          # Historical view
├─ patterns/page.tsx          # Insights and analytics
└─ settings/
   ├─ page.tsx               # Main settings
   ├─ work-hours/page.tsx    # Work window settings
   ├─ medication/page.tsx    # Medication tracking
   └─ energy-schedule/page.tsx

components/
├─ GlobalNavigation.tsx       # Already exists
├─ BottomTabBar.tsx          # Mobile navigation
├─ CapacityIndicator.tsx     # Capacity display
├─ EnergyDisplay.tsx         # Energy status
├─ FocusItemCard.tsx         # Task card
├─ TimeWarning.tsx           # Hard stop warnings
└─ onboarding/
   ├─ OnboardingLayout.tsx
   ├─ EnergyScheduleBuilder.tsx
   ├─ ProgressDots.tsx
   └─ OnboardingTip.tsx

lib/
├─ capacity.ts               # Capacity calculations
├─ medication.ts             # Medication logic
├─ time-windows.ts           # Time-of-day logic
├─ energy.ts                 # Energy calculations
├─ patterns.ts               # Pattern analysis
├─ onboarding-context.tsx    # Onboarding state
└─ onboarding-utils.ts       # Onboarding helpers

database/migrations/
├─ add_work_hours.sql
├─ add_medication_tracking.sql
├─ add_capacity_settings.sql
└─ add_onboarding_state.sql
```

### Database Schema Additions

```sql
-- User settings for capacity management
ALTER TABLE users ADD COLUMN work_start_time TIME DEFAULT '08:00';
ALTER TABLE users ADD COLUMN deep_work_end_time TIME DEFAULT '18:00';
ALTER TABLE users ADD COLUMN light_tasks_end_time TIME DEFAULT '20:00';
ALTER TABLE users ADD COLUMN full_stop_time TIME DEFAULT '22:30';

-- Medication tracking
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  dose VARCHAR(50),
  formulation VARCHAR(20), -- 'IR' or 'XR'
  time_taken TIME NOT NULL,
  onset_minutes INTEGER,
  peak_hours INTEGER,
  duration_hours INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Onboarding state
ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN onboarding_current_step INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN onboarding_skipped_steps TEXT[];

-- Task difficulty for capacity
ALTER TABLE focus_items ADD COLUMN difficulty VARCHAR(20) DEFAULT 'medium';
-- Values: 'quick', 'medium', 'deep'
```

### Key Utility Functions

#### capacity.ts
```typescript
export function calculateCapacity(
  energy: EnergyLevel,
  hoursRemaining: number,
  existingTasks: Task[]
): CapacityInfo {
  // Implementation from deep dive
}

export function checkTaskFits(
  capacity: CapacityInfo,
  task: Task
): { fits: boolean; message?: string } {
  // Check if task fits in remaining capacity
}
```

#### medication.ts
```typescript
export function calculateMedicationWindows(
  medication: Medication,
  timeTaken: Date
): MedicationWindows {
  // Calculate onset, peak, end times
}

export function isMedicationActive(
  medication: Medication,
  currentTime: Date
): boolean {
  // Check if within active window
}
```

#### time-windows.ts
```typescript
export function getCurrentWindow(
  currentTime: Date,
  settings: UserSettings
): TimeWindow {
  // Return: 'deep-work' | 'light-tasks' | 'wind-down' | 'rest'
}

export function getTimeUntilNextWindow(
  currentTime: Date,
  settings: UserSettings
): { hours: number; minutes: number } {
  // Time until next window transition
}
```

---

## Success Metrics

### Onboarding Success
- ✅ 80%+ complete onboarding (don't drop off)
- ✅ 90%+ add at least one task
- ✅ 70%+ set energy schedule (or skip intentionally)
- ✅ User reaches command center in <3 minutes

### Daily Usage Success
- ✅ User adds 1-2 tasks daily
- ✅ User respects hard stop time
- ✅ User identifies barriers for 50%+ of tasks
- ✅ User marks tasks complete (even if just 1-2)

### Long-term Success
- ✅ Weekly active users: 80%+ retention
- ✅ Users report feeling "less overwhelmed"
- ✅ Users complete more tasks without burnout
- ✅ Users understand their energy patterns

### Early Indicators
- User adds 2nd task → They get it!
- User returns next day → It's useful!
- User sets energy schedule after skipping → They see value!

---

## Next Steps

### Immediate (Week 1-2)
1. ✅ Organize this document (DONE!)
2. Implement bottom tab navigation
3. Add capacity indicator to homepage
4. Create work hours settings page

### Short-term (Week 3-4)
5. Build medication tracking
6. Add energy-aware task recommendations
7. Create morning planning flow
8. Add time-of-day warnings

### Medium-term (Month 2)
9. Build comprehensive onboarding
10. Add pattern analysis features
11. Implement barrier interruption flows
12. Polish UI/UX across all screens

### Long-term (Month 3+)
13. Advanced pattern recognition
14. Shame spiral detection
15. Success pattern identification
16. Community features (optional)

---

## Resources & References

- **Research Site:** [ADHD First Aid Kit](https://adhd-first-aid.vercel.app/)
- **Current Database:** Shared Supabase project
- **Tech Stack:** Next.js, React, Tailwind CSS, Supabase
- **Design System:** Custom ADHD-friendly components

---

*This document is a living vision. Update it as features evolve and user feedback comes in.*
