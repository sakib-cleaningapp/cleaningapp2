# Infrastructure and Deployment

## Deployment Strategy

Deployment will use a Git-based CI/CD strategy, leveraging Vercel for the frontend and Supabase's GitHub Action for the backend. Preview environments will be created for all pull requests, with the main branch deploying to production. Vercel's one-click rollback feature will be our primary rollback method.

## Environments

- **Development**: A developer's local machine.
- **Preview**: Automatically created by Vercel for every pull request.
- **Production**: The live application, hosted on Vercel and Supabase.

## Error Handling Strategy

The system will use provider-native logging (Vercel/Supabase) with a Correlation ID for tracing. The frontend uses React Error Boundaries, while the backend uses a central error handler to provide safe, user-friendly error messages.
