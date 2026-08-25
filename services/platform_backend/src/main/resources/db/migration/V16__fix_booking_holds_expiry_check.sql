-- V16: Relax booking_holds expiry CHECK to allow holding future slots

ALTER TABLE booking_holds DROP CONSTRAINT IF EXISTS booking_holds_check1;
ALTER TABLE booking_holds DROP CONSTRAINT IF EXISTS booking_holds_check2;
ALTER TABLE booking_holds ADD CONSTRAINT booking_holds_expires_after_creation CHECK (expires_at > created_at);
