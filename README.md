# Consultor Digital Inteligente — Código-fonte

Implementação real (backend + frontend) da arquitetura descrita no documento técnico.
Motor de decisão e motor matemático são **determinísticos** (`backend/src/engine/`) — a IA
(`backend/src/ai/orchestrator.js`) só interpreta, classifica e conversa.

## Estrutura

```
backend/     API REST (Node.js + Express + PostgreSQL)
frontend/    App React (Vite) — chat, login, pagamento
```

## Deploy simples e barato (recomendado para começar)

Sugestão de stack gratuita/muito barata para arrancar sem servidor próprio:

1. **Base de dados** → [Neon](https://neon.tech) ou [Supabase](https://supabase.com) (Postgres gratuito).
   Copia o `DATABASE_URL` que te derem.
2. **Backend** → [Render](https://render.com) (plano gratuito/starter):
   - "New Web Service" → liga o repositório → root directory `backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Adiciona as variáveis de ambiente de `backend/.env.example`
   - Depois do primeiro deploy, corre `npm run migrate` uma vez (Render tem um "Shell" no dashboard,
     ou corre localmente apontando `DATABASE_URL` para a base de produção).
3. **Frontend** → [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) (gratuito):
   - Root directory `frontend`
   - Build command: `npm run build`, output: `dist`
   - Variável `VITE_API_URL` = URL do backend no Render.

Quando o negócio crescer e precisares de mais controlo (ex. mais tráfego, cron jobs, workers),
migra para um VPS próprio (ex. Hetzner, DigitalOcean) sem mudar nada do código — é só onde corre.

## Correr localmente

```bash
# Backend
cd backend
cp .env.example .env   # preenche DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
npm install
npm run migrate        # cria as tabelas
npm run dev             # corre em http://localhost:3000

# Frontend (noutro terminal)
cd frontend
cp .env.example .env
npm install
npm run dev             # corre em http://localhost:5173
```

## O que já funciona

- Registo/login com telefone + palavra-passe (hash bcrypt).
- **Transcrição de áudio real**: o microfone no frontend grava com `MediaRecorder`, envia o
  áudio para `POST /projects/:id/audio` (backend), que chama a API Whisper da OpenAI
  (`backend/src/ai/audioService.js`). Se a confiança da transcrição ficar abaixo do limiar
  definido em `STT_CONFIDENCE_THRESHOLD`, o texto é colocado na caixa de mensagem para o
  utilizador confirmar/corrigir em vez de ser enviado automaticamente — nunca assume uma
  transcrição incerta como certa. Precisa de `OPENAI_API_KEY` configurada no backend.
- Chat que interpreta a mensagem (IA), extrai dados com estado confirmado/estimado,
  e corre o motor de decisão determinístico para compra/stock/importação.
- Memória de projeto persistida na base de dados.
- Plano gratuito com limite de 1 análise/mês; botão de pagamento que cria uma subscrição
  pendente e redireciona para o link Ref-X/FacilPay.
- **Painel administrativo de confirmação de pagamentos** em `/admin` (protegido por
  `ADMIN_CONFIRM_KEY`) — lista subscrições pendentes com telefone, referência e valor, e
  confirma com um clique depois de verificares o extrato FaciPay. Não há confirmação
  automática: pesquisámos e não existe documentação pública de webhook/API de comerciante
  para a FaciPay (é uma carteira digital de consumo). Se quiseres automatizar isto no futuro,
  contacta `suporte@facipay.ao` a perguntar por uma integração de comerciante — o código já
  tem o sítio certo preparado (`POST /subscriptions/webhook`) para ligar isso assim que existir.

## O que falta para produção

- Verificação de telefone por OTP.
- Painel administrativo para confirmar pagamentos (hoje é uma chamada de API manual).
- Testes automatizados do motor de decisão (a base de código já separa a lógica pura em
  `engine/`, o que torna isto simples de fazer a seguir).
- Motor de decisão estruturado para categorias fora de compra/stock/importação
  (início de negócio, marketing, etc.) — hoje essas categorias só têm conversa guiada pela IA,
  sem relatório numérico, tal como no protótipo.
