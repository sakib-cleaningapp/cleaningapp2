-- =============================================================================
-- Supabase Migration: Add Reply Columns to Messages Table
-- =============================================================================
-- Run this SQL in the Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/bpdehoxivkvrxpxniwjp/sql
-- =============================================================================

-- Step 1: Add new columns for message threading
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS conversation_id UUID,
ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES messages(id),
ADD COLUMN IF NOT EXISTS sender_type VARCHAR(20) DEFAULT 'customer' CHECK (sender_type IN ('customer', 'business')),
ADD COLUMN IF NOT EXISTS sender_business_id UUID;

-- Step 2: Create indexes for better query performance on conversation lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON messages(parent_message_id);

-- Step 3: Create function to auto-set conversation_id on new messages
CREATE OR REPLACE FUNCTION set_message_conversation_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a reply, inherit the conversation_id from parent
  IF NEW.parent_message_id IS NOT NULL THEN
    SELECT conversation_id INTO NEW.conversation_id
    FROM messages WHERE id = NEW.parent_message_id;
  ELSE
    -- New conversation starts with this message
    NEW.conversation_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to auto-set conversation_id
DROP TRIGGER IF EXISTS set_message_conversation_id_trigger ON messages;
CREATE TRIGGER set_message_conversation_id_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_conversation_id();

-- Step 5: Update existing messages to have conversation_id and sender_type set
UPDATE messages
SET
  conversation_id = id,
  sender_type = 'customer'
WHERE conversation_id IS NULL;

-- Step 6: Verify the migration
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'messages'
  AND column_name IN ('conversation_id', 'parent_message_id', 'sender_type', 'sender_business_id')
ORDER BY column_name;

-- =============================================================================
-- Column descriptions for documentation:
-- - conversation_id: Groups messages into conversations (root message ID)
-- - parent_message_id: References parent message for replies, NULL for root messages
-- - sender_type: 'customer' or 'business' - indicates who sent the message
-- - sender_business_id: Business ID when sender_type is 'business'
-- =============================================================================
