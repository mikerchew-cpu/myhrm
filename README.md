# MyHRM Pro — Malaysia Edition

Full-stack HR management application for Malaysian employers, compliant with Employment Act 1955.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (dev) / PostgreSQL (production via Vercel Postgres)
- **ORM:** Prisma
- **UI:** Custom CSS with Tabler Icons + DM Sans font

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma db push

# Seed sample data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

The app uses SQLite by default (zero config). For production on Vercel:

1. Provision [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
2. Set `DATABASE_URL` in your Vercel project environment variables
3. The schema is compatible with both SQLite and PostgreSQL

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to a GitHub repo
2. Import into Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy — the `vercel.json` config handles Prisma generation

## Deploy to GitHub Pages

Since this is a Next.js app with API routes (server-side), it requires a Node.js runtime. GitHub Pages only hosts static files. Use Vercel for full functionality.

## Features

- Employee directory with CRUD (persisted to database)
- Claims management with mileage calculator
- Leave application and approval workflow
- OT calculator (EA 1955 s60A compliant)
- Performance dashboard and 9-box talent matrix
- Foreign worker management with compliance tracking
- Levy calculator (multi-tier rate support)
- Attendance and payroll overview
- Approval matrix with level-based routing
- Responsive design (mobile + desktop)
- Toast notification system
- AI insights panel (DeepSeek integration ready)

## Project Structure

```
├── app/
│   ├── api/          # REST API routes (employees, claims, leave, etc.)
│   ├── page.tsx      # Dashboard
│   ├── layout.tsx    # Root layout with sidebar
│   └── globals.css   # Global styles
├── components/       # React components (Sidebar, Topbar, Toast)
├── lib/              # Prisma client + types
├── prisma/           # Database schema
├── scripts/          # Seed script
└── public/           # Static assets
```
