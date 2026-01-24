# 2. Requirements

## Functional

1.  **FR1**: The system must provide separate registration, login, and profile management flows for "Customer" and "Business Partner" user roles.
2.  **FR2**: Business Partners must be able to create and manage a public profile that lists their services, specialties, and hourly rates.
3.  **FR3**: Customers must be able to search for Business Partners by service category and postcode.
4.  **FR4**: The system must facilitate a booking request flow where a Customer can propose a date/time, and a Business Partner has 24 hours to accept or reject the request.
5.  **FR5**: Booking requests that are not responded to by a Business Partner within 24 hours must be automatically cancelled.
6.  **FR6**: The system must integrate with Stripe to process a customer's payment immediately after a Business Partner accepts a booking request.
7.  **FR7**: Both user roles must have a dashboard to view their upcoming and historical bookings.

## Non-Functional

1.  **NFR1**: The application must be designed and optimized for a desktop browser experience.
2.  **NFR2**: All backend services, database, and authentication must be built using Supabase.
3.  **NFR3**: The platform must be restricted to Business Partners and Customers operating within the specified South Wales postcodes.
4.  **NFR4**: Key landing and search pages should have a load time of under 3 seconds on a standard broadband connection.
