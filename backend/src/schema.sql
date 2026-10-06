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

-- Apoio ao cliente: conversas com a IA de suporte, escalonadas para o dono quando necessario.
CREATE TABLE IF NOT EXISTS support_conversations (
  conversation_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(user_id) ON DELETE SET NULL,
  status           VARCHAR(20) DEFAULT 'ia', -- 'ia' | 'escalado' | 'resolvido'
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_messages (
  message_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID REFERENCES support_conversations(conversation_id) ON DELETE CASCADE,
  sender           VARCHAR(20) NOT NULL, -- 'cliente' | 'ia' | 'admin'
  content          TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- Modulo Pessoal — gestao financeira, saude e disciplina do dono, com gamificacao.
CREATE TABLE IF NOT EXISTS personal_config (
  key    VARCHAR(50) PRIMARY KEY,
  value  TEXT
);

CREATE TABLE IF NOT EXISTS personal_debts (
  debt_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description    TEXT NOT NULL,
  amount         NUMERIC NOT NULL,
  due_date       DATE,
  recurring      BOOLEAN DEFAULT false,
  recurring_day  SMALLINT, -- 0=domingo .. 6=sabado, so se recurring=true
  status         VARCHAR(20) DEFAULT 'pendente', -- 'pendente' | 'pago'
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal_savings_goals (
  goal_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  target_amount   NUMERIC NOT NULL,
  current_amount  NUMERIC DEFAULT 0,
  due_date        DATE,
  priority        SMALLINT DEFAULT 5, -- 1 = mais prioritaria
  status          VARCHAR(20) DEFAULT 'em_curso', -- 'em_curso' | 'concluida'
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal_daily_log (
  log_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date          DATE NOT NULL UNIQUE,
  meals_planned     SMALLINT DEFAULT 0,
  meals_completed   SMALLINT DEFAULT 0,
  workout_done      BOOLEAN DEFAULT false,
  weight_kg         NUMERIC,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal_expenses (
  expense_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category     VARCHAR(30) NOT NULL, -- 'alimentacao' | 'internet' | 'levantamento_empresa' | 'perfumes_saldo' | 'outro'
  description  TEXT,
  amount       NUMERIC NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS personal_missions (
  mission_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  due_date     DATE,
  type         VARCHAR(20) DEFAULT 'outro', -- 'divida' | 'meta' | 'treino' | 'estagio' | 'outro'
  related_id   UUID,
  status       VARCHAR(20) DEFAULT 'pendente', -- 'pendente' | 'concluida'
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Painel de controlo do construtor: só usado quando o cliente escolhe que a
-- D3NA publica o site por ele (em vez de ele publicar sozinho via Netlify).
ALTER TABLE site_builds ADD COLUMN IF NOT EXISTS panel_password_hash TEXT;
ALTER TABLE site_builds ADD COLUMN IF NOT EXISTS publish_status VARCHAR(20) DEFAULT 'nao_aplicavel';
ALTER TABLE site_builds ADD COLUMN IF NOT EXISTS site_url TEXT;

-- Programa de afiliados
CREATE TABLE IF NOT EXISTS affiliates (
  affiliate_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  referral_code     VARCHAR(20) UNIQUE NOT NULL,
  redotpay_id       TEXT,
  balance_aoa       NUMERIC(12,2) DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_affiliate_id UUID REFERENCES affiliates(affiliate_id);

CREATE TABLE IF NOT EXISTS affiliate_commissions (
  commission_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id      UUID REFERENCES affiliates(affiliate_id) ON DELETE CASCADE,
  referred_user_id  UUID REFERENCES users(user_id),
  source_type       VARCHAR(30) NOT NULL,
  amount_aoa        NUMERIC(12,2) NOT NULL,
  reference_id      UUID,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS affiliate_withdrawals (
  withdrawal_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id      UUID REFERENCES affiliates(affiliate_id) ON DELETE CASCADE,
  amount_aoa        NUMERIC(12,2) NOT NULL,
  status            VARCHAR(20) DEFAULT 'pendente',
  redotpay_id       TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  paid_at           TIMESTAMPTZ
);

ALTER TABLE site_builds ADD COLUMN IF NOT EXISTS affiliate_id UUID REFERENCES affiliates(affiliate_id);

ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS notifications_seen_at TIMESTAMPTZ DEFAULT now();

CREATE TABLE IF NOT EXISTS affiliate_notifications (
  notification_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id      UUID REFERENCES affiliates(affiliate_id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  message           TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ===== Curso guiado por IA =====
CREATE TABLE IF NOT EXISTS user_courses (
  course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  level VARCHAR(20),
  plan JSONB,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS course_lessons (
  lesson_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES user_courses(course_id) ON DELETE CASCADE,
  module_number INT,
  lesson_number INT,
  title TEXT,
  summary TEXT,
  video_id TEXT,
  video_minutes NUMERIC,
  extra_minutes NUMERIC,
  transcript TEXT,
  content_status VARCHAR(20) DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS lesson_points (
  point_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES course_lessons(lesson_id) ON DELETE CASCADE,
  position INT,
  kind VARCHAR(10) DEFAULT 'video',
  timestamp_sec INT,
  title TEXT,
  explanation_parts JSONB,
  check_question TEXT
);
CREATE TABLE IF NOT EXISTS user_point_progress (
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  point_id UUID REFERENCES lesson_points(point_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'bloqueado',
  attempts INT DEFAULT 0,
  last_answer TEXT,
  last_feedback TEXT,
  doubts JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, point_id)
);
CREATE TABLE IF NOT EXISTS lesson_tests (
  test_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(lesson_id) ON DELETE CASCADE,
  questions JSONB,
  answers JSONB,
  score NUMERIC,
  weak_points JSONB,
  homework_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS video_cache (
  topic_key TEXT PRIMARY KEY,
  video_id TEXT,
  title TEXT,
  minutes NUMERIC,
  has_captions BOOLEAN,
  transcript TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
