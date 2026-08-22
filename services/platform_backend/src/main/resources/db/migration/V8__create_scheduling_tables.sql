-- V8: Scheduling tables (availability rules & booking holds)

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================
-- availability_rules
-- ============================================================
CREATE TABLE availability_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    staff_id        UUID NULL,
    resource_id     UUID NULL,
    location_id     UUID NOT NULL,
    day_of_week     INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (start_time < end_time)
);

CREATE INDEX idx_availability_rules_tenant_loc
    ON availability_rules (tenant_id, location_id);

CREATE INDEX idx_availability_rules_staff
    ON availability_rules (staff_id)
    WHERE staff_id IS NOT NULL;

CREATE INDEX idx_availability_rules_resource
    ON availability_rules (resource_id)
    WHERE resource_id IS NOT NULL;

-- ============================================================
-- booking_holds  (temporary pre-booking reservations)
-- ============================================================
CREATE TABLE booking_holds (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    location_id UUID NOT NULL,
    service_id  UUID NOT NULL,
    staff_id    UUID NULL,
    resource_id UUID NULL,
    customer_id UUID NOT NULL,
    starts_at   TIMESTAMPTZ NOT NULL,
    ends_at     TIMESTAMPTZ NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    status      VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
                CHECK (status IN ('ACTIVE','EXPIRED','CONFIRMED','RELEASED')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (starts_at < ends_at),
    CHECK (starts_at < expires_at)
);

CREATE INDEX idx_booking_holds_tenant_loc
    ON booking_holds (tenant_id, location_id, starts_at);

CREATE INDEX idx_booking_holds_expires
    ON booking_holds (expires_at)
    WHERE status = 'ACTIVE';

-- Anti-overlap exclusion constraint (same staff or resource at same location)
ALTER TABLE booking_holds
    ADD CONSTRAINT excl_booking_holds_staff_overlap
    EXCLUDE USING gist (
        location_id   WITH =,
        tstzrange(starts_at, ends_at) WITH &&
    )
    WHERE (staff_id IS NOT NULL);

ALTER TABLE booking_holds
    ADD CONSTRAINT excl_booking_holds_resource_overlap
    EXCLUDE USING gist (
        location_id   WITH =,
        tstzrange(starts_at, ends_at) WITH &&
    )
    WHERE (resource_id IS NOT NULL);
