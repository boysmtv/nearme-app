-- =============================================================================
-- V1: Enable PostgreSQL Extensions
-- DEKAT Booking Platform
-- =============================================================================

-- GiST index support for range types (used in scheduling)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Cryptographic functions (gen_random_uuid, etc.)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PostGIS geospatial support (geometry, ST_Distance, etc.)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Trigram similarity for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Remove accents/diacritics from text (useful for search in Bahasa)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- UUID generation functions (uuid_generate_v4, etc.)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
