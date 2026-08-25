-- V17: Drop ghost columns created by previous hibernate ddl-auto runs + align hold status CHECK

ALTER TABLE booking_status_history DROP COLUMN IF EXISTS to_status;
ALTER TABLE booking_status_history DROP COLUMN IF EXISTS metadata;

ALTER TABLE booking_holds DROP CONSTRAINT IF EXISTS booking_holds_status_check;
ALTER TABLE booking_holds ADD CONSTRAINT booking_holds_status_check
    CHECK (status IN ('ACTIVE','EXPIRED','CONFIRMED','RELEASED','CONVERTED','CANCELLED'));
