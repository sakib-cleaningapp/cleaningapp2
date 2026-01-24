-- Migration: Add useful columns that were missing from the original schema
-- Run this in Supabase SQL Editor

-- 1. Add refund tracking columns to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- 2. Add audit and review tracking to booking_requests table
ALTER TABLE booking_requests
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS review_submitted BOOLEAN DEFAULT FALSE;

-- 3. Create trigger to auto-update updated_at on booking_requests
CREATE OR REPLACE FUNCTION update_booking_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_requests_updated_at ON booking_requests;
CREATE TRIGGER booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_requests_updated_at();

-- Verify the columns were added
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('payments', 'booking_requests')
  AND column_name IN ('refunded_at', 'refund_amount', 'failure_reason', 'updated_at', 'review_submitted')
ORDER BY table_name, column_name;
