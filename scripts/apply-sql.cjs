/**
 * Aplica un archivo .sql a Postgres (Supabase).
 *
 * 1) Supabase → Project Settings → Database → "Connection string" → URI
 * 2) Copiá la URI (incluye la contraseña) y en .env.local agregá:
 *    DATABASE_URL=postgresql://postgres.xxxxx:TU_PASSWORD@...
 * 3) npm run db:apply-orders
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadEnvLocal();
  const rel = process.argv[2] || "supabase/orders.sql";
  const file = path.isAbsolute(rel) ? rel : path.join(__dirname, "..", rel);
  const sql = fs.readFileSync(file, "utf8");
  const url = process.env.DATABASE_URL;

  if (!url) {
    console.error(
      "\nFalta DATABASE_URL en .env.local\n\n" +
        "Obtenela en: Supabase Dashboard → Project Settings → Database → Connection string → URI\n" +
        "Pegá la línea completa (postgresql://...) en .env.local como:\n" +
        "DATABASE_URL=postgresql://...\n"
    );
    process.exit(1);
  }

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("Listo: SQL aplicado desde", rel);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
