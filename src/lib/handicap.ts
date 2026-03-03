import { COURSE_RATINGS, type Course, type Tee } from "./constants";

export function calculateHandicapDiff(
  score: number,
  course: Course,
  tee: Tee
): number {
  const { cr, slope } = COURSE_RATINGS[course][tee];
  return Math.round(((score - cr) * 113) / slope * 100) / 100;
}
