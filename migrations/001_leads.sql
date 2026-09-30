-- Demo-form leads. Idempotent: the API runs this on its first request if the table is missing.
-- Only a SHA-256 hash of the client IP is stored, never the raw address.
-- Statements are separated by semicolons at line ends (the API splits on them).
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  kitchen text NOT NULL,
  city text NOT NULL,
  meals text NOT NULL,
  current_tool text,
  consent boolean NOT NULL,
  source text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'new',
  user_agent text,
  ip_hash text
);

-- Rate limit lookup: submissions per phone in the last 24h.
CREATE INDEX IF NOT EXISTS leads_phone_created_at_idx ON leads (phone, created_at DESC);
