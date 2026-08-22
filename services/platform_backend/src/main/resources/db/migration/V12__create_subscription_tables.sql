-- V12: Subscription plans, subscriptions, usage counters, invoices

-- ============================================================
-- plans
-- ============================================================
CREATE TABLE plans (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                   VARCHAR(128) NOT NULL,
    slug                   VARCHAR(128) NOT NULL,
    price_amount           INT NOT NULL DEFAULT 0 CHECK (price_amount >= 0),
    currency               VARCHAR(3) NOT NULL DEFAULT 'IDR',
    billing_cycle          VARCHAR(16) NOT NULL DEFAULT 'MONTHLY'
                           CHECK (billing_cycle IN ('WEEKLY','MONTHLY','QUARTERLY','YEARLY')),
    max_staff              INT NOT NULL DEFAULT 1,
    max_bookings_per_month INT NOT NULL DEFAULT 100,
    features               JSONB,
    status                 VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
                           CHECK (status IN ('ACTIVE','INACTIVE','ARCHIVED')),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_plan_slug ON plans (slug);

-- ============================================================
-- subscriptions
-- ============================================================
CREATE TABLE subscriptions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL,
    plan_id              UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status               VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
                         CHECK (status IN ('ACTIVE','PAST_DUE','CANCELLED','TRIALING','PAUSED')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end   TIMESTAMPTZ NOT NULL,
    cancel_at            TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (current_period_start < current_period_end)
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions (tenant_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions (plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);

-- ============================================================
-- usage_counters
-- ============================================================
CREATE TABLE usage_counters (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    metric_type VARCHAR(64) NOT NULL,
    period_start DATE NOT NULL,
    period_end   DATE NOT NULL,
    count       INT NOT NULL DEFAULT 0 CHECK (count >= 0),

    UNIQUE (tenant_id, metric_type, period_start)
);

CREATE INDEX idx_usage_counters_tenant ON usage_counters (tenant_id, metric_type);

-- ============================================================
-- subscription_invoices
-- ============================================================
CREATE TABLE subscription_invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount          INT NOT NULL CHECK (amount >= 0),
    due_date        DATE NOT NULL,
    paid_at         TIMESTAMPTZ,
    status          VARCHAR(32) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','PAID','OVERDUE','VOID')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sub_invoices_subscription ON subscription_invoices (subscription_id);
CREATE INDEX idx_sub_invoices_status ON subscription_invoices (status);
