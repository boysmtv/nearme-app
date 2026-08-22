-- =============================================================================
-- V6: Staff & Scheduling Tables
-- DEKAT Booking Platform
-- =============================================================================

-- ---------------------------------------------------------------------------
-- staff: Staff member profile (extends user within a tenant)
-- ---------------------------------------------------------------------------
CREATE TABLE staff (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    display_name    VARCHAR(255),
    title           VARCHAR(100),
    bio             TEXT,
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    version         INTEGER NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX uq_staff_user_tenant ON staff (user_id, tenant_id);
CREATE INDEX idx_staff_tenant ON staff (tenant_id);

-- ---------------------------------------------------------------------------
-- staff_locations: Which locations a staff member serves
-- ---------------------------------------------------------------------------
CREATE TABLE staff_locations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id    UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (staff_id, location_id)
);

CREATE INDEX idx_staff_locations_location ON staff_locations (location_id);

-- ---------------------------------------------------------------------------
-- staff_services: Which services a staff member can perform
-- ---------------------------------------------------------------------------
CREATE TABLE staff_services (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id    UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id  UUID NOT NULL,
    override_duration_minutes INTEGER,
    override_price            NUMERIC(10,2),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (staff_id, service_id)
);

CREATE INDEX idx_staff_services_service ON staff_services (service_id);

-- ---------------------------------------------------------------------------
-- resources: Bookable resources (rooms, equipment, vehicles, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_id     UUID REFERENCES locations(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    resource_type   VARCHAR(50) NOT NULL,
    capacity        INTEGER,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    version         INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_resources_tenant ON resources (tenant_id);
CREATE INDEX idx_resources_location ON resources (location_id);
CREATE INDEX idx_resources_type ON resources (resource_type);

-- ---------------------------------------------------------------------------
-- resource_services: Which services a resource supports
-- ---------------------------------------------------------------------------
CREATE TABLE resource_services (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    service_id  UUID NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (resource_id, service_id)
);

-- ---------------------------------------------------------------------------
-- staff_schedules: Recurring weekly availability
-- ---------------------------------------------------------------------------
CREATE TABLE staff_schedules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id        UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_staff_schedules_staff ON staff_schedules (staff_id);
CREATE INDEX idx_staff_schedules_day ON staff_schedules (day_of_week);

-- ---------------------------------------------------------------------------
-- time_off: Vacation / leave / unavailable periods
-- ---------------------------------------------------------------------------
CREATE TABLE time_off (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id    UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    title       VARCHAR(255),
    reason      TEXT,
    start_at    TIMESTAMPTZ NOT NULL,
    end_at      TIMESTAMPTZ NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_time_off_staff ON time_off (staff_id);
CREATE INDEX idx_time_off_period ON time_off (start_at, end_at);

-- ---------------------------------------------------------------------------
-- schedule_exceptions: One-off overrides to regular schedules
-- ---------------------------------------------------------------------------
CREATE TABLE schedule_exceptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id        UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    exception_date  DATE NOT NULL,
    start_time      TIME,
    end_time        TIME,
    is_unavailable  BOOLEAN NOT NULL DEFAULT FALSE,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_schedule_exceptions_staff ON schedule_exceptions (staff_id);
CREATE INDEX idx_schedule_exceptions_date ON schedule_exceptions (exception_date);
