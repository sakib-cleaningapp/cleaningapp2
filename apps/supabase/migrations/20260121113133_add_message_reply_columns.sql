-- Migration: Add reply columns to messages table
-- Description: Adds conversation threading support to messages

-- Add new columns for message threading
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS conversation_id UUID,
ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES messages(id),
ADD COLUMN IF NOT EXISTS sender_type VARCHAR(20) DEFAULT 'customer' CHECK (sender_type IN ('customer', 'business')),
ADD COLUMN IF NOT EXISTS sender_business_id UUID;

-- Create indexes for better query performance on conversation lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON messages(parent_message_id);

-- Create function to auto-set conversation_id on new messages
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

-- Create trigger to auto-set conversation_id
DROP TRIGGER IF EXISTS set_message_conversation_id_trigger ON messages;
CREATE TRIGGER set_message_conversation_id_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_conversation_id();

-- Update existing messages to have conversation_id and sender_type set
UPDATE messages
SET
  conversation_id = id,
  sender_type = 'customer'
WHERE conversation_id IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN messages.conversation_id IS 'Groups messages into conversations - initially set to message id for root messages';
COMMENT ON COLUMN messages.parent_message_id IS 'References parent message for replies, NULL for root messages';
COMMENT ON COLUMN messages.sender_type IS 'Indicates if message was sent by customer or business';
COMMENT ON COLUMN messages.sender_business_id IS 'Business ID when sender_type is business';
