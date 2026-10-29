import { topics, type Topic } from "../data";
export type Progress = {
  xp: number;
  completed: string[];
  rewarded: string[];
  days: string[];
  favourites: string[];
};
export const emptyProgress: Progress = {
  xp: 0,
  completed: [],
  rewarded: [],
  days: [],
  favourites: [],
};
export const XP = { word: 5, reply: 5, practiceReplies: 3, conversation: 15 };
// Preserve existing balances and mark older lump-sum rewards as already earned.
export function migrateProgress(p: Progress): Progress {
  if (Array.isArray(p.rewarded)) return p;
  const rewarded: string[] = [];
  for (const t of topics) {
    if (p.completed.includes(t.id + "-vocabulary"))
      for (const w of t.words) rewarded.push(`${t.id}:word:${w.id}`);
    if (p.completed.includes(t.id + "-practice"))
      for (let i = 0; i < 2; i++) rewarded.push(`${t.id}:reply:${i}`);
  }
  return { ...p, rewarded };
}
export function reward(
  p: Progress,
  key: string,
  points: number,
  date = new Date().toLocaleDateString("en-CA"),
): Progress {
  const current = migrateProgress(p);
  if (current.rewarded.includes(key)) return current;
  return {
    ...current,
    xp: current.xp + points,
    rewarded: [...current.rewarded, key],
    days: [...new Set([...current.days, date])],
  };
}
export function complete(p: Progress, key: string): Progress {
  return p.completed.includes(key)
    ? p
    : { ...p, completed: [...p.completed, key] };
}
export function activityCount(p: Progress, t: Topic) {
  return ["vocabulary", "practice", "talk"].filter((a) =>
    p.completed.includes(t.id + "-" + a),
  ).length;
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
