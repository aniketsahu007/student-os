# Student OS

A personal productivity dashboard built for students. It brings together all the tools you need — tasks, notes, habits, budget, calendar, and more — into one clean interface with an AI command bar.

## Features

- **Dashboard** – Overview of everything at a glance
- **Calendar** – View and manage your schedule
- **To-Do** – Simple task management
- **Reminders** – Set reminders so you don't forget things
- **Notes** – Write and save notes in markdown
- **Budget Tracker** – Track your income and expenses
- **Habit Tracker** – Build daily/weekly habits and maintain streaks
- **Pomodoro Timer** – Focus sessions using the Pomodoro technique
- **AI Command Bar** – Type or speak natural language commands like:
  - `"Add Maths every Monday 9am"`
  - `"Log ₹150 for lunch today"`
  - `"Remind me to submit assignment at 6pm"`

## Tech Stack

- **Next.js 16** – App Router
- **TypeScript**
- **Clerk** – Authentication
- **Supabase** – Database (PostgreSQL)
- **n8n** – AI automation workflow (processes AI command bar requests)
- **Framer Motion** – Animations
- **Lucide React** – Icons

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/aniketsahu007/student-os.git
cd student-os
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

You'll need:
- Clerk API keys (from [clerk.com](https://clerk.com))
- Supabase URL and keys (from [supabase.com](https://supabase.com))
- n8n webhook URL (from your n8n instance)

### 4. Set up the database

Run the `database_schema.sql` file in your Supabase SQL editor. This creates the tables for users, budget, habits, and notes with Row Level Security enabled.

### 5. Import n8n workflow

Import `n8n.json` into your n8n instance and activate it. Copy the webhook URL into `.env.local`.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   ├── calendar/
│   ├── todos/
│   ├── reminders/
│   ├── notes/
│   ├── budget/
│   ├── habits/
│   └── pomodoro/
├── components/
│   ├── AICommandBar.tsx
│   ├── Sidebar.tsx
│   ├── PomodoroTimer.tsx
│   └── DashboardShell.tsx
└── lib/
    └── supabase.ts
```

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```
