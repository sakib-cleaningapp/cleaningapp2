# Data Models

## User (Authentication)

- **Purpose**: Purely for authentication via Supabase Auth.
- **TypeScript Interface**:
  ```typescript
  interface User {
    id: string;
    email: string;
  }
  ```

## Profile

- **Purpose**: Stores public-facing data and role information for a `User`.
- **TypeScript Interface**:
  ```typescript
  interface Profile {
    id: string;
    fullName: string;
    role: 'customer' | 'business_owner';
  }
  ```

## Business

- **Purpose**: Stores the profile information for a service provider.
- **TypeScript Interface**:
  ```typescript
  interface Business {
    id: string;
    ownerId: string;
    businessName: string;
    bio: string;
    serviceCategory:
      | 'cleaning'
      | 'plumbing'
      | 'electrical'
      | 'decoration'
      | 'pest_control'
      | 'car_detailing';
  }
  ```

## Service

- **Purpose**: Stores a distinct service offered by a `Business`.
- **TypeScript Interface**:
  ```typescript
  interface Service {
    id: string;
    businessId: string;
    name: string;
    description: string;
    price: number;
  }
  ```

## Booking

- **Purpose**: Represents a transaction for a specific `Service`.
- **TypeScript Interface**:
  ```typescript
  interface Booking {
    id: string;
    customerId: string;
    businessId: string;
    serviceId: string;
    bookingDate: Date;
    totalCost: number;
    status: 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';
    createdAt: Date;
  }
  ```

## Data Policies

- **Timestamps**: All `timestamp` fields must be stored in the database in **UTC**.
