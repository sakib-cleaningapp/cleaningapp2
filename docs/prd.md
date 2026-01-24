# Cleanly: Product Requirements Document (PRD)

- **Version**: 1.0
- **Date**: 31 August 2025
- **Author**: John, Product Manager

## 1. Goals and Background Context

### Goals

- Provide customers in South Wales a single, reliable platform to find and book vetted, established home service businesses.
- Offer professional home service companies a dedicated marketplace to gain visibility and acquire new customers.
- Streamline the booking and payment process for both customers and business partners.

### Background Context

Current home service platforms are primarily focused on individual freelancers, leaving a gap for customers who seek the reliability and accountability of established companies. Cleanly addresses this by creating an exclusive marketplace for vetted businesses.

## 2. Requirements

### Functional

1.  **FR1**: The system must provide separate registration, login, and profile management flows for "Customer" and "Business Partner" user roles.
2.  **FR2**: Business Partners must be able to create and manage a public profile that lists their services, specialties, and hourly rates.
3.  **FR3**: Customers must be able to search for Business Partners by service category and postcode.
4.  **FR4**: The system must facilitate a booking request flow where a Customer can propose a date/time, and a Business Partner has 24 hours to accept or reject the request.
5.  **FR5**: Booking requests that are not responded to by a Business Partner within 24 hours must be automatically cancelled.
6.  **FR6**: The system must integrate with Stripe to process a customer's payment immediately after a Business Partner accepts a booking request.
7.  **FR7**: Both user roles must have a dashboard to view their upcoming and historical bookings.

### Non-Functional

1.  **NFR1**: The application must be designed and optimized for a desktop browser experience.
2.  **NFR2**: All backend services, database, and authentication must be built using Supabase.
3.  **NFR3**: The platform must be restricted to Business Partners and Customers operating within the specified South Wales postcodes.
4.  **NFR4**: Key landing and search pages should have a load time of under 3 seconds on a standard broadband connection.

## 3. User Interface Design Goals

- **Overall UX Vision**: The user experience should be professional, intuitive, and efficient, visually styled after modern food delivery apps. The design should be clean and icon-driven, with a primary color scheme based on a light blue/sky blue theme.
- **Key Interaction Paradigms**: The primary user journey is a "Category-First" navigation model. The final, specific service required is defined by the customer within the booking request message.
- **Target Device**: Desktop Only.

## 4. Technical Assumptions

- **Repository Structure**: Monorepo.
- **Service Architecture**: Serverless with Supabase Edge Functions.
- **Testing Requirements**: Unit + Integration Tests.
- **Additional Assumptions**: The project will use Supabase for its backend/database and Stripe for payments.

## 5. MVP Story Backlog

1.  Project Foundation Setup
2.  Customer Registration & Login
3.  Basic Customer Dashboard
4.  Business Partner Registration
5.  Business Profile & Service Management
6.  Basic Business Dashboard
7.  Customer Service Discovery
8.  The Core Booking & Payment Flow
9.  Update Dashboards with Live Bookings
