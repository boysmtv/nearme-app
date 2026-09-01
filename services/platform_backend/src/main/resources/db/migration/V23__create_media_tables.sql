-- V23: Media & gallery + Staff portfolio + Review photos + Favorites
-- DEKAT Booking Platform - Bundle A

-- ============================================================
-- media_assets: gallery / portfolio / review photos
-- ============================================================
CREATE TABLE IF NOT EXISTS media_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    owner_type      VARCHAR(20) NOT NULL CHECK (owner_type IN ('provider','staff','review')),
    owner_id        UUID NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    content_type    VARCHAR(100) NOT NULL,
    file_size       BIGINT NOT NULL CHECK (file_size >= 0),
    storage_path    TEXT NOT NULL,
    url             TEXT NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    version         INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_media_assets_tenant ON media_assets (tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_owner ON media_assets (owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_created ON media_assets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_sort ON media_assets (tenant_id, owner_type, owner_id, sort_order);

-- ============================================================
-- customer_favorites: customer -> staff favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_favorites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    staff_id        UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (customer_id, staff_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer ON customer_favorites (customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_staff ON customer_favorites (staff_id);

-- ============================================================
-- review_photos: junction review <-> media_assets
-- ============================================================
CREATE TABLE IF NOT EXISTS review_photos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id       UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    media_asset_id  UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (review_id, media_asset_id)
);

CREATE INDEX IF NOT EXISTS idx_review_photos_review ON review_photos (review_id);
CREATE INDEX IF NOT EXISTS idx_review_photos_media ON review_photos (media_asset_id);

-- ============================================================
-- staff specialties tag (TEXT, comma-separated or JSON array)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'staff' AND column_name = 'specialties'
    ) THEN
        ALTER TABLE staff ADD COLUMN specialties TEXT;
    END IF;
END $$;

-- ============================================================
-- Add constraint index for provider media sort reorder support
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_media_assets_provider_sort ON media_assets(tenant_id, sort_order) WHERE owner_type='provider';
