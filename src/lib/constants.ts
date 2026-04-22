export const SEASON_COMMISSIONERS: Record<number, string> = {
  2025: "nico-paoletti",
  2024: "kevin-slack",
  2023: "blair-watson",
};

export const COURSES = ["North", "East", "West", "South"] as const;
export type Course = (typeof COURSES)[number];

export const TEES = ["White", "Blue"] as const;
export type Tee = (typeof TEES)[number];

export const PAR = 36;
export const MIN_GAMES_FOR_RANK = 10;

export const COURSE_RATINGS: Record<
  Course,
  Record<Tee, { cr: number; slope: number }>
> = {
  East: {
    White: { cr: 34.7, slope: 124 },
    Blue: { cr: 35.9, slope: 128 },
  },
  North: {
    White: { cr: 34.0, slope: 122 },
    Blue: { cr: 34.8, slope: 126 },
  },
  West: {
    White: { cr: 34.6, slope: 126 },
    Blue: { cr: 35.9, slope: 128 },
  },
  South: {
    White: { cr: 33.9, slope: 122 },
    Blue: { cr: 34.8, slope: 125 },
  },
};
