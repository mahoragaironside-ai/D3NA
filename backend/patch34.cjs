const fs = require("fs");
let s = fs.readFileSync("src/lib/affiliateCommissions.js", "utf8");
const marker = "export async function runWeeklyPassiveIncome()";
if (!s.includes(marker)) { console.log("0/1 alteracoes aplicadas"); process.exit(1); }

const extra = `// Credita ao afiliado a diferenca entre o preco de revenda e o preco de compra
// de um link de uso unico do Construtor, quando o cliente final paga e o admin confirma.
export async function awardResaleDifference(affiliateId, diffAmount, buildId) {
  if (!diffAmount || diffAmount <= 0) return null;
  const commission = await query(
    \`INSERT INTO affiliate_commissions (affiliate_id, source_type, amount_aoa, reference_id)
     VALUES ($1, 'revenda_link', $2, $3) RETURNING *\`,
    [affiliateId, diffAmount, buildId]
  );
  await query("UPDATE affiliates SET balance_aoa = balance_aoa + $1 WHERE affiliate_id = $2", [diffAmount, affiliateId]);
  return commission.rows[0];
}

`;

s = s.replace(marker, extra + marker);
fs.writeFileSync("src/lib/affiliateCommissions.js", s);
console.log("1/1 alteracoes aplicadas");
