CREATE INDEX IF NOT EXISTS idx_emails_to_address ON emails (to_address);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails (received_at DESC);