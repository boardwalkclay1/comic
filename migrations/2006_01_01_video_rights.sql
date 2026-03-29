-- Creators you distribute for
CREATE TABLE creators (
  id              UUID PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT,
  legal_name      TEXT,
  tax_id          TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Distribution agreements per creator
CREATE TABLE distribution_agreements (
  id                  UUID PRIMARY KEY,
  creator_id          UUID NOT NULL REFERENCES creators(id),
  agreement_number    TEXT NOT NULL,
  effective_date      DATE NOT NULL,
  expires_at          DATE,
  platform_rights     JSONB NOT NULL, -- e.g. { "youtube": true, "tiktok": true }
  can_create_derivatives BOOLEAN NOT NULL DEFAULT TRUE,
  can_fingerprint     BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_rights    BOOLEAN NOT NULL DEFAULT TRUE,
  royalty_split_creator NUMERIC(5,2) NOT NULL, -- e.g. 70.00
  royalty_split_platform NUMERIC(5,2) NOT NULL, -- e.g. 30.00
  signed_at           TIMESTAMP,
  signed_by_creator   TEXT,
  signed_by_platform  TEXT,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Assets (video comics, shorts, audio)
CREATE TABLE assets (
  id              UUID PRIMARY KEY,
  creator_id      UUID NOT NULL REFERENCES creators(id),
  agreement_id    UUID REFERENCES distribution_agreements(id),
  type            TEXT NOT NULL, -- 'video_full', 'video_short', 'audio'
  internal_code   TEXT NOT NULL, -- e.g. VC_0001_FULL
  title           TEXT NOT NULL,
  description     TEXT,
  duration_seconds INT,
  file_hash       TEXT,          -- for fingerprinting
  storage_path    TEXT NOT NULL, -- where the master file lives
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- External platform registrations (YouTube, TikTok, etc.)
CREATE TABLE asset_platform_registrations (
  id              UUID PRIMARY KEY,
  asset_id        UUID NOT NULL REFERENCES assets(id),
  platform        TEXT NOT NULL, -- 'youtube', 'tiktok', 'instagram', 'spotify'
  platform_asset_id TEXT NOT NULL, -- e.g. YouTube video ID
  url             TEXT,
  monetization_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  content_id_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Plays tracked by YOUR app / YOUR embeds
CREATE TABLE asset_plays (
  id              UUID PRIMARY KEY,
  asset_id        UUID NOT NULL REFERENCES assets(id),
  source          TEXT NOT NULL, -- 'app', 'web', 'embed'
  source_detail   TEXT,          -- domain, app version, etc.
  user_id         UUID,
  country         TEXT,
  device          TEXT,
  watch_seconds   INT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- External platform revenue reports (aggregated)
CREATE TABLE platform_revenue_reports (
  id              UUID PRIMARY KEY,
  asset_id        UUID NOT NULL REFERENCES assets(id),
  platform        TEXT NOT NULL,
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  total_plays     BIGINT NOT NULL,
  total_revenue_usd NUMERIC(12,4) NOT NULL,
  raw_payload     JSONB, -- store original API response if needed
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Royalty ledger (final math per period)
CREATE TABLE royalty_ledger (
  id                  UUID PRIMARY KEY,
  asset_id            UUID NOT NULL REFERENCES assets(id),
  period_start        DATE NOT NULL,
  period_end          DATE NOT NULL,
  source              TEXT NOT NULL, -- 'internal', 'youtube', 'tiktok', etc.
  total_plays         BIGINT NOT NULL,
  gross_revenue_usd   NUMERIC(12,4) NOT NULL,
  creator_share_usd   NUMERIC(12,4) NOT NULL,
  platform_share_usd  NUMERIC(12,4) NOT NULL,
  calculated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
