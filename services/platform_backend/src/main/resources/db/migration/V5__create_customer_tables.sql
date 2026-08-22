-- =============================================================================
-- V5: Customer Management Tables
-- DEKAT Booking Platform
-- =============================================================================

-- ---------------------------------------------------------------------------
-- customer_profiles: Customer-specific profile data
-- ---------------------------------------------------------------------------
CREATE TABLE customer_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nickname        VARCHAR(100),
    notes           TEXT,
    loyalty_points  INTEGER NOT NULL DEFAULT 0,
    total_bookings  INTEGER NOT NULL DEFAULT 0,
    total_spent     NUMERIC(12,2) NOT NULL DEFAULT 0,
    last_booking_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    version         INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_customer_profiles_scope
    ON customer_profiles (user_id, tenant_id);
CREATE INDEX idx_customer_profiles_tenant ON customer_profiles (tenant_id);

-- ---------------------------------------------------------------------------
-- customer_addresses: Saved addresses per customer
-- ---------------------------------------------------------------------------
CREATE TABLE customer_addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    label           VARCHAR(50) NOT NULL DEFAULT 'HOME',
    address_line1   VARCHAR(255) NOT NULL,
    address_line2   VARCHAR(255),
    city            VARCHAR(100),
    province        VARCHAR(100),
    postal_code     VARCHAR(10),
    country         VARCHAR(2) NOT NULL DEFAULT 'ID',
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_addresses_customer ON customer_addresses (customer_id);

-- ---------------------------------------------------------------------------
-- customer_tenant_links: Cross-tenant customer membership
-- ---------------------------------------------------------------------------
CREATE TABLE customer_tenant_links (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE','BLOCKED','ARCHIVED')),
    first_contact_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_customer_tenant_links
    ON customer_tenant_links (customer_id, tenant_id);
CREATE INDEX idx_customer_tenant_links_tenant ON customer_tenant_links (tenant_id);

-- ---------------------------------------------------------------------------
-- customer_notes: Internal notes about a customer (staff-visible)
-- ---------------------------------------------------------------------------
CREATE TABLE customer_notes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id),
    note            TEXT NOT NULL,
    is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_notes_customer ON customer_notes (customer_id);
CREATE INDEX idx_customer_notes_tenant ON customer_notes (tenant_id);

-- ---------------------------------------------------------------------------
-- consents: GDPR / privacy consent records
-- ---------------------------------------------------------------------------
CREATE TABLE consents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    consent_type    VARCHAR(50) NOT NULL,
    granted         BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address      INET,
    user_agent      TEXT,
    version         VARCHAR(20) NOT NULL DEFAULT '1.0',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_consents_user ON consents (user_id);
CREATE INDEX idx_consents_tenant ON consents (tenant_id) WHERE tenant_id IS NOT NULL;
