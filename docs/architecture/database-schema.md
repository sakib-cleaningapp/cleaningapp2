# Database Schema

The database schema is defined with SQL CREATE TABLE statements for profiles, businesses, services, and bookings, including foreign key relationships, constraints, and data types (e.g., uuid, timestamptz). It also defines ENUM types for roles and statuses to ensure data integrity.

**Note**: The detailed schema will be defined in `packages/db/prisma/schema.prisma` and generated as SQL migrations in future stories.
