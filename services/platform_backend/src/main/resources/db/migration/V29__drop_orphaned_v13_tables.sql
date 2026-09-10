-- V29: Drop orphaned tables from V13 that have no JPA entities or code references

-- Review infrastructure (unused — review_reports, case_attachments)
DROP TABLE IF EXISTS review_reports CASCADE;
DROP TABLE IF EXISTS case_attachments CASCADE;

-- Coupon infrastructure (unused — coupon_rules, coupon_redemptions)
DROP TABLE IF EXISTS coupon_rules CASCADE;
DROP TABLE IF EXISTS coupon_redemptions CASCADE;

-- Loyalty (replaced by V27 loyalty_transactions)
DROP TABLE IF EXISTS loyalty_entries CASCADE;

-- Marketplace/search (unused — no entities or queries)
DROP TABLE IF EXISTS marketplace_profiles CASCADE;
DROP TABLE IF EXISTS booking_attributions CASCADE;
DROP TABLE IF EXISTS search_documents CASCADE;
DROP TABLE IF EXISTS sponsored_placements CASCADE;

-- Media (replaced by V23 media_assets)
DROP TABLE IF EXISTS media_objects CASCADE;

-- Idempotency (unused infrastructure)
DROP TABLE IF EXISTS idempotency_records CASCADE;
