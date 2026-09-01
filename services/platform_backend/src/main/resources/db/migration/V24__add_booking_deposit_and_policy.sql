-- V24: Deposit & pembatalan + reschedule policy for bookings
-- Bundle B - Task 7

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount INT NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_deadline TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reschedule_count INT NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS max_reschedule INT NOT NULL DEFAULT 1;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancel_policy TEXT;

-- seed existing confirmed bookings with 24h deadline for demo
UPDATE bookings SET cancel_deadline = starts_at - INTERVAL '24 hours' WHERE cancel_deadline IS NULL AND starts_at IS NOT NULL;
UPDATE bookings SET cancel_policy = '24h_full_refund' WHERE cancel_policy IS NULL;

-- index for deadline queries (reminder scheduler)
CREATE INDEX IF NOT EXISTS idx_bookings_cancel_deadline ON bookings(cancel_deadline);
CREATE INDEX IF NOT EXISTS idx_bookings_starts_at ON bookings(starts_at);
