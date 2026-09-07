import "dotenv/config";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("Schema aplicado com sucesso.");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error("Erro ao aplicar schema:", e);
  process.exit(1);
});
