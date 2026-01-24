-- Add refund and cancellation tracking to booking_requests table
-- This migration adds columns for:
-- 1. Refund status tracking (pending, processed, failed)
-- 2. Stripe refund ID for reference
-- 3. Cancellation reason
-- 4. Who initiated the cancellation (customer or business)

ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20);
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20);

-- Add comment for documentation
COMMENT ON COLUMN booking_requests.refund_status IS 'Refund status: pending, processed, failed, or null if not applicable';
COMMENT ON COLUMN booking_requests.refund_id IS 'Stripe refund ID (re_xxx) for reference';
COMMENT ON COLUMN booking_requests.cancellation_reason IS 'Reason provided for cancellation';
COMMENT ON COLUMN booking_requests.cancelled_by IS 'Who cancelled: customer or business';
