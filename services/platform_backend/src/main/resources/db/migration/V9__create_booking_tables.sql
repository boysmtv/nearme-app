-- V9: Core booking tables

-- ============================================================
-- bookings
-- ============================================================
CREATE TABLE bookings (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL,
    location_id          UUID NOT NULL,
    customer_id          UUID NOT NULL,
    booking_code         VARCHAR(32) NOT NULL,
    status               VARCHAR(32) NOT NULL DEFAULT 'DRAFT'
                         CHECK (status IN (
                             'DRAFT','PENDING','HELD','CONFIRMED',
                             'CHECKED_IN','IN_PROGRESS','COMPLETED',
                             'CANCELLED','NO_SHOW','REFUNDED'
                         )),
    service_mode         VARCHAR(16) NOT NULL DEFAULT 'IN_PERSON'
                         CHECK (service_mode IN ('IN_PERSON','REMOTE','HYBRID')),
    starts_at            TIMESTAMPTZ NOT NULL,
    ends_at              TIMESTAMPTZ NOT NULL,
    timezone             VARCHAR(64) NOT NULL DEFAULT 'UTC',
    currency             VARCHAR(3) NOT NULL DEFAULT 'IDR',
    subtotal             INT NOT NULL DEFAULT 0,
    discount             INT NOT NULL DEFAULT 0,
    tax                  INT NOT NULL DEFAULT 0,
    fee                  INT NOT NULL DEFAULT 0,
    deposit              INT NOT NULL DEFAULT 0,
    total                INT NOT NULL DEFAULT 0,
    policy_snapshot      JSONB,
    source               VARCHAR(32) DEFAULT 'DIRECT'
                         CHECK (source IN ('DIRECT','WEB','MOBILE','PHONE','WALK_IN','MARKETPLACE')),
    campaign_id          UUID NULL,
    referrer_tenant_id   UUID NULL,
    version              INT NOT NULL DEFAULT 1,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at         TIMESTAMPTZ,
    completed_at         TIMESTAMPTZ,
    cancelled_at         TIMESTAMPTZ,

    CHECK (starts_at < ends_at),
    CHECK (total = subtotal - discount + tax + fee)
);

CREATE UNIQUE INDEX uq_booking_code_per_tenant
    ON bookings (tenant_id, booking_code);

CREATE INDEX idx_bookings_tenant_loc_starts
    ON bookings (tenant_id, location_id, starts_at);

CREATE INDEX idx_bookings_status
    ON bookings (status);

CREATE INDEX idx_bookings_customer
    ON bookings (customer_id);

-- ============================================================
-- booking_items
-- ============================================================
CREATE TABLE booking_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id  UUID NOT NULL,
    staff_id    UUID NULL,
    resource_id UUID NULL,
    starts_at   TIMESTAMPTZ NOT NULL,
    ends_at     TIMESTAMPTZ NOT NULL,
    price       INT NOT NULL DEFAULT 0,
    discount    INT NOT NULL DEFAULT 0,
    tax         INT NOT NULL DEFAULT 0,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (starts_at < ends_at)
);

CREATE INDEX idx_booking_items_booking ON booking_items (booking_id);

-- ============================================================
-- booking_addons
-- ============================================================
CREATE TABLE booking_addons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_item_id UUID NOT NULL REFERENCES booking_items(id) ON DELETE CASCADE,
    addon_id        UUID NOT NULL,
    name            VARCHAR(255) NOT NULL,
    quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price      INT NOT NULL DEFAULT 0,
    total_price     INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_addons_item ON booking_addons (booking_item_id);

-- ============================================================
-- booking_assignments (staff ↔ booking_item, with anti-overlap)
-- ============================================================
CREATE TABLE booking_assignments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id       UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    booking_item_id  UUID NULL REFERENCES booking_items(id) ON DELETE SET NULL,
    staff_id         UUID NOT NULL,
    starts_at        TIMESTAMPTZ NOT NULL,
    ends_at          TIMESTAMPTZ NOT NULL,
    status           VARCHAR(32) NOT NULL DEFAULT 'ASSIGNED'
                     CHECK (status IN ('ASSIGNED','ACCEPTED','DECLINED','COMPLETED')),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (starts_at < ends_at)
);

CREATE INDEX idx_booking_assignments_staff ON booking_assignments (staff_id, starts_at);
CREATE INDEX idx_booking_assignments_booking ON booking_assignments (booking_id);

-- Staff anti-overlap exclusion
ALTER TABLE booking_assignments
    ADD CONSTRAINT excl_booking_assignments_staff_overlap
    EXCLUDE USING gist (
        staff_id WITH =,
        tstzrange(starts_at, ends_at) WITH &&
    );

-- ============================================================
-- booking_status_history
-- ============================================================
CREATE TABLE booking_status_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    old_status  VARCHAR(32),
    new_status  VARCHAR(32) NOT NULL,
    changed_by  UUID NULL,
    reason      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_status_history_booking
    ON booking_status_history (booking_id, created_at);

-- ============================================================
-- booking_notes
-- ============================================================
CREATE TABLE booking_notes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    author_id   UUID NULL,
    visibility  VARCHAR(16) NOT NULL DEFAULT 'INTERNAL'
                CHECK (visibility IN ('INTERNAL','PUBLIC')),
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_notes_booking ON booking_notes (booking_id, created_at);
