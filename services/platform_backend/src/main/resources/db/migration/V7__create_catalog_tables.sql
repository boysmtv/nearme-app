-- =============================================================================
-- V7: Service Catalog Tables
-- DEKAT Booking Platform
-- =============================================================================

-- ---------------------------------------------------------------------------
-- categories: Service grouping / taxonomy
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url    TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_tenant ON categories (tenant_id);
CREATE INDEX idx_categories_parent ON categories (parent_id) WHERE parent_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- services: Core bookable service definition
-- ---------------------------------------------------------------------------
CREATE TABLE services (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id         UUID REFERENCES categories(id) ON DELETE SET NULL,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    short_description   VARCHAR(500),
    duration_minutes    INTEGER NOT NULL DEFAULT 30,
    buffer_minutes      INTEGER NOT NULL DEFAULT 0,
    price               NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency            VARCHAR(3) NOT NULL DEFAULT 'IDR',
    image_url           TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    requires_resource   BOOLEAN NOT NULL DEFAULT FALSE,
    max_participants    INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    version             INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_services_tenant ON services (tenant_id);
CREATE INDEX idx_services_category ON services (category_id) WHERE category_id IS NOT NULL;
CREATE INDEX idx_services_active ON services (tenant_id, is_active);
CREATE INDEX idx_services_name_trgm ON services USING gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- service_variants: Variations of a service (e.g. Regular, Premium, VIP)
-- ---------------------------------------------------------------------------
CREATE TABLE service_variants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id          UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    duration_minutes    INTEGER,
    price               NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency            VARCHAR(3) NOT NULL DEFAULT 'IDR',
    sort_order          INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_variants_service ON service_variants (service_id);

-- ---------------------------------------------------------------------------
-- service_addons: Optional add-ons for a service
-- ---------------------------------------------------------------------------
CREATE TABLE service_addons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency        VARCHAR(3) NOT NULL DEFAULT 'IDR',
    duration_minutes INTEGER,
    max_quantity    INTEGER NOT NULL DEFAULT 1,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_addons_service ON service_addons (service_id);

-- ---------------------------------------------------------------------------
-- service_prices: Price overrides by context (location, channel, promo)
-- ---------------------------------------------------------------------------
CREATE TABLE service_prices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    variant_id      UUID REFERENCES service_variants(id) ON DELETE CASCADE,
    location_id     UUID REFERENCES locations(id) ON DELETE CASCADE,
    price           NUMERIC(10,2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'IDR',
    channel         VARCHAR(30),
    valid_from      TIMESTAMPTZ,
    valid_to        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_prices_service ON service_prices (service_id);
CREATE INDEX idx_service_prices_variant ON service_prices (variant_id) WHERE variant_id IS NOT NULL;
CREATE INDEX idx_service_prices_location ON service_prices (location_id) WHERE location_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- service_locations: Which locations offer a service
-- ---------------------------------------------------------------------------
CREATE TABLE service_locations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id  UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (service_id, location_id)
);

CREATE INDEX idx_service_locations_location ON service_locations (location_id);
