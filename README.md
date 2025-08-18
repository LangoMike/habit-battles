This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

# Habit Battles

Track your habits, keep daily streaks, and battle friends in time‑boxed challenges. Built with **Next.js + TypeScript**, **Supabase (Auth · Postgres · Realtime)**, **Tailwind CSS**, and **shadcn/ui**. Deployed on **Vercel**.

> ⚠️ This is an MVP scaffold. It ships with auth, habits + check‑ins, and realtime updates. Friends/Battles pages are scaffolded and ready to implement.

## 🔗 Demo
- Live: https://YOUR-DEPLOYMENT-URL (replace after deploying)
- Video/GIF: add a short screen capture of check‑ins

## ✨ Features
- 🔐 Passwordless **email magic link** auth (Supabase Auth)
- ✅ **Create habits** (daily/custom schedule placeholder) and **one‑click check‑ins**
- 🔥 **Realtime** UI updates via Supabase Postgres Change Feeds
- 🔢 **Timezone‑aware streak** calculation utility
- 🫂 **Friends & Battles** data model and pages (hook up leaderboard SQL next)
- 🛡️ **Row Level Security (RLS)** policies so users only access their own data

## 🧰 Tech Stack
- **Frontend:** Next.js (App Router) + TypeScript, Tailwind, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Realtime, Storage optional)
- **Deployment:** Vercel (with optional Vercel Cron later)

## 📦 Getting Started
### Prerequisites
- Node.js 18+
- npm (or pnpm/yarn)
- A Supabase project (https://supabase.com)

### 1) Clone & install
```bash
git clone https://github.com/YOUR-USER/habit-battles.git
cd habit-battles
npm install

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
