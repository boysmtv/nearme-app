-- V26: Chat conversations & messages
-- Bundle C - 3 Realtime & chat

CREATE TABLE IF NOT EXISTS conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
    tenant_id   UUID NOT NULL,
    customer_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    subject     TEXT,
    status      VARCHAR(32) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED','ARCHIVED')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_provider ON conversations(provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_booking ON conversations(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL,
    sender_role     VARCHAR(32) NOT NULL CHECK (sender_role IN ('CUSTOMER','PROVIDER','STAFF','ADMIN','SYSTEM')),
    body            TEXT NOT NULL,
    message_type    VARCHAR(32) NOT NULL DEFAULT 'TEXT' CHECK (message_type IN ('TEXT','IMAGE','FILE','SYSTEM')),
    attachment_url  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
