-- V28: Tenant owner, chat admin, social feed, referrals

-- Add owner_id to tenants table for provider registration ownership
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS owner_id UUID;
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON tenants(owner_id);

-- Social posts
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    image_url VARCHAR(500),
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_customer ON social_posts(customer_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);

-- Social likes
CREATE TABLE IF NOT EXISTS social_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_social_like UNIQUE (post_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_social_likes_post ON social_likes(post_id);

-- Social follows
CREATE TABLE IF NOT EXISTS social_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_social_follow UNIQUE (customer_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_social_follows_provider ON social_follows(provider_id);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL UNIQUE,
    total_referred INT NOT NULL DEFAULT 0,
    total_earnings INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_referral_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

-- Referral redemptions
CREATE TABLE IF NOT EXISTS referral_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_amount INT NOT NULL DEFAULT 20000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_redemptions_referrer ON referral_redemptions(referrer_id);
