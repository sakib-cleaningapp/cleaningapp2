# Coding Standards

## Core Standards

- **Style**: The project will use ESLint and Prettier.
- **Automated Enforcement**: A pre-commit hook (using husky) will be configured to automatically run the linter and formatter.

## Critical Rules

- **Type Sharing**: Always define shared data types in the packages/types directory.
- **API Layer**: All frontend data access must go through the defined tRPC procedures.
- **Database Access**: All database access within Edge Functions must use the Prisma client.
- **Environment Variables**: All environment variables must be validated at build time.
- **Security**: Never log sensitive user information or secret API keys.
