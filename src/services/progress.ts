export type Progress = {
  xp: number;
  completed: string[];
  days: string[];
  favourites: string[];
};
export const emptyProgress: Progress = {
  xp: 0,
  completed: [],
  days: [],
  favourites: [],
};
export function reward(
  p: Progress,
  key: string,
  points: number,
  date = new Date().toLocaleDateString("en-CA"),
): Progress {
  if (p.completed.includes(key)) return p;
  return {
    ...p,
    xp: p.xp + points,
    completed: [...p.completed, key],
    days: [...new Set([...p.days, date])],
  };
}
export function streak(days: string[], now = new Date()): number {
  let count = 0;
  const d = new Date(now);
  if (!days.includes(d.toLocaleDateString("en-CA"))) d.setDate(d.getDate() - 1);
  while (days.includes(d.toLocaleDateString("en-CA"))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}
export function readLocal<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
