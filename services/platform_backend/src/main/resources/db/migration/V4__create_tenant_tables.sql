-- =============================================================================
-- V4: Tenant & Business Management
-- DEKAT Booking Platform
-- =============================================================================

-- ---------------------------------------------------------------------------
-- tenants: Top-level organisational unit (multi-tenant root)
-- ---------------------------------------------------------------------------
CREATE TABLE tenants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                VARCHAR(100) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    legal_name          VARCHAR(255),
    tax_id              VARCHAR(50),
    phone               VARCHAR(20),
    email               VARCHAR(320),
    logo_url            TEXT,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED'
        CHECK (verification_status IN (
            'UNVERIFIED','PENDING_REVIEW','VERIFIED','REJECTED','SUSPENDED'
        )),
    verified_at         TIMESTAMPTZ,
    rejected_at         TIMESTAMPTZ,
    rejection_reason    TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE','SUSPENDED','DEACTIVATED')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    version             INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_tenants_slug ON tenants (LOWER(slug));
CREATE INDEX idx_tenants_verification ON tenants (verification_status);
CREATE INDEX idx_tenants_status ON tenants (status);

-- ---------------------------------------------------------------------------
-- businesses: Business profile owned by a tenant
-- ---------------------------------------------------------------------------
CREATE TABLE businesses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    industry        VARCHAR(100),
    website_url     TEXT,
    email           VARCHAR(320),
    phone           VARCHAR(20),
    logo_url        TEXT,
    banner_url      TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE','SUSPENDED','DEACTIVATED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    version         INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_businesses_tenant ON businesses (tenant_id);
CREATE INDEX idx_businesses_status ON businesses (status);

-- ---------------------------------------------------------------------------
-- locations: Physical / virtual location with PostGIS geometry
-- ---------------------------------------------------------------------------
CREATE TABLE locations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    business_id     UUID REFERENCES businesses(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    address_line1   VARCHAR(255),
    address_line2   VARCHAR(255),
    city            VARCHAR(100),
    province        VARCHAR(100),
    postal_code     VARCHAR(10),
    country         VARCHAR(2) NOT NULL DEFAULT 'ID',
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    geometry        GEOMETRY(POINT, 4326),
    phone           VARCHAR(20),
    timezone        VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_locations_tenant ON locations (tenant_id);
CREATE INDEX idx_locations_business ON locations (business_id);
CREATE INDEX idx_locations_geometry ON locations USING gist (geometry);
CREATE INDEX idx_locations_city ON locations (city);

-- ---------------------------------------------------------------------------
-- business_documents: Uploaded verification documents (KTP, NIB, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE business_documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    doc_type    VARCHAR(50) NOT NULL,
    file_url    TEXT NOT NULL,
    file_name   VARCHAR(255),
    mime_type   VARCHAR(100),
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    notes       TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_business_documents_tenant ON business_documents (tenant_id);
CREATE INDEX idx_business_documents_status ON business_documents (status);

-- ---------------------------------------------------------------------------
-- verification_reviews: Audit trail for verification decisions
-- ---------------------------------------------------------------------------
CREATE TABLE verification_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id     UUID REFERENCES business_documents(id) ON DELETE SET NULL,
    reviewer_id     UUID NOT NULL REFERENCES users(id),
    decision        VARCHAR(20) NOT NULL
        CHECK (decision IN ('APPROVED','REJECTED','NEEDS_INFO')),
    comments        TEXT,
    previous_status VARCHAR(30),
    new_status      VARCHAR(30) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_reviews_tenant ON verification_reviews (tenant_id);
CREATE INDEX idx_verification_reviews_reviewer ON verification_reviews (reviewer_id);
