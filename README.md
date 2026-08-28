# Coin Calculator

A production-ready full-stack web application for digital calculation notebooks and coin request management.

## Stack

- **Frontend + Backend:** Next.js 15 (App Router, Route Handlers, Server Actions)
- **Database + Auth:** Supabase PostgreSQL, Supabase Auth, Row Level Security
- **Deployment:** Vercel
- **UI:** Tailwind CSS, shadcn/ui, Lucide icons

## Features

- User authentication (register, login, logout, password reset)
- Dashboard with live stats from Supabase
- Calculator with decimal-safe arithmetic
- Calculation notebook (save, edit, delete, duplicate, search)
- Coin request management with payment status (Paid/Due/Partial)
- Payment methods: Bkash, Nagad, Others
- Transaction ID tracking for paid/partial requests
- Server-side pagination, search, and filters
- Mobile-responsive dashboard with drawer navigation

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Supabase account
- Vercel account (for deployment)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd coin-calculator
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql`:
   - Open Supabase Dashboard → SQL Editor
   - Paste and run the migration file contents
3. Enable Email auth in Authentication → Providers
4. Add redirect URLs:
   - `http://localhost:3000/reset-password`
   - Your production URL + `/reset-password`

### 4. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Migrations

All schema changes live in `supabase/migrations/`. To apply:

1. Open Supabase SQL Editor
2. Run migration files in order (001, 002, …)

The initial migration creates:

- `profiles` — user profiles with admin role
- `coin_requests` — coin request records
- `calculations` — saved calculations
- `audit_logs` — action audit trail
- RLS policies for user isolation and admin access

## Vercel Deployment

### Step 1 — GitHub

```bash
git add .
git commit -m "Initial Coin Calculator app"
git push origin main
```

### Step 2 — Supabase

Ensure migrations are applied and auth is configured (see above).

### Step 3 — Vercel

1. Import the GitHub repository at [vercel.com](https://vercel.com)
2. Framework: **Next.js**
3. Build command: `next build`
4. Install command: `npm install`
5. Set environment variables (same as `.env.local`)
6. Deploy

### Step 4 — Verify

Test these routes in production:

- `/login`
- `/dashboard`
- `/dashboard/calculator`
- `/dashboard/coin-requests`

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests
```

## Project Structure

```
app/
  (auth)/          # Login, register, password reset
  dashboard/       # Protected dashboard pages
  api/             # Route Handlers
components/        # UI and feature components
lib/
  supabase/        # Supabase clients
  services/        # Business logic
  validations/     # Zod schemas
  permissions/     # Auth helpers
supabase/
  migrations/      # Database migrations
types/             # TypeScript types
```

## Security

- Service role key is server-side only (never `NEXT_PUBLIC_`)
- RLS enabled on all user data tables
- Server-side permission checks on all API routes
- Transaction IDs excluded from audit log metadata
- Backend Zod validation is authoritative

## Admin Access

After registering, promote a user to admin in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```
