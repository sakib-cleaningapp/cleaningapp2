# Development Setup Instructions

## ⚠️ Important: Terminal Commands Required

Due to terminal access limitations during implementation, the following commands need to be executed to complete the foundation setup:

## 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install dependencies for all workspaces
npm run install:all

# Or install individually
cd packages/db && npm install
cd ../types && npm install
cd ../../apps/web && npm install
```

## 2. Database Setup

```bash
# Generate Prisma client
cd packages/db && npm run db:generate

# Push schema to Supabase (development)
cd packages/db && npm run db:push

# Create migration (production)
cd packages/db && npm run db:migrate
```

## 3. Build Shared Packages

```bash
# Build types package
cd packages/types && npm run build

# Build shared package
cd packages/shared && npm run build
```

## 4. Environment Configuration

Create `.env.local` in the project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 5. Development Server

```bash
# Start development server (from root)
npm run dev

# Or individual services
cd apps/web && npm run dev
```

## 6. Verification Steps

1. **Database**: Check Prisma client generation

   ```bash
   cd packages/db && npm run db:studio
   ```

2. **tRPC**: Test API endpoint

   ```bash
   curl http://localhost:3000/api/trpc/profile.me
   ```

3. **Types**: Verify shared types compilation
   ```bash
   cd packages/types && npm run build
   ```

## Next Phase: Shadcn/ui Integration

After completing the above setup, continue with:

1. **Shadcn/ui CLI Installation**
2. **Component Library Setup**
3. **Testing Framework Configuration**
4. **Development Tooling Setup**

## Troubleshooting

- **Prisma Issues**: Ensure DATABASE_URL is correctly formatted
- **tRPC Errors**: Check that all dependencies are installed
- **Type Errors**: Build shared packages first before starting dev server
- **Supabase Connection**: Verify project credentials in environment variables
