import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, like, or } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";
import { players, scores } from "../src/lib/db/schema";
import { calculateHandicapDiff } from "../src/lib/handicap";
import type { Course } from "../src/lib/constants";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./data/osl.db",
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});
const db = drizzle(client);

const XLSX_PATH = resolve(process.cwd(), "Past Data.xlsx");
const YEARS_TO_IMPORT = [2023, 2024] as const;

const COURSE_ALIASES: Record<string, Course> = {
  "Meadows N": "North",
  "Meadows E": "East",
  "Meadows S": "South",
  "Meadows W": "West",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(social\)\s*/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseSocialName(raw: string): { name: string; isSocial: boolean } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.*?)\s*\(Social\)\s*$/i);
  if (match) return { name: match[1].trim(), isSocial: true };
  return { name: trimmed, isSocial: false };
}

function toIsoDate(value: unknown): string | null {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof value === "number") {
    // xlsx numeric dates: days since 1899-12-30
    const base = Date.UTC(1899, 11, 30);
    const ms = value * 24 * 60 * 60 * 1000;
    return toIsoDate(new Date(base + ms));
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return null;
}

type SheetRow = {
  date: string;
  course: Course;
  shortName: string;
  score: number;
};

type SheetData = {
  rows: SheetRow[];
  aliasMap: Map<string, { fullName: string; isSocial: boolean }>;
};

function readSheet(wb: XLSX.WorkBook, sheetName: string): SheetData {
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Sheet ${sheetName} not found`);

  const expectedYear = parseInt(sheetName, 10);
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  });

  const rows: SheetRow[] = [];
  const aliasMap = new Map<string, { fullName: string; isSocial: boolean }>();
  let skippedWrongYear = 0;

  for (let i = 1; i < matrix.length; i++) {
    const row = matrix[i];
    const [date, courseRaw, shortName, , scoreRaw] = row as [unknown, unknown, unknown, unknown, unknown];
    const shortJ = row[9] as unknown;
    const fullK = row[10] as unknown;

    const iso = toIsoDate(date);
    if (
      iso &&
      typeof courseRaw === "string" &&
      typeof shortName === "string" &&
      (typeof scoreRaw === "number" || (typeof scoreRaw === "string" && /^\d+$/.test(scoreRaw)))
    ) {
      const rowYear = parseInt(iso.slice(0, 4), 10);
      let finalIso = iso;
      if (rowYear !== expectedYear) {
        finalIso = `${expectedYear}${iso.slice(4)}`;
        skippedWrongYear++;
        console.warn(
          `  ~ ${sheetName} row ${i}: date ${iso} → ${finalIso} (coerced to sheet year)`
        );
      }
      const course = COURSE_ALIASES[courseRaw.trim()];
      if (!course) {
        throw new Error(`Unknown course in ${sheetName}: ${courseRaw}`);
      }
      rows.push({
        date: finalIso,
        course,
        shortName: shortName.trim(),
        score: typeof scoreRaw === "number" ? scoreRaw : parseInt(scoreRaw, 10),
      });
    }

    if (typeof shortJ === "string" && typeof fullK === "string") {
      const { name, isSocial } = parseSocialName(fullK);
      if (name) aliasMap.set(shortJ.trim(), { fullName: name, isSocial });
    }
  }

  if (skippedWrongYear > 0) {
    console.warn(`  ${sheetName}: coerced ${skippedWrongYear} rows with out-of-year dates to ${expectedYear}`);
  }

  return { rows, aliasMap };
}

async function ensurePlayer(
  fullName: string,
  isSocial: boolean,
  cache: Map<string, number>,
  stats: { created: number }
): Promise<number> {
  const cached = cache.get(fullName);
  if (cached) return cached;

  const existing = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.name, fullName))
    .limit(1);

  if (existing.length) {
    cache.set(fullName, existing[0].id);
    return existing[0].id;
  }

  const [inserted] = await db
    .insert(players)
    .values({
      name: fullName,
      slug: slugify(fullName),
      isSocial,
      photoUrl: null,
    })
    .returning({ id: players.id });

  cache.set(fullName, inserted.id);
  stats.created++;
  console.log(`  + created player: ${fullName}${isSocial ? " (Social)" : ""}`);
  return inserted.id;
}

async function main() {
  console.log(`Reading ${XLSX_PATH}`);
  const buffer = readFileSync(XLSX_PATH);
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });

  const perYear: Record<number, SheetData> = {};
  for (const year of YEARS_TO_IMPORT) {
    perYear[year] = readSheet(wb, String(year));
    console.log(
      `  ${year}: parsed ${perYear[year].rows.length} score rows, ${perYear[year].aliasMap.size} aliases`
    );
  }

  // Delete existing imported rows for these years (idempotency)
  const yearPatterns = YEARS_TO_IMPORT.map((y) => like(scores.roundDate, `${y}-%`));
  const whereClause = yearPatterns.length === 1 ? yearPatterns[0] : or(...yearPatterns)!;
  const deleted = await db.delete(scores).where(whereClause).returning({ id: scores.id });
  console.log(`Cleared ${deleted.length} pre-existing scores in ${YEARS_TO_IMPORT.join(", ")}`);

  const playerCache = new Map<string, number>();
  const playerStats = { created: 0 };

  const inserts: { year: number; count: number }[] = [];
  const unresolved: { year: number; shortName: string; count: number }[] = [];

  for (const year of YEARS_TO_IMPORT) {
    const { rows, aliasMap } = perYear[year];
    let count = 0;
    const missing = new Map<string, number>();

    for (const row of rows) {
      const alias = aliasMap.get(row.shortName);
      if (!alias) {
        missing.set(row.shortName, (missing.get(row.shortName) ?? 0) + 1);
        continue;
      }

      const playerId = await ensurePlayer(alias.fullName, alias.isSocial, playerCache, playerStats);
      const hdcp = calculateHandicapDiff(row.score, row.course, "White");

      await db.insert(scores).values({
        playerId,
        roundDate: row.date,
        course: row.course,
        tee: "White",
        score: row.score,
        handicapDiff: hdcp,
      });
      count++;
    }

    inserts.push({ year, count });
    for (const [shortName, c] of missing) {
      unresolved.push({ year, shortName, count: c });
    }
  }

  console.log("\n=== Summary ===");
  for (const { year, count } of inserts) {
    console.log(`  ${year}: inserted ${count} scores`);
  }
  console.log(`  new players created: ${playerStats.created}`);

  if (unresolved.length) {
    console.log("\nUnresolved short names (skipped):");
    for (const u of unresolved) {
      console.log(`  ${u.year} "${u.shortName}" (${u.count} rows)`);
    }
  }

  const total = await db
    .select({ id: scores.id })
    .from(scores);
  console.log(`\nTotal scores in DB: ${total.length}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Import failed:", err instanceof Error ? err.stack : err);
  process.exit(1);
});
