-- Migration: Create business_stripe_accounts table
-- Description: Stores Stripe Connect account information for businesses

-- Create the business_stripe_accounts table
CREATE TABLE IF NOT EXISTS business_stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL UNIQUE,
  stripe_connect_account_id VARCHAR(255) NOT NULL,
  connected_at TIMESTAMPTZ,
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'restricted', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key constraint to businesses table
  CONSTRAINT fk_business_stripe_accounts_business
    FOREIGN KEY (business_id)
    REFERENCES businesses(id)
    ON DELETE CASCADE
);

-- Create index on stripe_connect_account_id for lookups
CREATE INDEX IF NOT EXISTS idx_business_stripe_accounts_stripe_id
  ON business_stripe_accounts(stripe_connect_account_id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_business_stripe_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS business_stripe_accounts_updated_at ON business_stripe_accounts;
CREATE TRIGGER business_stripe_accounts_updated_at
  BEFORE UPDATE ON business_stripe_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_business_stripe_accounts_updated_at();

-- Enable Row Level Security
ALTER TABLE business_stripe_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow service role full access (for API operations)
CREATE POLICY "Service role can manage all stripe accounts"
  ON business_stripe_accounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Allow authenticated users to read their own business's stripe account
CREATE POLICY "Users can view their own business stripe account"
  ON business_stripe_accounts
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT b.id FROM businesses b
      JOIN profiles p ON b.owner_id = p.id
      WHERE p.user_id = auth.uid()::text
    )
  );

-- Add comment to table for documentation
COMMENT ON TABLE business_stripe_accounts IS 'Stores Stripe Connect account information linked to businesses';
COMMENT ON COLUMN business_stripe_accounts.stripe_connect_account_id IS 'The Stripe Connect account ID (e.g., acct_xxx)';
COMMENT ON COLUMN business_stripe_accounts.status IS 'Account status: pending, active, restricted, or disabled';
