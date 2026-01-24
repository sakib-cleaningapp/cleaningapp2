# API Specification (tRPC Routers)

## Core Principle: Authorization

All protected procedures that access or modify specific data **must** include authorization logic to verify that the logged-in user is the owner of or has explicit permission to access that data.

## Routers

The API will be organized into logical routers such as `profileRouter`, `businessRouter`, and `bookingRouter`. Public procedures will be used for public data, while protected procedures will enforce the Authorization Principle.
