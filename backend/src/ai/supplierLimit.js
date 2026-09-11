import { query } from "../db.js";

const SEARCHES_PER_WEEK_NORMAL = 10;

async function isPremiumActive(userId) {
  const result = await query(
    `SELECT * FROM subscriptions WHERE user_id = $1 AND payment_status = 'confirmado' AND plan_name = 'premium'
     ORDER BY expires_at DESC LIMIT 1`,
    [userId]
  );
  const sub = result.rows[0];
  return sub && new Date(sub.expires_at) > new Date();
}

export async function checkSupplierSearchLimit(userId) {
  const premium = await isPremiumActive(userId);
  if (premium) return { allowed: true, isPremium: true };

  const usage = await query(
    `SELECT count(*) FROM supplier_search_log WHERE user_id = $1 AND created_at > now() - interval '7 days'`,
    [userId]
  );
  const used = Number(usage.rows[0].count);
  const remaining = SEARCHES_PER_WEEK_NORMAL - used;
  return { allowed: remaining > 0, isPremium: false, remaining: Math.max(0, remaining), limit: SEARCHES_PER_WEEK_NORMAL };
}

export async function logSupplierSearch(userId) {
  await query("INSERT INTO supplier_search_log (user_id) VALUES ($1)", [userId]);
}
