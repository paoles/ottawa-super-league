import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { players, scores } from "../src/lib/db/schema";
import { calculateHandicapDiff } from "../src/lib/handicap";
import type { Course, Tee } from "../src/lib/constants";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./data/osl.db",
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const db = drizzle(client);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(social\)\s*/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface SeedPlayer {
  name: string;
  isSocial: boolean;
  photoUrl?: string;
}

const SEED_PLAYERS: SeedPlayer[] = [
  { name: "Blair Watson", isSocial: false, photoUrl: "/players/blair-watson.jpg" },
  { name: "Kevin Slack", isSocial: false, photoUrl: "/players/kevin-slack.jpg" },
  { name: "Jared Maltais", isSocial: false, photoUrl: "/players/jared-maltais.jpg" },
  { name: "Gavin Bradley", isSocial: false, photoUrl: "/players/gavin-bradley.jpg" },
  { name: "Nico Paoletti", isSocial: false, photoUrl: "/players/nico-paoletti.JPG" },
  { name: "Ryan Woolcock", isSocial: false, photoUrl: "/players/ryan-woolcock.jpg" },
  { name: "Peter Carniglia", isSocial: false, photoUrl: "/players/peter-carniglia.jpg" },
  { name: "Ben Silverman", isSocial: false, photoUrl: "/players/ben-silverman.jpg" },
  { name: "Daniel Perry", isSocial: false, photoUrl: "/players/daniel-perry.jpg" },
  { name: "Dalton Manley", isSocial: true },
  { name: "Justin VBS", isSocial: true, photoUrl: "/players/justin-vbs.jpg" },
  { name: "Andrei Ghita", isSocial: true, photoUrl: "/players/andrei-ghita.jpg" },
  { name: "Donovan Gifford", isSocial: true },
  { name: "Davis Sawyer", isSocial: true },
  { name: "Sam Anderson", isSocial: true },
  { name: "Riley McNamara", isSocial: true, photoUrl: "/players/riley-mcnamara.jpg" },
];

interface SeedScore {
  playerName: string;
  roundDate: string;
  course: Course;
  tee: Tee;
  score: number;
}

const SEED_SCORES: SeedScore[] = [
  // May 17, 2025
  { playerName: "Blair Watson", roundDate: "2025-05-17", course: "North", tee: "White", score: 46 },
  { playerName: "Blair Watson", roundDate: "2025-05-17", course: "West", tee: "White", score: 44 },
  { playerName: "Kevin Slack", roundDate: "2025-05-17", course: "North", tee: "White", score: 42 },
  { playerName: "Kevin Slack", roundDate: "2025-05-17", course: "West", tee: "White", score: 38 },
  { playerName: "Jared Maltais", roundDate: "2025-05-17", course: "North", tee: "White", score: 47 },
  { playerName: "Jared Maltais", roundDate: "2025-05-17", course: "West", tee: "White", score: 49 },
  { playerName: "Gavin Bradley", roundDate: "2025-05-17", course: "North", tee: "White", score: 47 },
  { playerName: "Gavin Bradley", roundDate: "2025-05-17", course: "West", tee: "White", score: 43 },
  { playerName: "Blair Watson", roundDate: "2025-05-17", course: "East", tee: "White", score: 39 },
  { playerName: "Kevin Slack", roundDate: "2025-05-17", course: "East", tee: "White", score: 40 },
  { playerName: "Gavin Bradley", roundDate: "2025-05-17", course: "East", tee: "White", score: 40 },
  { playerName: "Kevin Slack", roundDate: "2025-05-17", course: "South", tee: "White", score: 40 },
  { playerName: "Blair Watson", roundDate: "2025-05-17", course: "South", tee: "White", score: 41 },
  { playerName: "Gavin Bradley", roundDate: "2025-05-17", course: "South", tee: "White", score: 43 },

  // May 18, 2025
  { playerName: "Gavin Bradley", roundDate: "2025-05-18", course: "East", tee: "White", score: 43 },

  // May 24, 2025
  { playerName: "Nico Paoletti", roundDate: "2025-05-24", course: "West", tee: "White", score: 45 },
  { playerName: "Ryan Woolcock", roundDate: "2025-05-24", course: "West", tee: "White", score: 48 },
  { playerName: "Peter Carniglia", roundDate: "2025-05-24", course: "West", tee: "White", score: 60 },
  { playerName: "Jared Maltais", roundDate: "2025-05-24", course: "West", tee: "White", score: 48 },

  // May 28, 2025
  { playerName: "Nico Paoletti", roundDate: "2025-05-28", course: "South", tee: "White", score: 38 },

  // May 30, 2025
  { playerName: "Dalton Manley", roundDate: "2025-05-30", course: "East", tee: "Blue", score: 42 },
  { playerName: "Dalton Manley", roundDate: "2025-05-30", course: "North", tee: "Blue", score: 41 },
  { playerName: "Justin VBS", roundDate: "2025-05-30", course: "East", tee: "Blue", score: 42 },
  { playerName: "Justin VBS", roundDate: "2025-05-30", course: "North", tee: "Blue", score: 42 },
  { playerName: "Blair Watson", roundDate: "2025-05-30", course: "East", tee: "Blue", score: 43 },
  { playerName: "Blair Watson", roundDate: "2025-05-30", course: "North", tee: "Blue", score: 43 },

  // June 21, 2025
  { playerName: "Justin VBS", roundDate: "2025-06-21", course: "East", tee: "Blue", score: 42 },
  { playerName: "Blair Watson", roundDate: "2025-06-21", course: "East", tee: "Blue", score: 43 },
  { playerName: "Jared Maltais", roundDate: "2025-06-21", course: "East", tee: "White", score: 46 },
  { playerName: "Donovan Gifford", roundDate: "2025-06-21", course: "East", tee: "White", score: 50 },
  { playerName: "Justin VBS", roundDate: "2025-06-21", course: "West", tee: "Blue", score: 41 },
  { playerName: "Jared Maltais", roundDate: "2025-06-21", course: "West", tee: "White", score: 44 },

  // June 28, 2025
  { playerName: "Justin VBS", roundDate: "2025-06-28", course: "North", tee: "Blue", score: 43 },
  { playerName: "Jared Maltais", roundDate: "2025-06-28", course: "North", tee: "White", score: 43 },
  { playerName: "Jared Maltais", roundDate: "2025-06-28", course: "South", tee: "White", score: 44 },
  { playerName: "Justin VBS", roundDate: "2025-06-28", course: "South", tee: "Blue", score: 36 },

  // July 1, 2025
  { playerName: "Blair Watson", roundDate: "2025-07-01", course: "West", tee: "Blue", score: 43 },
  { playerName: "Justin VBS", roundDate: "2025-07-01", course: "West", tee: "Blue", score: 40 },
  { playerName: "Justin VBS", roundDate: "2025-07-01", course: "North", tee: "Blue", score: 42 },

  // July 5, 2025
  { playerName: "Blair Watson", roundDate: "2025-07-05", course: "West", tee: "Blue", score: 42 },
  { playerName: "Andrei Ghita", roundDate: "2025-07-05", course: "West", tee: "White", score: 45 },
  { playerName: "Blair Watson", roundDate: "2025-07-05", course: "East", tee: "Blue", score: 43 },
  { playerName: "Andrei Ghita", roundDate: "2025-07-05", course: "East", tee: "White", score: 44 },
  { playerName: "Justin VBS", roundDate: "2025-07-05", course: "South", tee: "Blue", score: 43 },
  { playerName: "Blair Watson", roundDate: "2025-07-05", course: "South", tee: "Blue", score: 47 },
  { playerName: "Ben Silverman", roundDate: "2025-07-05", course: "South", tee: "White", score: 46 },
  { playerName: "Ryan Woolcock", roundDate: "2025-07-05", course: "South", tee: "White", score: 48 },
  { playerName: "Blair Watson", roundDate: "2025-07-05", course: "East", tee: "Blue", score: 41 },
  { playerName: "Justin VBS", roundDate: "2025-07-05", course: "East", tee: "Blue", score: 44 },
  { playerName: "Ryan Woolcock", roundDate: "2025-07-05", course: "East", tee: "White", score: 45 },
  { playerName: "Ben Silverman", roundDate: "2025-07-05", course: "East", tee: "White", score: 51 },

  // May 7, 2025 (entered late on July 5)
  { playerName: "Andrei Ghita", roundDate: "2025-05-07", course: "South", tee: "White", score: 46 },

  // July 12, 2025
  { playerName: "Nico Paoletti", roundDate: "2025-07-12", course: "South", tee: "Blue", score: 46 },
  { playerName: "Nico Paoletti", roundDate: "2025-07-12", course: "West", tee: "Blue", score: 42 },
  { playerName: "Ryan Woolcock", roundDate: "2025-07-12", course: "South", tee: "White", score: 48 },
  { playerName: "Ryan Woolcock", roundDate: "2025-07-12", course: "West", tee: "Blue", score: 46 },

  // July 19, 2025
  { playerName: "Davis Sawyer", roundDate: "2025-07-19", course: "East", tee: "White", score: 45 },
  { playerName: "Daniel Perry", roundDate: "2025-07-19", course: "East", tee: "White", score: 55 },
  { playerName: "Sam Anderson", roundDate: "2025-07-19", course: "East", tee: "White", score: 56 },
  { playerName: "Blair Watson", roundDate: "2025-07-19", course: "West", tee: "White", score: 39 },
  { playerName: "Sam Anderson", roundDate: "2025-07-19", course: "West", tee: "White", score: 50 },
  { playerName: "Daniel Perry", roundDate: "2025-07-19", course: "West", tee: "White", score: 58 },

  // August 2, 2025
  { playerName: "Jared Maltais", roundDate: "2025-08-02", course: "East", tee: "White", score: 41 },
  { playerName: "Daniel Perry", roundDate: "2025-08-02", course: "East", tee: "White", score: 56 },
  { playerName: "Ben Silverman", roundDate: "2025-08-02", course: "East", tee: "White", score: 46 },
  { playerName: "Jared Maltais", roundDate: "2025-08-02", course: "North", tee: "White", score: 44 },
  { playerName: "Ben Silverman", roundDate: "2025-08-02", course: "North", tee: "White", score: 49 },
  { playerName: "Daniel Perry", roundDate: "2025-08-02", course: "North", tee: "White", score: 63 },

  // August 23, 2025
  { playerName: "Nico Paoletti", roundDate: "2025-08-23", course: "North", tee: "White", score: 46 },
  { playerName: "Nico Paoletti", roundDate: "2025-08-23", course: "South", tee: "White", score: 44 },
  { playerName: "Jared Maltais", roundDate: "2025-08-23", course: "North", tee: "White", score: 45 },
  { playerName: "Jared Maltais", roundDate: "2025-08-23", course: "South", tee: "White", score: 44 },
  { playerName: "Ben Silverman", roundDate: "2025-08-23", course: "North", tee: "White", score: 58 },
  { playerName: "Ben Silverman", roundDate: "2025-08-23", course: "South", tee: "White", score: 41 },
  { playerName: "Daniel Perry", roundDate: "2025-08-23", course: "North", tee: "White", score: 54 },
  { playerName: "Daniel Perry", roundDate: "2025-08-23", course: "South", tee: "White", score: 51 },

  // September 7, 2025
  { playerName: "Nico Paoletti", roundDate: "2025-09-07", course: "West", tee: "White", score: 43 },
  { playerName: "Nico Paoletti", roundDate: "2025-09-07", course: "South", tee: "White", score: 40 },
  { playerName: "Jared Maltais", roundDate: "2025-09-07", course: "West", tee: "White", score: 46 },
  { playerName: "Jared Maltais", roundDate: "2025-09-07", course: "South", tee: "White", score: 44 },
  { playerName: "Peter Carniglia", roundDate: "2025-09-07", course: "West", tee: "White", score: 54 },
  { playerName: "Peter Carniglia", roundDate: "2025-09-07", course: "South", tee: "White", score: 53 },

  // September 14, 2025
  { playerName: "Blair Watson", roundDate: "2025-09-14", course: "South", tee: "White", score: 39 },
  { playerName: "Daniel Perry", roundDate: "2025-09-14", course: "South", tee: "White", score: 47 },
  { playerName: "Blair Watson", roundDate: "2025-09-14", course: "North", tee: "White", score: 43 },
  { playerName: "Daniel Perry", roundDate: "2025-09-14", course: "North", tee: "White", score: 54 },

  // September 20, 2025
  { playerName: "Blair Watson", roundDate: "2025-09-20", course: "West", tee: "White", score: 44 },
  { playerName: "Ben Silverman", roundDate: "2025-09-20", course: "West", tee: "White", score: 54 },

  // September 27, 2025
  { playerName: "Nico Paoletti", roundDate: "2025-09-27", course: "West", tee: "White", score: 44 },
  { playerName: "Nico Paoletti", roundDate: "2025-09-27", course: "North", tee: "White", score: 39 },
  { playerName: "Ben Silverman", roundDate: "2025-09-27", course: "West", tee: "White", score: 54 },
  { playerName: "Ben Silverman", roundDate: "2025-09-27", course: "North", tee: "White", score: 52 },

  // September 30, 2025
  { playerName: "Ben Silverman", roundDate: "2025-09-30", course: "East", tee: "White", score: 48 },
  { playerName: "Daniel Perry", roundDate: "2025-09-30", course: "East", tee: "White", score: 56 },
  { playerName: "Nico Paoletti", roundDate: "2025-09-30", course: "South", tee: "White", score: 43 },
  { playerName: "Ben Silverman", roundDate: "2025-09-30", course: "South", tee: "White", score: 49 },
  { playerName: "Daniel Perry", roundDate: "2025-09-30", course: "South", tee: "White", score: 57 },
  { playerName: "Peter Carniglia", roundDate: "2025-09-30", course: "South", tee: "White", score: 57 },
];

async function seed() {
  console.log("Seeding database...");

  // Create tables if they don't exist
  await client.execute(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      is_social INTEGER NOT NULL DEFAULT 0,
      photo_url TEXT,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL REFERENCES players(id),
      round_date TEXT NOT NULL,
      course TEXT NOT NULL,
      tee TEXT NOT NULL,
      score INTEGER NOT NULL,
      handicap_diff REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    )
  `);

  // Clear existing data
  await client.execute("DELETE FROM scores");
  await client.execute("DELETE FROM players");

  // Insert players
  const playerIdMap = new Map<string, number>();

  for (const p of SEED_PLAYERS) {
    const result = await db
      .insert(players)
      .values({
        name: p.name,
        slug: slugify(p.name),
        isSocial: p.isSocial,
        photoUrl: p.photoUrl ?? null,
      })
      .returning({ id: players.id });

    playerIdMap.set(p.name, result[0].id);
  }

  console.log(`Inserted ${SEED_PLAYERS.length} players`);

  // Insert scores
  let inserted = 0;
  for (const s of SEED_SCORES) {
    const playerId = playerIdMap.get(s.playerName);
    if (!playerId) {
      console.warn(`Player not found: ${s.playerName}`);
      continue;
    }

    const hdcp = calculateHandicapDiff(s.score, s.course, s.tee);

    await db.insert(scores).values({
      playerId,
      roundDate: s.roundDate,
      course: s.course,
      tee: s.tee,
      score: s.score,
      handicapDiff: hdcp,
    });

    inserted++;
  }

  console.log(`Inserted ${inserted} score records`);
  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
