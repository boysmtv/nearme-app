-- V11: Notification templates, preferences, deliveries, device tokens

-- ============================================================
-- notification_templates
-- ============================================================
CREATE TABLE notification_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type      VARCHAR(64) NOT NULL,
    channel         VARCHAR(16) NOT NULL CHECK (channel IN ('EMAIL','SMS','PUSH','WHATSAPP','IN_APP')),
    locale          VARCHAR(10) NOT NULL DEFAULT 'id_ID',
    version         INT NOT NULL DEFAULT 1,
    subject_template VARCHAR(512),
    body_template   TEXT NOT NULL,
    variables       JSONB,
    status          VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','INACTIVE','DRAFT')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_notification_template_version
    ON notification_templates (event_type, channel, locale, version);

-- ============================================================
-- notification_preferences
-- ============================================================
CREATE TABLE notification_preferences (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL,
    channel           VARCHAR(16) NOT NULL CHECK (channel IN ('EMAIL','SMS','PUSH','WHATSAPP','IN_APP')),
    event_type        VARCHAR(64) NOT NULL,
    enabled           BOOLEAN NOT NULL DEFAULT true,
    quiet_hours_start TIME,
    quiet_hours_end   TIME,

    UNIQUE (user_id, channel, event_type)
);

CREATE INDEX idx_notif_pref_user ON notification_preferences (user_id);

-- ============================================================
-- notification_deliveries
-- ============================================================
CREATE TABLE notification_deliveries (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id      UUID NOT NULL,
    template_id       UUID NOT NULL REFERENCES notification_templates(id) ON DELETE RESTRICT,
    channel           VARCHAR(16) NOT NULL,
    subject           VARCHAR(512),
    body              TEXT NOT NULL,
    status            VARCHAR(32) NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING','SENT','DELIVERED','FAILED','BOUNCED')),
    provider_response TEXT,
    retry_count       INT NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    delivered_at      TIMESTAMPTZ
);

CREATE INDEX idx_notif_deliveries_recipient
    ON notification_deliveries (recipient_id, created_at);

CREATE INDEX idx_notif_deliveries_status
    ON notification_deliveries (status)
    WHERE status IN ('PENDING','FAILED');

-- ============================================================
-- device_tokens
-- ============================================================
CREATE TABLE device_tokens (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL,
    device_type   VARCHAR(16) NOT NULL CHECK (device_type IN ('ANDROID','IOS','WEB')),
    token         VARCHAR(512) NOT NULL,
    app_version   VARCHAR(16),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_device_token ON device_tokens (token);
CREATE INDEX idx_device_tokens_user ON device_tokens (user_id);
