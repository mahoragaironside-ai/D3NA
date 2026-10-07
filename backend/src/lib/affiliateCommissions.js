import { query } from "../db.js";

// Tabela de comissoes confirmada pelo dono (AOA). "Plano Mais/Max" (5000 AOA)
// ainda nao existe como plano distinto no subscriptions.js - adicionar aqui
// quando esse plano for criado, com a chave que o plan_name usar.
export const COMMISSION_RULES = {
  consultoria_semanal: 200, // Plano Basico
  premium: 500,             // Plano Premium
  construtor: 600,          // Venda normal do link do Construtor
};

export async function awardCommission(referredUserId, sourceType, referenceId) {
  const amount = COMMISSION_RULES[sourceType];
  if (!amount) return null;

  const u = await query("SELECT referred_by_affiliate_id FROM users WHERE user_id = $1", [referredUserId]);
  const affiliateId = u.rows[0]?.referred_by_affiliate_id;
  if (!affiliateId) return null;

  const commission = await query(
    `INSERT INTO affiliate_commissions (affiliate_id, referred_user_id, source_type, amount_aoa, reference_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [affiliateId, referredUserId, sourceType, amount, referenceId || null]
  );
  await query("UPDATE affiliates SET balance_aoa = balance_aoa + $1 WHERE affiliate_id = $2", [amount, affiliateId]);
  return commission.rows[0];
}

// Para fluxos sem utilizador autenticado (ex.: submissao publica do Construtor),
// onde o affiliate_id ja foi capturado diretamente na tabela de origem.
export async function awardCommissionDirect(affiliateId, sourceType, referenceId) {
  const amount = COMMISSION_RULES[sourceType];
  if (!amount || !affiliateId) return null;
  const commission = await query(
    `INSERT INTO affiliate_commissions (affiliate_id, source_type, amount_aoa, reference_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [affiliateId, sourceType, amount, referenceId || null]
  );
  await query("UPDATE affiliates SET balance_aoa = balance_aoa + $1 WHERE affiliate_id = $2", [amount, affiliateId]);
  return commission.rows[0];
}

// Corre semanalmente (via cron externo). Paga 5 AOA por cada conta registada
// com link de afiliado que ainda nao tem plano ativo, uma vez por semana no maximo.
// Credita ao afiliado a diferenca entre o preco de revenda e o preco de compra
// de um link de uso unico do Construtor, quando o cliente final paga e o admin confirma.
export async function awardResaleDifference(affiliateId, diffAmount, buildId) {
  if (!diffAmount || diffAmount <= 0) return null;
  const commission = await query(
    `INSERT INTO affiliate_commissions (affiliate_id, source_type, amount_aoa, reference_id)
     VALUES ($1, 'revenda_link', $2, $3) RETURNING *`,
    [affiliateId, diffAmount, buildId]
  );
  await query("UPDATE affiliates SET balance_aoa = balance_aoa + $1 WHERE affiliate_id = $2", [diffAmount, affiliateId]);
  return commission.rows[0];
}

export async function runWeeklyPassiveIncome() {
  const result = await query(`
    WITH novos AS (
      INSERT INTO affiliate_commissions (affiliate_id, referred_user_id, source_type, amount_aoa)
      SELECT u.referred_by_affiliate_id, u.user_id, 'registo_sem_plano', 5
      FROM users u
      WHERE u.referred_by_affiliate_id IS NOT NULL
        AND u.subscription_status != 'ativo'
        AND NOT EXISTS (
          SELECT 1 FROM affiliate_commissions c
          WHERE c.referred_user_id = u.user_id AND c.source_type = 'registo_sem_plano'
            AND c.created_at > now() - interval '7 days'
        )
      RETURNING affiliate_id, amount_aoa
    ),
    somas AS (
      SELECT affiliate_id, SUM(amount_aoa) AS total FROM novos GROUP BY affiliate_id
    )
    UPDATE affiliates a SET balance_aoa = a.balance_aoa + s.total
    FROM somas s WHERE a.affiliate_id = s.affiliate_id
    RETURNING a.affiliate_id, s.total
  `);
  return result.rows;
}
