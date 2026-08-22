# ADR 004: Payment Gateway Adapter Pattern

**Status:** Accepted
**Date:** 2026-08-22
**Deciders:** DEKAT Engineering Team

## Context

DEKAT processes payments for bookings, subscriptions, and promotions. The platform must support multiple payment methods:
- Indonesian bank transfers (BCA, BRI, Mandiri, BNI)
- E-wallets (GoPay, OVO, Dana, ShopeePay)
- QRIS (QR Indonesian Standard)
- Credit/debit cards (Visa, Mastercard)
- Later: international payment methods

The system must be resilient to gateway outages and able to add new payment providers without code changes in the booking/payment flow.

## Decision

We use the **Adapter Pattern** (strategy pattern) for payment gateway integration.

**Architecture:**
```
PaymentService (domain)
  -> PaymentGatewayPort (interface)
       -> MidtransAdapter (implementation)
       -> XenditAdapter (implementation)
       -> DummyAdapter (for testing)
```

**Key design decisions:**

1. **Port interface** defines operations: `createCharge`, `handleWebhook`, `refund`, `getPaymentStatus`.
2. **Each adapter** implements the port and translates between DEKAT's internal payment model and the gateway's API.
3. **Gateway selection** is configurable per tenant via `tenant_config.payment_gateway` (stored in DB).
4. **Webhook handling** uses a unified `/api/v1/payments/webhook/{gateway}` endpoint that dispatches to the correct adapter.
5. **Idempotency** is enforced via `idempotency_key` on every charge request.
6. **Retry logic** uses exponential backoff with circuit breaker (Resilience4j).

**Payment flow:**
```
1. BookingService creates a Booking (status: PENDING_PAYMENT)
2. PaymentService.createCharge() delegates to the configured adapter
3. Adapter returns a payment_url / qr_code / virtual_account
4. Customer completes payment externally
5. Gateway sends webhook -> PaymentService.handleWebhook()
6. PaymentService updates Booking status to CONFIRMED
7. NotificationService sends confirmation to customer
```

**Webhook security:**
- Each adapter validates webhook signatures using gateway-specific HMAC/secret
- Webhooks are idempotent (duplicate delivery is safe)
- Failed webhooks are retried via a dead-letter queue in Kafka

## Consequences

**Positive:**
- New payment gateways added by implementing one adapter class
- Booking/payment flow is decoupled from gateway specifics
- Gateway outages are isolated (circuit breaker per adapter)
- Easy to test with DummyAdapter

**Negative:**
- Adapter maintenance burden for each gateway's API changes
- Webhook handling complexity increases with more gateways
- Reconciliation must account for gateway-specific settlement cycles

**Mitigations:**
- Each adapter has its own integration test suite against sandbox environments
- Webhook payloads are validated and logged for debugging
- Reconciliation job runs daily and compares internal records with gateway reports

## Alternatives Considered

1. **Single gateway direct integration:** Rejected because it creates vendor lock-in and no failover path.
2. **Abstraction via a meta-gateway (e.g., TripleA):** Rejected because it adds cost and reduces control over the payment flow.
3. **Payment facilitator model:** Deferred until the platform processes sufficient volume.
