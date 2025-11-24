# ADHD Barrier Tracker

*"How's your focus? → Ok it sucks → So what kind of day is ahead? → A lot of deadlines and shit → Ok girl, strap in we are in this together"*

A compassionate companion app for ADHDers that acknowledges both brain struggles AND real-world pressures. Built with ADHD-native language and harm reduction strategies, not toxic productivity or toxic self-care.

## 🎯 Mission

This app rejects the false choice between:
- **Toxic Productivity:** "Just push through!" (ignores ADHD reality)
- **Toxic Self-Care:** "Just rest, ignore deadlines" (ignores real consequences)

Instead, it provides **compassionate harm reduction**: *"Your ADHD challenges are real, AND life has deadlines. Here's how to navigate both."*

## ✨ Core Features

### 🤝 **Focus Assessment + Harm Reduction**
- **ADHD-Native Question:** "How's your focus today?" (not vague "energy")
- **Three Honest Options:** Pretty focused, A bit scattered, Can't focus at all
- **Harm Reduction:** When focus sucks but deadlines exist → practical survival strategies

### 🎭 **Context-Aware Personalization**
- **Automatic Detection:** Working professional, student, parent, transitioning
- **Personalized Guidance:** Different advice based on your life context
- **Learns From Usage:** Adapts language and expectations based on your patterns

### 🧱 **Embedded Barrier Support**
- **No Flow Disruption:** Barrier help appears instantly (no external links)
- **ADHD Strategies:** Immediate, actionable tips for common challenges
- **Connected to Research:** Links to [ADHD First Aid](https://adhd-first-aid.vercel.app) when ready

### 🌙 **Sleep Companion**
- **Realistic Reminders:** 9-hour wind-down for ADHD brains
- **Context-Aware:** Different guidance for different life situations
- **Compassionate Tone:** "You've earned rest" not "You should sleep"

### 📱 **ADHD-Friendly Design**
- **Simple Visual Timeline:** Structure without overwhelming details
- **Gentle Progress Tracking:** Success without shame
- **Mobile-First:** Works on phones (critical for ADHD users)

## 🧠 **User Flow**

### **Morning Check-In (2 minutes)**
```
How's your focus today?
├── Pretty focused → "You can handle 2-3 work projects"
├── A bit scattered → "Focus on routine tasks and meetings"
└── Can't focus at all → "Brain fog is real + deadlines exist. Let's survive this."
```

### **Task Planning (Realistic)**
```
Based on your focus + context:
Working Professional → "Handle 1-2 key projects today"
Student → "Study for 45-60 minutes with breaks"
Parent → "Focus on 1-2 essential family tasks"
```

### **Barrier Encounter (Embedded Help)**
```
Stuck on overwhelm barrier?
→ "Break into first 3 steps, set 10-minute timer"
→ "ADHD overwhelm is so real - be gentle with yourself"
→ Optional: "Read more on ADHD First Aid"
```

### **Evening Wind-Down**
```
Sleep reminder: "To wake up by 6am tomorrow, be in bed by 9pm tonight"
"Put phone away, dim lights - you've earned this rest"
```

## 🛠️ **Tech Stack**

- **Next.js 14** with TypeScript (stable, reliable)
- **React 18** with modern hooks
- **Supabase** - Authentication and database (shared with ADHD First Aid)
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Clean, accessible icons
- **Context Detection** - Automatic user context learning
- **Harm Reduction Engine** - ADHD-aware guidance algorithms

## 📱 **Progressive Web App**

Install as a native app for daily ADHD companionship:

### **Installation**
- **iOS Safari:** Tap share button → "Add to Home Screen"
- **Android Chrome:** Tap menu → "Add to Home Screen"
- **Desktop:** Look for "Install" in address bar

### **PWA Benefits for ADHD**
- **Quick Access:** One-tap entry from home screen
- **Offline Support:** Works without internet (critical for ADHD focus)
- **Native Feel:** No browser distractions
- **Background Sync:** Data saves when connection returns
- **Gentle Reminders:** Sleep notifications work offline

### **ADHD-Optimized Features**
- **Fast Loading:** No waiting for ADHD attention spans
- **Simple Interface:** Touch-friendly for scattered moments
- **Reliable Offline:** Never lose progress due to connectivity
- **Home Screen Habit:** Easy daily check-ins

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ (LTS recommended)
- npm or yarn
- Supabase account (shared with ADHD First Aid)

### **Quick Setup**
```bash
# Clone the repository
git clone [your-repo-url]
cd adhd-barrier-tracker

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Add your Supabase credentials to .env.local
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Start development server
npm run dev
```

### **First Run**
1. Open [http://localhost:3000](http://localhost:3000)
2. Sign up/login with your ADHD First Aid account
3. Answer: "How's your focus today?"
4. Experience personalized, compassionate ADHD guidance

## 🗄️ **Database Architecture**

### **Shared Supabase Project**
```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Supabase Project                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐        ┌──────────────────────┐  │
│  │  ADHD First Aid Kit  │        │  Barrier Tracker App │  │
│  │  (Reference Tool)    │        │  (Daily Companion)   │  │
│  └──────────┬───────────┘        └──────────┬───────────┘  │
│             │                               │               │
│             │  READ                         │  READ + WRITE │
│             ↓                               ↓               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Shared Content Tables (Read-Only)            │  │
│  │  • content_types  • content_pages (barriers)         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         User Tracking Tables (Barrier Tracker)       │  │
│  │  • checkins (focus levels) • focus_items (tasks)     │  │
│  │  • focus_barriers • user_context • sleep_prefs       │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### **Key Tables**
- **`checkins`**: Daily focus assessments and work window tracking
- **`focus_items`**: Tasks with capacity limits based on focus
- **`focus_barriers`**: ADHD barriers with embedded help content
- **`user_context`**: Automatic context detection (work/student/parent)
- **`sleep_preferences`**: Personalized sleep and wake-up patterns

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

### **Data Flow: Compassionate Harm Reduction**

1. **Context Detection**: Analyzes task language → "working professional" vs "student" vs "parent"
2. **Focus Assessment**: "How's your focus?" → Maps to ADHD-appropriate capacity limits
3. **Harm Reduction**: Low focus + high pressure = validation + survival strategies + recovery planning
4. **Embedded Support**: Barrier help appears instantly (no flow disruption)
5. **Sleep Companion**: 9-hour wind-down reminders based on wake-up time
6. **Pattern Learning**: Adapts guidance based on what works for each user

### **Core Algorithms**

- **Context Detection**: Automatic classification from task language patterns
- **Capacity Calculation**: Focus level + context → realistic daily limits
- **Harm Reduction Engine**: Validates struggles + acknowledges pressures + provides strategies
- **Personalization Engine**: Learns from usage → adapts language and expectations

### **Privacy & Security**
- **Row Level Security**: Users only see their own data
- **Context Learning**: Happens locally, no sharing of personal patterns
- **Supabase Auth**: Secure authentication shared with ADHD First Aid

## 📚 **Documentation**

### **Setup & Development**
- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[database/README.md](database/README.md)** - Database schema and migrations

### **Understanding the Approach**
- **Harm Reduction Philosophy**: ADHD struggles + real-world pressures = compassionate strategies
- **Context-Aware Design**: Different guidance for working professionals, students, parents
- **ADHD-Native Language**: Speaks focus challenges, not corporate productivity

### **Key Differences from Other Apps**
| Traditional Apps | ADHD Barrier Tracker |
|------------------|---------------------|
| "Energy levels" | "How's your focus?" |
| "Push through it" | "Strap in, we're in this together" |
| Generic advice | Context-personalized guidance |
| External barrier links | Embedded, flow-preserving help |
| Shame-based tracking | Compassionate progress |

### **Contributing**
This app is built for and by the ADHD community. Contributions welcome that:
- Improve harm reduction strategies
- Add more context types (caregivers, freelancers, etc.)
- Enhance ADHD-native language
- Increase accessibility for different ADHD presentations

### **Deployment**
- **[VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)** - Vercel deployment guide
- **PWA Ready**: Installable as native app
- **Offline Capable**: Works without internet

## 🙏 **Special Thanks**

Built with deep appreciation for the ADHD community. This app exists because traditional productivity tools failed us. Special thanks to:

- **ADHD First Aid** community for barrier research and validation
- **Harm reduction researchers** for the psychological framework
- **Every ADHDer** who shared their authentic experiences

---

*"Focus sucks? Deadlines piling up? Okay girl, strap in - we're getting through this together."* 🧠❤️
