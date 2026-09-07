import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { query } from "../db.js";

const router = Router();
router.use(requireAuth);

const VIEWS_PER_CREDIT = 5;

router.post("/watched", async (req, res) => {
  const result = await query(
    "UPDATE users SET ad_views_count = ad_views_count + 1 WHERE user_id = $1 RETURNING ad_views_count, ad_credits",
    [req.userId]
  );
  let { ad_views_count, ad_credits } = result.rows[0];

  if (ad_views_count >= VIEWS_PER_CREDIT) {
    ad_views_count -= VIEWS_PER_CREDIT;
    ad_credits += 1;
    await query("UPDATE users SET ad_views_count = $1, ad_credits = $2 WHERE user_id = $3", [ad_views_count, ad_credits, req.userId]);
  }

  res.json({ ad_views_count, ad_credits, views_needed: VIEWS_PER_CREDIT - ad_views_count });
});

router.get("/status", async (req, res) => {
  const result = await query("SELECT ad_views_count, ad_credits FROM users WHERE user_id = $1", [req.userId]);
  const row = result.rows[0] || { ad_views_count: 0, ad_credits: 0 };
  res.json({ ...row, views_needed: VIEWS_PER_CREDIT - row.ad_views_count });
});

export default router;
