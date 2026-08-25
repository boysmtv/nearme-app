-- V13: Reviews, support, audit, feature flags, config, media,
--       idempotency, outbox, marketplace, attributions, search,
--       sponsored placements, coupons, campaigns, loyalty

-- ============================================================
-- reviews
-- ============================================================
CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    tenant_id   UUID NOT NULL,
    customer_id UUID NOT NULL,
    rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(255),
    body        TEXT,
    status      VARCHAR(16) NOT NULL DEFAULT 'PUBLISHED'
                CHECK (status IN ('PUBLISHED','HIDDEN','PENDING')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_tenant ON reviews (tenant_id, created_at);
CREATE INDEX idx_reviews_booking ON reviews (booking_id);

-- ============================================================
-- review_responses
-- ============================================================
CREATE TABLE review_responses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL,
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_resp_review ON review_responses (review_id);

-- ============================================================
-- review_reports
-- ============================================================
CREATE TABLE review_reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id   UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL,
    reason      VARCHAR(64) NOT NULL,
    note        TEXT,
    status      VARCHAR(16) NOT NULL DEFAULT 'OPEN'
                CHECK (status IN ('OPEN','REVIEWED','DISMISSED')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_review_reports_status ON review_reports (status);

-- ============================================================
-- support_cases
-- ============================================================
CREATE TABLE support_cases (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL,
    customer_id UUID NOT NULL,
    subject     VARCHAR(512) NOT NULL,
    status      VARCHAR(32) NOT NULL DEFAULT 'OPEN'
                CHECK (status IN ('OPEN','IN_PROGRESS','WAITING','RESOLVED','CLOSED')),
    priority    VARCHAR(16) NOT NULL DEFAULT 'MEDIUM'
                CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
    assigned_to UUID NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_cases_tenant ON support_cases (tenant_id, status);
CREATE INDEX idx_support_cases_assigned ON support_cases (assigned_to)
    WHERE assigned_to IS NOT NULL;

-- ============================================================
-- case_events
-- ============================================================
CREATE TABLE case_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID NOT NULL REFERENCES support_cases(id) ON DELETE CASCADE,
    actor_id    UUID NULL,
    event_type  VARCHAR(32) NOT NULL,
    body        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_events_case ON case_events (case_id, created_at);

-- ============================================================
-- case_attachments
-- ============================================================
CREATE TABLE case_attachments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID NOT NULL REFERENCES support_cases(id) ON DELETE CASCADE,
    media_id    UUID NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_attachments_case ON case_attachments (case_id);

-- ============================================================
-- audit_logs
-- ============================================================
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID,
    action          VARCHAR(128) NOT NULL,
    resource_type   VARCHAR(64) NOT NULL,
    resource_id     UUID,
    before_snapshot JSONB,
    after_snapshot  JSONB,
    reason          TEXT,
    request_id      VARCHAR(128),
    ip_address      INET,
    user_agent      TEXT,
    result          VARCHAR(16) NOT NULL DEFAULT 'OK'
                    CHECK (result IN ('OK','DENIED','ERROR')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_id, created_at);
CREATE INDEX idx_audit_logs_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at);

-- ============================================================
-- feature_flags
-- ============================================================
CREATE TABLE feature_flags (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name               VARCHAR(128) NOT NULL,
    description        TEXT,
    enabled            BOOLEAN NOT NULL DEFAULT false,
    target_environment VARCHAR(32) DEFAULT 'ALL'
                       CHECK (target_environment IN ('ALL','DEV','STAGING','PRODUCTION')),
    target_tenant_id   UUID,
    percentage         INT NOT NULL DEFAULT 100 CHECK (percentage BETWEEN 0 AND 100),
    owner_id           UUID NOT NULL,
    expires_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_feature_flag_name ON feature_flags (name);
CREATE INDEX idx_feature_flags_enabled ON feature_flags (enabled) WHERE enabled;

-- ============================================================
-- config_versions
-- ============================================================
CREATE TABLE config_versions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key   VARCHAR(255) NOT NULL,
    config_value JSONB NOT NULL,
    version      INT NOT NULL DEFAULT 1,
    created_by   UUID NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_config_versions_key ON config_versions (config_key, version DESC);

-- ============================================================
-- media_objects
-- ============================================================
CREATE TABLE media_objects (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type   VARCHAR(64) NOT NULL,
    owner_id     UUID NOT NULL,
    file_name    VARCHAR(512) NOT NULL,
    mime_type    VARCHAR(128) NOT NULL,
    file_size    BIGINT NOT NULL CHECK (file_size >= 0),
    storage_key  VARCHAR(1024) NOT NULL,
    status       VARCHAR(16) NOT NULL DEFAULT 'READY'
                 CHECK (status IN ('UPLOADING','READY','DELETED')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_media_storage_key ON media_objects (storage_key);
CREATE INDEX idx_media_owner ON media_objects (owner_type, owner_id);

-- ============================================================
-- idempotency_records
-- ============================================================
CREATE TABLE idempotency_records (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key   VARCHAR(255) NOT NULL,
    actor_id          UUID NOT NULL,
    response_body     JSONB,
    status_code       INT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_idempotency_key ON idempotency_records (idempotency_key);

-- ============================================================
-- outbox_events (transactional outbox pattern)
-- ============================================================
CREATE TABLE IF NOT EXISTS outbox_events (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id  UUID NOT NULL,
    event_type    VARCHAR(128) NOT NULL,
    payload       JSONB NOT NULL,
    status        VARCHAR(16) NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','PUBLISHED','FAILED')),
    available_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox_events (available_at)
    WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox_events (aggregate_type, aggregate_id);

-- ============================================================
-- consumer_inbox (exactly-once consumer dedup)
-- ============================================================
CREATE TABLE consumer_inbox (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_name VARCHAR(128) NOT NULL,
    event_id      VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_consumer_inbox_event
    ON consumer_inbox (consumer_name, event_id);

-- ============================================================
-- marketplace_profiles
-- ============================================================
CREATE TABLE marketplace_profiles (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    search_document  tsvector,
    ranking_score    DECIMAL(10,4) DEFAULT 0.0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_marketplace_tenant ON marketplace_profiles (tenant_id);
CREATE INDEX idx_marketplace_search ON marketplace_profiles USING GIN (search_document);
CREATE INDEX idx_marketplace_ranking ON marketplace_profiles (ranking_score DESC);

-- ============================================================
-- booking_attributions
-- ============================================================
CREATE TABLE booking_attributions (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id         UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    source             VARCHAR(32) NOT NULL
                       CHECK (source IN ('DIRECT','ORGANIC','PAID','REFERRAL','SOCIAL')),
    campaign_id        UUID NULL,
    referrer_tenant_id UUID NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_attr_booking ON booking_attributions (booking_id);
CREATE INDEX idx_booking_attr_campaign ON booking_attributions (campaign_id)
    WHERE campaign_id IS NOT NULL;

-- ============================================================
-- search_documents (full-text search index)
-- ============================================================
CREATE TABLE search_documents (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_type     VARCHAR(64) NOT NULL,
    owner_id       UUID NOT NULL,
    title          VARCHAR(512) NOT NULL,
    body           TEXT,
    tags           TEXT[],
    search_vector  tsvector,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_docs_vector ON search_documents USING GIN (search_vector);
CREATE INDEX idx_search_docs_owner ON search_documents (owner_type, owner_id);

-- ============================================================
-- sponsored_placements
-- ============================================================
CREATE TABLE sponsored_placements (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID NOT NULL,
    placement_type VARCHAR(32) NOT NULL
                   CHECK (placement_type IN ('BANNER','FEATURED','TOP_LIST','HOMEPAGE')),
    title         VARCHAR(255) NOT NULL,
    image_url     TEXT,
    target_url    TEXT,
    weight        INT NOT NULL DEFAULT 1 CHECK (weight > 0),
    starts_at     TIMESTAMPTZ NOT NULL,
    ends_at       TIMESTAMPTZ NOT NULL,
    status        VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
                  CHECK (status IN ('ACTIVE','PAUSED','EXPIRED')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (starts_at < ends_at)
);

CREATE INDEX idx_sponsored_active ON sponsored_placements (starts_at, ends_at)
    WHERE status = 'ACTIVE';

-- ============================================================
-- coupons
-- ============================================================
CREATE TABLE coupons (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID NOT NULL,
    code          VARCHAR(64) NOT NULL,
    description   TEXT,
    discount_type VARCHAR(16) NOT NULL CHECK (discount_type IN ('PERCENTAGE','FIXED')),
    discount_value INT NOT NULL CHECK (discount_value > 0),
    max_uses      INT,
    used_count    INT NOT NULL DEFAULT 0,
    min_order     INT DEFAULT 0,
    starts_at     TIMESTAMPTZ,
    expires_at    TIMESTAMPTZ,
    status        VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
                  CHECK (status IN ('ACTIVE','INACTIVE','EXPIRED')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_coupon_code_tenant ON coupons (tenant_id, code);

-- ============================================================
-- coupon_rules
-- ============================================================
CREATE TABLE coupon_rules (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    rule_type   VARCHAR(32) NOT NULL CHECK (rule_type IN ('SERVICE','CATEGORY','MIN_ITEMS','DAY_OF_WEEK')),
    rule_value  JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupon_rules_coupon ON coupon_rules (coupon_id);

-- ============================================================
-- coupon_redemptions
-- ============================================================
CREATE TABLE coupon_redemptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id   UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    discount_applied INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_coupon_booking ON coupon_redemptions (coupon_id, booking_id);
CREATE INDEX idx_coupon_redemptions_customer ON coupon_redemptions (customer_id);

-- ============================================================
-- campaigns
-- ============================================================
CREATE TABLE campaigns (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL,
    name         VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(32) NOT NULL CHECK (campaign_type IN ('PROMO','REFERRAL','LOYALTY','EMAIL')),
    config       JSONB,
    status       VARCHAR(16) NOT NULL DEFAULT 'DRAFT'
                 CHECK (status IN ('DRAFT','ACTIVE','PAUSED','ENDED')),
    starts_at    TIMESTAMPTZ,
    ends_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_tenant ON campaigns (tenant_id, status);

-- ============================================================
-- loyalty_entries
-- ============================================================
CREATE TABLE loyalty_entries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL,
    customer_id  UUID NOT NULL,
    booking_id   UUID NULL REFERENCES bookings(id) ON DELETE SET NULL,
    entry_type   VARCHAR(32) NOT NULL CHECK (entry_type IN ('EARN','REDEEM','EXPIRE','ADJUST')),
    points       INT NOT NULL,
    balance_after INT NOT NULL,
    description  TEXT,
    expires_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_loyalty_customer ON loyalty_entries (tenant_id, customer_id, created_at DESC);
CREATE INDEX idx_loyalty_booking ON loyalty_entries (booking_id)
    WHERE booking_id IS NOT NULL;
