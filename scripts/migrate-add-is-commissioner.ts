import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL ?? "file:./data/osl.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function main() {
  const info = await client.execute("PRAGMA table_info(players)");
  const columns = info.rows.map((r) => r[1] as string);

  if (!columns.includes("is_commissioner")) {
    await client.execute(
      "ALTER TABLE players ADD COLUMN is_commissioner INTEGER NOT NULL DEFAULT 0"
    );
    console.log("Added is_commissioner column");
  } else {
    console.log("is_commissioner column already exists — skipping ALTER");
  }

  await client.execute(
    "UPDATE players SET is_commissioner = 1 WHERE slug = 'nico-paoletti'"
  );
  console.log("Set Nico Paoletti as commissioner");
}

main().catch(console.error);
