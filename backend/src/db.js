import pg from "pg";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first"); // corrige ENOTFOUND intermitente em redes móveis

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text, params) {
  return pool.query(text, params);
}
