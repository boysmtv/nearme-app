# ADR 001: Modular Monolith Architecture

**Status:** Accepted
**Date:** 2026-08-22
**Deciders:** DEKAT Engineering Team

## Context

DEKAT Booking Platform needs an architecture that balances rapid development for a small team with the ability to scale later. The system handles bookings, payments, scheduling, notifications, and marketplace features across mobile (Flutter) and web (React) clients.

Key constraints:
- Small-to-medium engineering team
- Single VPS deployment initially (post-deployment scaling target)
- Domain boundaries are well-defined (identity, booking, payment, scheduling, etc.)
- Future extraction to microservices must remain possible

## Decision

We adopt a **modular monolith** architecture using Spring Modulith with clearly defined module boundaries. The system is deployed as a single Spring Boot application with a separate async worker process.

Module structure:
```
platform_backend/
  sharedkernel/   -- shared DTOs, events, utilities
  identity/       -- auth, JWT, user registration
  access/         -- RBAC, permissions
  tenant/         -- multi-tenancy management
  staff/          -- staff CRUD, assignment
  catalog/        -- services, categories, pricing
  scheduling/     -- availability, slots, calendar
  booking/        -- booking lifecycle
  payment/        -- payment processing, refunds
  subscription/   -- provider subscription plans
  customer/       -- customer profiles, preferences
  marketplace/    -- discovery, search, rankings
  review/         -- ratings, reviews
  promotion/      -- coupons, campaigns
  notification/   -- push, email, WhatsApp, in-app
  support/        -- tickets, FAQ
  reporting/      -- analytics, dashboards
  media/          -- file upload, images
  audit/          -- audit log, compliance
  platformconfig/ -- system configuration
```

Inter-module communication follows these rules:
1. **Synchronous (in-process):** Direct Java calls through module facades/services. No cross-module repository access.
2. **Asynchronous:** Spring ApplicationEvents (in-process) or Kafka events (cross-process). Eventual consistency is the default.

## Consequences

**Positive:**
- Single deployment unit simplifies operations on a single VPS
- Module boundaries can be enforced by ArchUnit tests and package visibility
- Straightforward debugging and local development
- Low operational overhead compared to microservices

**Negative:**
- Scaling is vertical only (single JVM)
- Module coupling risk if boundaries are not enforced
- Deployment requires full rebuild even for a single module change

**Mitigations:**
- ArchUnit tests enforce module dependency rules
- Facade pattern prevents cross-module repository access
- Database schemas are logically partitioned per module
- Modules are designed for eventual extraction (no shared state beyond the database)

## Alternatives Considered

1. **Microservices:** Rejected due to operational complexity for the current team size and deployment infrastructure.
2. **Traditional monolith (no module structure):** Rejected because it provides no path to decomposition.
3. **Event-sourcing for all modules:** Rejected as premature; only booking and payment may benefit from event sourcing later.
