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
