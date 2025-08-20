# Habit Battles

**"Fight the old you. Build the new you."**

Habit Battles is a modern habit tracking webapp designed to help users build consistent routines and compete with friends in weekly "battles" based on habit completion rates. Track your daily habits, maintain streaks, visualize progress, and challenge yourself to become better.

The main technologies used are **Next.js 15 (TypeScript)**, **React 19**, **Supabase (Postgres · Auth · Realtime)**, **Tailwind CSS 4**, **shadcn/ui**, and **Sonner** for toast notifications. Deployed on **Vercel**.

---

> **Status:**

- **✅ MVP Complete**: Authentication, habit CRUD, check-ins, weekly progress, calendar heatmap, streak tracking, profile system, and realtime updates.
- **🚀 Ready for Deployment**: All core features implemented with polished UI.
- **📋 Planned Features**: Friends/Battles system, leaderboards, notifications, and advanced analytics.

---

## Table of Contents

- [Purpose](#purpose)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Features Overview](#features-overview)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)

---

## Purpose

Habit Battles is a production-ready webapp designed to demonstrate:

- **End-to-end product thinking**: from schema design and security to a polished, modern UI
- **Practical full-stack skills**: authentication, CRUD, realtime updates, and analytics
- **Clear engineering tradeoffs**: an MVP that ships quickly, with a roadmap for scale

**User story:** As a user, I can create habits with weekly targets (e.g., "Exercise 4×/week"), log daily check-ins, track streaks, visualize progress in a calendar heatmap, and compete with friends in weekly battles based on completion rates.

---

## Key Features

### 🔐 Authentication & Security
- **Passwordless authentication** via email magic links (Supabase Auth)
- **Row Level Security (RLS)** for complete data isolation
- **Profile system** with customizable usernames and avatars

### 📊 Habit Management
- **Complete CRUD operations**: create, edit, delete habits with weekly targets
- **Smart check-ins**: one-click daily completion with duplicate prevention
- **Weekly progress tracking**: real-time `completed_this_week / target_per_week` display
- **Target validation**: 1-7 times per week with intelligent defaults

### 🔥 Streak System
- **Daily streaks**: consecutive days with at least one habit completed
- **Weekly streaks**: consecutive weeks with habit completion
- **Dynamic fire icons**: Zap (1-2 days) → Flame (3-9 days) → FlameKindling (10+ days)
- **Motivational messages**: context-aware encouragement based on streak length

### 📅 Calendar & Analytics
- **Interactive heatmap**: visualize habit completion patterns
- **Multiple views**: Week, Month, and Year calendar modes
- **Click-to-detail**: view specific habits completed on any day
- **Progress statistics**: weekly quotas met, total check-ins, active habits

### 🎨 Modern UI/UX
- **Dark theme**: Gritty, motivational design with red/white accents
- **Responsive design**: Works perfectly on desktop and mobile
- **Real-time updates**: Live UI refresh via Supabase Postgres change feeds
- **Toast notifications**: Instant feedback for all user actions
- **Loading states**: Smooth user experience with skeleton loaders

### 📈 Dashboard & Insights
- **Comprehensive overview**: stats, streaks, and motivational quotes
- **Daily inspiration**: Random motivational quotes from Quotable API
- **Quick actions**: Easy navigation to all app sections
- **Progress visualization**: Clear metrics and success rates

---

## Tech Stack

### Frontend (UI)
- **React 19** — Latest React with concurrent features
- **Next.js 15 (App Router)** — Modern routing, server rendering, and API routes
- **TypeScript** — End-to-end typing for safer, self-documenting code

### Styling & Components
- **Tailwind CSS 4** — Latest utility-first styling with modern color system
- **shadcn/ui (Radix + Tailwind)** — Accessible, headless components
- **lucide-react** — Beautiful, consistent icon set
- **Sonner** — Elegant toast notifications

### Data & Auth
- **Supabase Postgres** — Relational database with advanced features
- **Supabase Auth (email OTP)** — Secure passwordless authentication
- **Supabase Realtime** — Live UI updates via Postgres change feeds
- **Row Level Security (RLS)** — Database-level user data isolation

### Deployment & Infrastructure
- **Vercel** — Global edge deployment with automatic scaling
- **Environment separation** — Development, staging, and production configs

---

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Supabase      │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│ • React 19      │◄──►│ • Auth          │◄──►│ • Habits        │
│ • TypeScript    │    │ • Realtime      │    │ • Check-ins     │
│ • Tailwind CSS  │    │ • Postgres      │    │ • Profiles      │
│ • shadcn/ui     │    │ • RLS           │    │ • Friendships   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Frontend** renders UI and calls Supabase via the JS client
- **Supabase Auth** issues JWT sessions for secure API access
- **Postgres + RLS** enforce per-user access at the database layer
- **Realtime** subscriptions refresh UI upon data changes

---

## Features Overview

### 🏠 Dashboard
- Welcome header with custom logo and slogan
- Motivational quote system with daily inspiration
- Comprehensive stats cards (weekly quotas, total check-ins, active habits)
- Streak display with dynamic fire icons and messages
- Quick action cards for easy navigation
- App description and feature highlights

### 📝 Habits Management
- Create habits with custom names and weekly targets (1-7 times)
- Edit habit details (name and target)
- Delete habits with confirmation
- One-click daily check-ins with duplicate prevention
- Real-time progress updates
- Weekly progress visualization

### 📅 Calendar Analytics
- Interactive heatmap showing daily habit completion
- Three view modes: Week, Month, Year
- Color-coded completion levels (light red to dark red)
- Click any day to see detailed habit completion list
- Navigation between time periods
- Compact stats display

### 👤 User Profiles
- Customizable usernames (auto-generated defaults)
- Avatar URL support with comprehensive setup guide
- Email display (read-only)
- Profile editing with real-time preview
- Integration with image hosting services

### 🔥 Streak Tracking
- Daily streak calculation (consecutive days with check-ins)
- Weekly streak calculation (consecutive weeks with completion)
- Dynamic fire icon progression based on streak length
- Context-aware motivational messages
- Streak display across dashboard, calendar, and habits pages

### 🎨 UI/UX Features
- Dark theme with red/white accent colors
- Custom Habit Battles logo integration
- Responsive design for all screen sizes
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications for user feedback

---

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd habit-battles

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Database Schema

### Core Tables
- **profiles**: User profiles with usernames and avatars
- **habits**: User habits with weekly targets
- **checkins**: Daily habit completion records
- **friendships**: Friend relationships (planned)
- **battles**: Weekly competition battles (planned)
- **battle_members**: Battle participants (planned)

### Key Features
- **UUID primary keys** with `gen_random_uuid()`
- **Automatic timestamps** with `updated_at` triggers
- **Row Level Security** policies for data isolation
- **Performance indexes** for efficient queries
- **Check constraints** for data validation

---

## Roadmap

### Phase 2: Social Features
- [ ] Friend invitations and management
- [ ] Weekly battle creation and joining
- [ ] Leaderboards and rankings
- [ ] Battle result notifications

### Phase 3: Advanced Analytics
- [ ] Detailed habit analytics
- [ ] Progress charts and trends
- [ ] Goal setting and achievement tracking
- [ ] Export functionality

### Phase 4: Enhanced UX
- [ ] Push notifications
- [ ] Email reminders
- [ ] Mobile app
- [ ] Advanced calendar features

---

**Built with ❤️ using modern web technologies**
