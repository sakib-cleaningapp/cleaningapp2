# Tech Stack

## Technology Stack Table

| Category                 | Technology                     | Version | Purpose                                 | Rationale                                                               |
| :----------------------- | :----------------------------- | :------ | :-------------------------------------- | :---------------------------------------------------------------------- |
| **Frontend Language**    | TypeScript                     | ~5.4    | Primary development language            | Strong typing for bug prevention and better developer experience.       |
| **Frontend Framework**   | Next.js                        | ~14.2   | Full-stack React framework              | Fast performance, great developer experience, serverless support.       |
| **UI Component Library** | Shadcn/ui                      | latest  | Composable and accessible UI components | Works perfectly with Tailwind, is unstyled by default for full control. |
| **State Management**     | Zustand                        | ~4.5    | Lightweight state management            | Simple, effective, and less boilerplate than Redux for MVP scope.       |
| **Backend Language**     | TypeScript                     | ~5.4    | Language for Edge Functions             | Consistent language across the stack, ensures type safety.              |
| **Backend Framework**    | Supabase Edge Functions        | latest  | Serverless backend logic                | Managed, scalable, and integrates directly with our database.           |
| **API Style**            | tRPC                           | ~11.0   | Typesafe API layer                      | End-to-end type safety between frontend and backend.                    |
| **Database**             | PostgreSQL (via Supabase)      | 15.1    | Primary relational database             | Powerful, reliable, and expertly managed by Supabase.                   |
| **Database ORM**         | Prisma                         | ~5.12   | Database toolkit                        | Simplifies database interactions and provides type safety.              |
| **File Storage**         | Supabase Storage               | latest  | For user/business uploads (e.g., logos) | Simple S3-compatible storage integrated with our backend.               |
| **Authentication**       | Supabase Auth                  | latest  | User and session management             | Secure, integrated with the database, provides row-level security.      |
| **Frontend Testing**     | Vitest & React Testing Library | latest  | Component and unit testing              | Modern, fast, and the standard for testing React components.            |
| **Backend Testing**      | Vitest                         | latest  | Unit testing for Edge Functions         | Consistent testing framework across the stack.                          |
| **Build Tool**           | Turborepo                      | latest  | Monorepo management tool                | High-performance build system for managing the monorepo.                |
| **Styling**              | Tailwind CSS                   | ~3.4    | Utility-first CSS framework             | Rapid UI development and easy customization.                            |
