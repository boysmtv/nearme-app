-- V10: Payment, refund, ledger, and settlement tables

-- ============================================================
-- payment_intents
-- ============================================================
CREATE TABLE payment_intents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id        UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    tenant_id         UUID NOT NULL,
    amount            INT NOT NULL CHECK (amount >= 0),
    currency          VARCHAR(3) NOT NULL DEFAULT 'IDR',
    method            VARCHAR(32) NOT NULL
                      CHECK (method IN ('CASH','CARD','BANK_TRANSFER','E_WALLET','QRIS','VIRTUAL_ACCOUNT')),
    status            VARCHAR(32) NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','AUTHORIZED','CAPTURED','FAILED','CANCELLED','REFUNDED')),
    gateway_reference VARCHAR(255),
    expires_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_intents_booking ON payment_intents (booking_id);
CREATE INDEX idx_payment_intents_tenant_status ON payment_intents (tenant_id, status);

-- ============================================================
-- payment_transactions (ledger of gateway calls)
-- ============================================================
CREATE TABLE payment_transactions (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_intent_id  UUID NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
    gateway_provider   VARCHAR(32) NOT NULL,
    gateway_reference  VARCHAR(255),
    amount             INT NOT NULL CHECK (amount >= 0),
    status             VARCHAR(32) NOT NULL
                       CHECK (status IN ('INITIATED','PENDING','SUCCESS','FAILED','REVERSED')),
    raw_response       JSONB,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_tx_intent ON payment_transactions (payment_intent_id);

-- ============================================================
-- payment_webhook_events (idempotency store for gateways)
-- ============================================================
CREATE TABLE payment_webhook_events (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_provider VARCHAR(32) NOT NULL,
    event_id         VARCHAR(255) NOT NULL,
    raw_payload      TEXT NOT NULL,
    processed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_webhook_event_id
    ON payment_webhook_events (gateway_provider, event_id);

-- ============================================================
-- refunds
-- ============================================================
CREATE TABLE refunds (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id         UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    payment_intent_id  UUID NOT NULL REFERENCES payment_intents(id) ON DELETE RESTRICT,
    amount             INT NOT NULL CHECK (amount > 0),
    reason             TEXT,
    status             VARCHAR(32) NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING','APPROVED','REJECTED','PROCESSED','FAILED')),
    gateway_reference  VARCHAR(255),
    approved_by        UUID NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refunds_booking ON refunds (booking_id);
CREATE INDEX idx_refunds_payment_intent ON refunds (payment_intent_id);

-- ============================================================
-- ledger_entries (financial double-entry bookkeeping)
-- ============================================================
CREATE TABLE ledger_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    booking_id  UUID NULL REFERENCES bookings(id) ON DELETE SET NULL,
    entry_type  VARCHAR(32) NOT NULL
                CHECK (entry_type IN ('REVENUE','REFUND','COMMISSION','FEE','TAX','DEPOSIT','ADJUSTMENT')),
    amount      INT NOT NULL,
    currency    VARCHAR(3) NOT NULL DEFAULT 'IDR',
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ledger_tenant ON ledger_entries (tenant_id, created_at);
CREATE INDEX idx_ledger_booking ON ledger_entries (booking_id)
    WHERE booking_id IS NOT NULL;

-- ============================================================
-- settlement_batches (payout to tenants)
-- ============================================================
CREATE TABLE settlement_batches (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL,
    period_start      TIMESTAMPTZ NOT NULL,
    period_end        TIMESTAMPTZ NOT NULL,
    gross_amount      INT NOT NULL DEFAULT 0,
    commission_amount INT NOT NULL DEFAULT 0,
    net_amount        INT NOT NULL DEFAULT 0,
    status            VARCHAR(32) NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (period_start < period_end),
    CHECK (net_amount = gross_amount - commission_amount)
);

CREATE INDEX idx_settlement_tenant ON settlement_batches (tenant_id, created_at);
