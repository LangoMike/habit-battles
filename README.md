# Habit Battles

Habit Tracker Battles is a webapp designed to track personal habits, maintain weekly streaks, and (soon) compete with friends in consistancy based “battles.”  
The main technologies used are **Next.js (TypeScript)**, **Supabase (Postgres · Auth · Realtime)**, **Tailwind CSS**, **shadcn/ui**, and **Sonner** for toast notifications. Deployed on **Vercel** (soon).

> **Status:** In progress. Developing UI
MVP complete — authentication, habit CRUD, check-ins, weekly progress, and basic realtime updates. Friends/Battles, leaderboards, UI updates, and more features are on the roadmap.

---

## Table of Contents
- [Purpose](#purpose)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Data Model](#data-model)
- [Security](#security)
- [MVP Scope & Build Steps](#mvp-scope--build-steps)

---

## Purpose
Habit Battles is a small, production-leaning webapp designed to demonstrate:
- End-to-end product thinking: from schema design and security to a polished UI.
- Practical full-stack skills: authentication, CRUD, realtime updates, and simple analytics.
- Clear engineering tradeoffs: an MVP that ships quickly, with a roadmap for scale.

**User story:** as a user, I can create habits with a weekly target (e.g., “Exercise 4×/week”), log check-ins, and see progress for the current week. Social battles with friends are planned next.

---

## Key Features
- **Passwordless authentication** via email magic links (Supabase Auth).
- **Habits CRUD**: create, edit, delete habits, each with a `target_per_week`.
- **Check-ins**: one-click daily completion (per habit), stored per date.
- **Weekly progress**: shows `completed_this_week / target_per_week`.
- **Timezone awareness** for “today” and weekly windows.
- **Realtime UI updates** using Supabase Postgres change feeds.
- **Strong defaults**: Row Level Security (RLS), minimal permissions, environment separation.

Planned:
- **Friends & Battles**: invite friends, join a battle, weekly leaderboard aggregation.
- **Calendar heatmap**: visualize check-in history.
- **Reminders/notifications** (email/push).

---

## Tech Stack
**Frontend**
- Next.js (App Router) + TypeScript
- Tailwind CSS for utility-first styling
- shadcn/ui components
- Sonner for toast notifications

**Backend**
- Supabase: Postgres (managed), Auth, Realtime
- RLS (Row Level Security) and policies in SQL

**Tooling & Infra**
- Vercel for hosting & CI
- ESLint/TypeScript for code quality

---

## System Architecture
- **Front-end** renders UI and calls Supabase via the JS client.  
- **Supabase Auth** issues a session (JWT) used to authorize queries.
- **Postgres + RLS** enforce per-user access at the database layer.
- **Realtime** subscriptions refresh lists upon inserts/updates/deletes.

