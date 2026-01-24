-- Migration: Add response_message column to booking_requests table
-- Description: Stores the business owner's response message when accepting/declining bookings

ALTER TABLE booking_requests
ADD COLUMN IF NOT EXISTS response_message TEXT;

-- Add comment for documentation
COMMENT ON COLUMN booking_requests.response_message IS 'Business owner response message when accepting or declining a booking';
