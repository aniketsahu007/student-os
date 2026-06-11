<h1 align="center">
  <br />
  <img src="public/favicon.ico" alt="Student OS Logo" width="60" />
  <br />
  Student OS
</h1>

<p align="center">
  <strong>An AI-powered productivity dashboard built for students.</strong>
  <br />
  Manage your schedule, tasks, habits, budget, and notes — all in one place.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white" alt="Clerk" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/n8n-Automation-EA4B71?logo=n8n&logoColor=white" alt="n8n" />
</p>

---

## ✨ Features

| Module | Description |
|---|---|
| 🏠 **Dashboard** | Unified overview of all your productivity metrics |
| 📅 **Calendar** | Visual schedule and event management |
| ✅ **To-Do** | Task management with priorities |
| 🔔 **Reminders** | Smart reminders so nothing slips through the cracks |
| 📝 **Notes** | Markdown-powered notes editor |
| 💰 **Budget Tracker** | Track income and expenses by category |
| 🔥 **Habit Tracker** | Build streaks and track daily/weekly habits |
| 🍅 **Pomodoro Timer** | Focus sessions with a built-in Pomodoro timer |
| 🤖 **AI Command Bar** | Natural language commands via text **or voice** to control the entire app |

### 🤖 AI Command Bar

The AI Command Bar (`⌘K`) lets you control the entire dashboard using plain English — spoken or typed:

- `"Add Maths every Monday 9am"`
- `"Log ₹150 for lunch today"`
- `"Remind me to submit assignment at 6pm"`
- `"Mark Morning Run as done"`
- `"What's on my schedule tomorrow?"`

Commands are processed through an **n8n automation workflow**, making the AI pipeline fully customisable without touching application code.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | TypeScript 5 |
| **Auth** | [Clerk](https://clerk.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security) |
| **AI / Automation** | [n8n](https://n8n.io/) webhook workflow |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Voice Input** | Web Speech API |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- A [Clerk](https://clerk.com/) account
- A [Supabase](https://supabase.com/) project
- An [n8n](https://n8n.io/) instance (cloud or self-hosted)

### 1. Clone the repository

```bash
git clone https://github.com/aniketsahu007/student-os.git
cd student-os
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n Automation
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
```

### 4. Set up the database

Run the SQL schema in your Supabase SQL editor to create all required tables and enable Row Level Security:

```bash
# Open database_schema.sql and execute it in your Supabase dashboard
# SQL Editor → New Query → Paste contents → Run
```

Tables created:
- `users` — mapped to Clerk user IDs
- `budget_entries` — income / expense records
- `habits` + `habit_logs` — habit definitions and daily completions
- `notes` — markdown notes

All tables are protected by **Row Level Security (RLS)** policies that scope data to the authenticated Clerk user.

### 5. Configure n8n

Import the included `n8n.json` workflow into your n8n instance:

1. Open your n8n editor
2. Go to **Workflows → Import from file**
3. Select `n8n.json` from the project root
4. Activate the workflow and copy the webhook URL into `.env.local`

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
student-os/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API route handlers
│   │   ├── dashboard/          # Dashboard page
│   │   ├── calendar/           # Calendar page
│   │   ├── todos/              # To-Do page
│   │   ├── reminders/          # Reminders page
│   │   ├── notes/              # Notes page
│   │   ├── budget/             # Budget tracker page
│   │   ├── habits/             # Habit tracker page
│   │   ├── pomodoro/           # Pomodoro timer page
│   │   ├── layout.tsx          # Root layout (Clerk provider)
│   │   ├── globals.css         # Global styles & design tokens
│   │   └── dashboard.module.css
│   ├── components/
│   │   ├── AICommandBar.tsx    # ⌘K AI command bar with voice input
│   │   ├── DashboardShell.tsx  # Main layout wrapper
│   │   ├── PomodoroTimer.tsx   # Pomodoro focus timer
│   │   └── Sidebar.tsx         # Navigation sidebar
│   └── lib/                    # Shared utilities & Supabase client
├── database_schema.sql         # Supabase schema + RLS policies
├── n8n.json                    # n8n automation workflow
├── .env.example                # Environment variable template
└── next.config.ts
```

---

## 🔐 Authentication Flow

Student OS uses **Clerk** for authentication. Clerk JWTs are forwarded to Supabase via a custom `requesting_user_id()` SQL function that extracts the Clerk `sub` claim, enabling Supabase RLS to enforce per-user data isolation without duplicating auth logic.

```sql
-- Clerk JWT → Supabase RLS bridge
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE SQL STABLE;
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🌐 Deployment

The easiest way to deploy Student OS is with [Vercel](https://vercel.com):

1. Push your repo to GitHub
2. Import it on [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` to the Vercel project settings
4. Deploy — Vercel handles the rest

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/aniketsahu007">Aniket Sahu</a>
</p>
