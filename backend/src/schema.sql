CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  user_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number        VARCHAR(20) UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  phone_verified       BOOLEAN DEFAULT FALSE,
  otp_code_hash         TEXT,
  otp_expires_at          TIMESTAMPTZ,
  ad_views_count           INTEGER DEFAULT 0,
  ad_credits                 INTEGER DEFAULT 0,
  subscription_status  VARCHAR(20) DEFAULT 'inativo',
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  project_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(user_id) ON DELETE CASCADE,
  name         TEXT,
  category     VARCHAR(30),
  objective    TEXT,
  status       VARCHAR(20) DEFAULT 'em_curso',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_memory (
  project_id           UUID PRIMARY KEY REFERENCES projects(project_id) ON DELETE CASCADE,
  confirmed_facts       JSONB DEFAULT '{}',
  user_estimates         JSONB DEFAULT '{}',
  unknown_information     JSONB DEFAULT '[]',
  previous_decisions       JSONB DEFAULT '[]',
  identified_risks           JSONB DEFAULT '[]',
  recommended_actions          JSONB DEFAULT '[]',
  key_numbers                    JSONB DEFAULT '{}',
  updated_at                       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  message_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  role         VARCHAR(10),
  content      TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analyses (
  analysis_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  decision_type  VARCHAR(30),
  status         VARCHAR(20),
  report         JSONB,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS ad_views_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ad_credits INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS subscriptions (
  subscription_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(user_id) ON DELETE CASCADE,
  plan_name             VARCHAR(30) DEFAULT 'consultoria_semanal',
  amount                  NUMERIC DEFAULT 600.00,
  currency                  VARCHAR(3) DEFAULT 'AOA',
  payment_method              VARCHAR(20) DEFAULT 'refx_facipay',
  payment_reference             VARCHAR(30),
  payment_status                  VARCHAR(20) DEFAULT 'pendente',
  started_at                        TIMESTAMPTZ,
  expires_at                          TIMESTAMPTZ,
  created_at                            TIMESTAMPTZ DEFAULT now()
);
