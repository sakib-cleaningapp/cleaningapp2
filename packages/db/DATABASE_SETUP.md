# Database Setup Instructions

## Prerequisites

1. Supabase project created (refer to apps/web/SUPABASE_SETUP.md)
2. Database URL and credentials obtained from Supabase

## Environment Variables

Create a `.env` file in the project root with:

```bash
# Database Configuration for Prisma
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Required Terminal Commands

Run these commands to complete the database setup:

```bash
# 1. Generate Prisma client
cd packages/db && npm run db:generate

# 2. Push schema to Supabase (for development)
cd packages/db && npm run db:push

# 3. Create initial migration (for production)
cd packages/db && npm run db:migrate

# 4. Optional: Open Prisma Studio
cd packages/db && npm run db:studio
```

## Verification

After running the commands above:

1. Check that `packages/db/node_modules/@prisma/client` exists
2. Verify tables are created in your Supabase dashboard
3. Confirm Prisma Studio can connect to the database

## Troubleshooting

- Ensure DATABASE_URL points to your Supabase PostgreSQL instance
- Check that your Supabase project allows connections from your IP
- Verify database credentials are correct in the connection string
