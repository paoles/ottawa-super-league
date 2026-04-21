/**
 * Idempotent migration: adds `is_active` column to `players` table.
 *
 * Usage (local dev — reads file:./data/osl.db from .env.local):
 *   npx tsx scripts/migrate-add-is-active.ts
 *
 * Usage (production Turso):
 *   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." \
 *     npx tsx scripts/migrate-add-is-active.ts
 *
 * Safe to re-run: checks PRAGMA table_info first and no-ops if column exists.
 */
import { createClient } from "@libsql/client";
import { config } from "dotenv";

// Load .env.local only if the caller didn't inline env vars
if (!process.env.TURSO_DATABASE_URL) {
  config({ path: ".env.local" });
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("ERROR: TURSO_DATABASE_URL is not set");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function main() {
  console.log(`Connecting to: ${url!.replace(/authToken=[^&]*/, "authToken=<redacted>")}`);

  const cols = await client.execute("PRAGMA table_info(players)");
  const hasIsActive = cols.rows.some((r) => r.name === "is_active");

  if (hasIsActive) {
    console.log("✓ players.is_active already exists — nothing to do");
    return;
  }

  console.log("→ Adding players.is_active column (default 1)...");
  await client.execute(
    "ALTER TABLE players ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1"
  );

  const after = await client.execute("PRAGMA table_info(players)");
  const added = after.rows.find((r) => r.name === "is_active");
  if (!added) {
    console.error("✗ ALTER TABLE did not persist the column");
    process.exit(1);
  }

  const count = await client.execute(
    "SELECT COUNT(*) as n FROM players WHERE is_active = 1"
  );
  console.log(`✓ is_active added. ${count.rows[0].n} existing players default to active.`);
}

main()
  .catch((err) => {
    console.error("Migration failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => client.close());
