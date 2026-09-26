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

CREATE TABLE IF NOT EXISTS supplier_search_log (
  log_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(user_id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS site_builds (
  build_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_category    VARCHAR(30),
  business_type        VARCHAR(60),
  color_scheme         VARCHAR(20),
  structure_choice     INTEGER,
  style_choice         INTEGER,
  domain_choice        VARCHAR(20) DEFAULT 'blogger',
  tier                 VARCHAR(10) DEFAULT 'basico',
  company_name         TEXT,
  company_description  TEXT,
  contact_info         TEXT,
  amount               NUMERIC DEFAULT 1500.00,
  currency             VARCHAR(3) DEFAULT 'AOA',
  payment_reference    VARCHAR(30),
  payment_status       VARCHAR(20) DEFAULT 'pendente',
  created_at           TIMESTAMPTZ DEFAULT now(),
  confirmed_at         TIMESTAMPTZ
);

ALTER TABLE site_builds ADD COLUMN IF NOT EXISTS contact_links TEXT;
ALTER TABLE site_builds ADD COLUMN IF NOT EXISTS logo_choice INTEGER;
ALTER TABLE site_builds ADD COLUMN IF NOT EXISTS catalog_items TEXT;
ALTER TABLE site_builds ADD COLUMN IF NOT EXISTS gallery_items TEXT;
ALTER TABLE site_builds ADD COLUMN IF NOT EXISTS font_choice VARCHAR(20) DEFAULT 'sistema';

-- Curso (inscrição semanal, mesmo modelo de subscriptions)
CREATE TABLE IF NOT EXISTS course_enrollments (
  enrollment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(user_id) ON DELETE CASCADE,
  course_name          TEXT,
  amount                NUMERIC DEFAULT 0,
  currency                VARCHAR(3) DEFAULT 'AOA',
  payment_method            VARCHAR(20) DEFAULT 'refx_facipay',
  payment_reference           VARCHAR(30),
  payment_status                 VARCHAR(20) DEFAULT 'pendente',
  started_at                       TIMESTAMPTZ,
  expires_at                         TIMESTAMPTZ,
  created_at                           TIMESTAMPTZ DEFAULT now()
);

-- Avaliacoes de qualidade (obrigatoria pos-compra)
CREATE TABLE IF NOT EXISTS reviews (
  review_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(user_id) ON DELETE CASCADE,
  service_type  VARCHAR(20) NOT NULL, -- 'construtor' | 'consultoria' | 'curso' | 'afiliado'
  reference_id  UUID, -- build_id, subscription_id, enrollment_id, etc (sem FK fixa, tipo varia)
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Registo em sistema informativo (log de acoes/eventos)
CREATE TABLE IF NOT EXISTS activity_log (
  log_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(user_id) ON DELETE SET NULL,
  event_type  VARCHAR(50) NOT NULL, -- 'pagamento_confirmado' | 'conta_criada' | 'site_entregue' | etc
  details     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Liga sites construidos ao utilizador dono
ALTER TABLE site_builds ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(user_id) ON DELETE SET NULL;
