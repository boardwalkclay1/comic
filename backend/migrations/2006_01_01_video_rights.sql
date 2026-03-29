CREATE TABLE creators (
  id              UUID PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT,
  legal_name      TEXT,
  tax_id          TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE distribution_agreements (
  id                      UUID PRIMARY KEY,
  creator_id              UUID NOT NULL REFERENCES creators(id),
  agreement_number        TEXT NOT NULL,
  effective_date          DATE NOT NULL,
  expires_at              DATE,
  platform_rights         JSONB NOT NULL,
  can_create_derivatives  BOOLEAN NOT NULL DEFAULT TRUE,
  can_fingerprint         BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_rights        BOOLEAN NOT NULL DEFAULT TRUE,
  royalty_split_creator   NUMERIC(5,2) NOT NULL,
  royalty_split_platform  NUMERIC(5,2) NOT NULL,
  signed_at               TIMESTAMP,
  signed_by_creator       TEXT,
  signed_by_platform      TEXT,
  created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE assets (
  id               UUID PRIMARY KEY,
  creator_id       UUID NOT NULL REFERENCES creators(id),
  agreement_id     UUID REFERENCES distribution_agreements(id),
  type             TEXT NOT NULL,
  internal_code    TEXT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  duration_seconds INT,
  file_hash        TEXT,
  storage_path     TEXT NOT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_platform_registrations (
  id                 UUID PRIMARY KEY,
  asset_id           UUID NOT NULL REFERENCES assets(id),
  platform           TEXT NOT NULL,
  platform_asset_id  TEXT NOT NULL,
  url                TEXT,
  monetization_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  content_id_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_plays (
  id              UUID PRIMARY KEY,
  asset_id        UUID NOT NULL REFERENCES assets(id),
  source          TEXT NOT NULL,
  source_detail   TEXT,
  user_id         UUID,
  country         TEXT,
  device          TEXT,
  watch_seconds   INT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_revenue_reports (
  id                 UUID PRIMARY KEY,
  asset_id           UUID NOT NULL REFERENCES assets(id),
  platform           TEXT NOT NULL,
  period_start       DATE NOT NULL,
  period_end         DATE NOT NULL,
  total_plays        BIGINT NOT NULL,
  total_revenue_usd  NUMERIC(12,4) NOT NULL,
  raw_payload        JSONB,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE royalty_ledger (
  id                  UUID PRIMARY KEY,
  asset_id            UUID NOT NULL REFERENCES assets(id),
  period_start        DATE NOT NULL,
  period_end          DATE NOT NULL,
  source              TEXT NOT NULL,
  total_plays         BIGINT NOT NULL,
  gross_revenue_usd   NUMERIC(12,4) NOT NULL,
  creator_share_usd   NUMERIC(12,4) NOT NULL,
  platform_share_usd  NUMERIC(12,4) NOT NULL,
  calculated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
