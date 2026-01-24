-- Migration: Add reply/conversation support to messages table
-- Run this in Supabase SQL Editor

-- 1. Add conversation threading columns to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS conversation_id UUID,
ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES messages(id),
ADD COLUMN IF NOT EXISTS sender_type VARCHAR(20) DEFAULT 'customer' CHECK (sender_type IN ('customer', 'business')),
ADD COLUMN IF NOT EXISTS sender_business_id UUID;

-- 2. Create index for faster conversation lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON messages(parent_message_id);

-- 3. Create a function to auto-set conversation_id for new messages
-- If no parent, use the message's own ID as the conversation ID
CREATE OR REPLACE FUNCTION set_message_conversation_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_message_id IS NOT NULL THEN
    -- Get the conversation_id from the parent message
    SELECT conversation_id INTO NEW.conversation_id
    FROM messages
    WHERE id = NEW.parent_message_id;
  ELSE
    -- This is a new conversation, use the message's own ID
    NEW.conversation_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_message_conversation_id_trigger ON messages;
CREATE TRIGGER set_message_conversation_id_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_conversation_id();

-- 4. Update existing messages to have conversation_id = id (each is its own conversation)
UPDATE messages
SET conversation_id = id, sender_type = 'customer'
WHERE conversation_id IS NULL;

-- 5. Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
