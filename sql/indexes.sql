-- Composite index for the main query pattern (filter by to_address, order by received_at)
CREATE INDEX IF NOT EXISTS idx_emails_to_address_received_at ON emails (to_address, received_at DESC);

-- Individual indexes for other query patterns
CREATE INDEX IF NOT EXISTS idx_emails_to_address ON emails (to_address);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails (received_at DESC);

-- Index for filtering emails with attachments
CREATE INDEX IF NOT EXISTS idx_emails_has_attachments ON emails (has_attachments, received_at DESC);

-- Index for cleanup operations (delete old emails) - optimized for covering query
CREATE INDEX IF NOT EXISTS idx_emails_cleanup_covering ON emails (received_at, id) WHERE received_at IS NOT NULL;

-- Attachment indexes
CREATE INDEX IF NOT EXISTS idx_attachments_email_id ON attachments (email_id);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attachments_email_id_created_at ON attachments (email_id, created_at ASC);