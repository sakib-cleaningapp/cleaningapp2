# Core Workflows

## Booking Flow (Authorize & Capture Model)

The primary booking flow uses an **"Authorize and Capture"** model. A hold is placed on the customer's card at the time of request. The funds are only captured after the business partner accepts the booking.

```mermaid
sequenceDiagram
    participant User
    participant Frontend (Next.js)
    participant API (tRPC)
    participant Business Logic (Edge Function)
    participant Database (Supabase DB)
    participant Stripe

    User->>+Frontend: Fills out booking form & enters card details
    Frontend->>+Stripe: Gets payment method token from Stripe.js
    Stripe-->>-Frontend: Returns token
    Frontend->>+API: call bookingRouter.createRequest({serviceId, date, paymentToken})
    API->>+Business Logic: Executes createRequest function
    Business Logic->>+Stripe: Create PaymentIntent with token, **authorize** only (capture: 'manual')
    Stripe-->>-Business Logic: Return PaymentIntent ID
    Business Logic->>+Database: Create booking with 'pending' status and PaymentIntent ID

    Note over User, Stripe: Later, Business Owner accepts...

    Business Logic->>+Stripe: **Capture** existing PaymentIntent
    Stripe-->>-Business Logic: Capture successful
    Business Logic->>+Database: Update booking status to 'confirmed'
```
