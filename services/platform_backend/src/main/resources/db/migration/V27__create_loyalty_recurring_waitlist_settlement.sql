-- V27: Loyalty accounts, recurring bookings, waitlist, settlement, settlement batches

-- Loyalty accounts
CREATE TABLE IF NOT EXISTS loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    points INT NOT NULL DEFAULT 0,
    total_earned INT NOT NULL DEFAULT 0,
    total_redeemed INT NOT NULL DEFAULT 0,
    tier VARCHAR(20) NOT NULL DEFAULT 'BRONZE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_loyalty_customer_tenant UNIQUE (customer_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_customer ON loyalty_accounts(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_tenant ON loyalty_accounts(tenant_id);

-- Loyalty transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    points INT NOT NULL DEFAULT 0,
    booking_id UUID,
    description VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_tx_account ON loyalty_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_tx_customer ON loyalty_transactions(customer_id);

-- Recurring bookings
CREATE TABLE IF NOT EXISTS recurring_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    service_id UUID NOT NULL,
    staff_id UUID,
    frequency VARCHAR(20) NOT NULL DEFAULT 'WEEKLY',
    day_of_week INT,
    day_of_month INT,
    time_of_day TIME,
    next_occurrence DATE,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recurring_customer ON recurring_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tenant ON recurring_bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recurring_next ON recurring_bookings(next_occurrence) WHERE is_active = TRUE;

-- Waitlist entries
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    service_id UUID,
    staff_id UUID,
    preferred_date DATE,
    preferred_time TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    position INT NOT NULL DEFAULT 1,
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_tenant_date ON waitlist_entries(tenant_id, preferred_date);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist_entries(status) WHERE status = 'WAITING';

-- Settlement batches
CREATE TABLE IF NOT EXISTS settlement_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue BIGINT NOT NULL DEFAULT 0,
    commission BIGINT NOT NULL DEFAULT 0,
    net_payout BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    paid_at TIMESTAMPTZ,
    bank_name VARCHAR(50),
    bank_account VARCHAR(50),
    bank_account_name VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settlement_tenant ON settlement_batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_settlement_status ON settlement_batches(status) WHERE status = 'PENDING';
