# Cleanly MVP - Home Services Platform

A modern, serverless home services marketplace connecting customers with verified business partners in South Wales.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Supabase Edge Functions with tRPC
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe integration
- **Deployment**: Vercel (frontend) + Supabase (backend)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd cleanlymvpcursor
   npm install
   ```

2. **Set up Supabase:**
   - Follow the guide in `apps/web/SUPABASE_SETUP.md`
   - Copy `apps/web/.env.example` to `apps/web/.env.local`
   - Add your Supabase credentials

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Web app: [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
cleanlymvpcursor/
├── apps/
│   ├── web/                    # Next.js frontend application
│   └── functions/              # Supabase Edge Functions (future)
├── packages/
│   ├── shared/                 # Shared types and utilities
│   └── types/                  # TypeScript definitions
├── docs/                       # Project documentation
└── .bmad-core/                # BMAD development framework
```

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start web app development server
npm run dev:web          # Start web app (explicit)

# Building
npm run build            # Build web app for production
npm run build:web        # Build web app (explicit)

# Linting
npm run lint             # Run ESLint on web app
```

## 🎯 MVP Features

1. **Foundation Setup** ✅
2. Customer Registration & Login
3. Basic Customer Dashboard
4. Business Partner Registration
5. Business Profile & Service Management
6. Basic Business Dashboard
7. Customer Service Discovery
8. Core Booking & Payment Flow
9. Live Dashboard Updates

## 🔧 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **API**: tRPC + Supabase Edge Functions
- **Payments**: Stripe
- **Testing**: Jest + Vitest (to be configured)

## 📚 Documentation

- [Architecture Documents](./docs/architecture/)
- [Product Requirements](./docs/prd/)
- [User Stories](./docs/stories/)
- [Supabase Setup Guide](./apps/web/SUPABASE_SETUP.md)

## 🚀 Deployment

- **Frontend**: Deploy to Vercel (automatically configured)
- **Backend**: Supabase Edge Functions
- **Database**: Supabase PostgreSQL

## 📝 License

Private project - All rights reserved.

# cleaningapp2
