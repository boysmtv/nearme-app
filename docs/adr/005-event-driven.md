# ADR 005: Transactional Outbox + Kafka Event-Driven Architecture

**Status:** Accepted
**Date:** 2026-08-22
**Deciders:** DEKAT Engineering Team

## Context

DEKAT requires asynchronous communication between modules. Booking confirmation triggers notifications, analytics, and loyalty updates. Payment success triggers booking confirmation and provider settlement. Staff schedule changes propagate to availability. The system must guarantee at-least-once delivery without losing events during failures.

## Decision

We use the **Transactional Outbox Pattern** with Kafka as the event broker.

### Outbox Table

Each module that publishes events has an `outbox_events` table:

```sql
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY,
  aggregate_type VARCHAR(255) NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT false,
  tenant_id UUID NOT NULL
);
```

### Event Flow

1. Domain event is written to the outbox table within the same transaction as the business data change.
2. A polling publisher reads unpublished events every 2 seconds and publishes them to Kafka.
3. Consumers process events idempotently using `event_id` deduplication.
4. Failed events are retried 3 times, then moved to dead-letter topics.

### Kafka Topics

| Topic | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| `dekat.booking.events` | booking | notification, analytics, audit | Booking lifecycle |
| `dekat.payment.events` | payment | booking, notification, reporting | Payment status |
| `dekat.catalog.events` | catalog | scheduling, cache-invalidation | Service changes |
| `dekat.staff.events` | staff | scheduling | Staff availability |
| `dekat.notification.outbox` | notification | push/email workers | Notification dispatch |

### Event Schema (CloudEvents-inspired)

```json
{
  "event_id": "uuid",
  "event_type": "BookingConfirmed",
  "aggregate_type": "Booking",
  "aggregate_id": "uuid",
  "tenant_id": "uuid",
  "timestamp": "2026-08-22T10:00:00Z",
  "data": {}
}
```

## Consequences

**Positive:**
- Atomic write guarantees no lost events
- Decoupled modules can evolve independently
- Kafka provides durable event log for replay

**Negative:**
- Outbox polling adds 2-4 seconds latency
- Consumer code must be idempotent
- Kafka is an additional infrastructure component

**Mitigations:**
- Polling interval is tunable (default 2s)
- Idempotency enforced via `event_id` unique constraint
- Kafka runs in KRaft mode on the VPS

## Alternatives Considered

1. **Change Data Capture (Debezium):** Rejected due to infrastructure complexity.
2. **Direct Kafka publish in transaction:** Rejected because Kafka publish can succeed while DB commit fails.
3. **Synchronous dispatch:** Rejected because it couples modules and creates cascade failures.
