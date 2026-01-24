Tech Stack
The stack is centered around TypeScript, Next.js, tRPC, Prisma, Tailwind CSS, and Supabase. Specific versions are defined to ensure a stable development environment (e.g., Next.js ~14.2, Turborepo for monorepo management).

Data Models & Schema
The architecture uses four core tables: Profiles (for user data like name/role, linked to Supabase Auth), Businesses, Services (a dedicated table for each service a business offers, with its own price), and Bookings. All timestamps are stored in UTC. The schema will be managed via Prisma migrations.

API Specification
The API is defined using tRPC routers (profileRouter, businessRouter, bookingRouter). A core principle of Authorization is enforced: all procedures must verify that a logged-in user has permission to access or modify the requested data.

Core Workflow
The primary booking flow uses an "Authorize and Capture" model. A hold is placed on the customer's card at the time of request. The funds are only captured after the business partner accepts the booking.

Source Tree
A Turborepo monorepo structure will be used, with an apps directory for the web and supabase applications, and a packages directory for shared code like types, db (Prisma schema), and a ui component library.

Infrastructure and Deployment
Deployment will use a Git-based CI/CD strategy, leveraging Vercel for the frontend and Supabase's GitHub Action for the backend. Preview environments will be created for all pull requests, with the main branch deploying to production.

Error Handling & Coding Standards
The system uses provider-native logging. A set of five critical coding standards are defined for all developers (human and AI) to follow, including mandatory type sharing and use of the Prisma client. These rules will be enforced by a pre-commit hook.
