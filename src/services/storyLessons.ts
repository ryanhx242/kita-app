import { topics, type Story, type Topic } from "../data";
const keywords: Record<string, string[]> = {
  eat: [
    "eat",
    "eaten",
    "eating",
    "ate",
    "food",
    "meal",
    "dinner",
    "lunch",
    "breakfast",
    "cook",
    "cooked",
    "cooking",
    "recipe",
    "食",
    "饭",
    "飯",
  ],
  rice: ["rice", "porridge", "congee", "粥", "飯", "饭"],
  tasty: ["delicious", "tasty", "recipe", "flavour", "味"],
  grandma: ["grandma", "grandmother", "ah ma", "阿妈", "阿媽"],
  song: ["song", "songs", "music", "radio", "歌", "收音机"],
  listen: ["listen", "listened", "listening", "music", "radio", "聽", "听"],
  like: ["like", "liked", "love", "loved", "favourite", "favorite", "愛", "爱"],
  sing: ["sing", "sang", "singing", "歌"],
  home: [
    "home",
    "house",
    "kampong",
    "neighbourhood",
    "neighborhood",
    "childhood",
    "grew up",
    "厝",
    "家",
  ],
  friend: ["friend", "friends", "neighbour", "neighbor", "朋友"],
  play: ["play", "played", "playing", "game", "games", "耍"],
  where: [
    "place",
    "places",
    "street",
    "village",
    "kampong",
    "neighbourhood",
    "neighborhood",
    "地点",
    "地方",
  ],
};
export function inferTopic(text: string): string | undefined {
  const normalized = text.toLowerCase();
  const score = topics
    .map((t) => ({
      id: t.id,
      score: t.words.reduce((n, w) => n + matching(w.id, normalized).length, 0),
    }))
    .sort((a, b) => b.score - a.score);
  return score[0].score ? score[0].id : undefined;
}
function matching(id: string, text: string) {
  return (keywords[id] || []).filter((k) =>
    /[\u3400-\u9fff]/.test(k)
      ? text.includes(k)
      : new RegExp(
          "\\b" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b",
          "i",
        ).test(text),
  );
}
function fingerprint(value: string) {
  let n = 2166136261;
  for (const c of value) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return (n >>> 0).toString(36);
}
export function storyLesson(
  story: Story,
  fallbackTopic?: string,
): Topic | undefined {
  const text = (story.title + " " + story.text).toLowerCase();
  const matches = topics
    .flatMap((t) =>
      t.words.map((w) => ({ w, topic: t.id, found: matching(w.id, text) })),
    )
    .filter((x) => x.found.length)
    .sort((a, b) => b.found.length - a.found.length);
  const base = topics.find((t) => t.id === (inferTopic(text) || fallbackTopic));
  if (!base) return;
  const words = [
    ...matches.map((x) => ({
      ...x.w,
      context: `Connected to “${x.found[0]}” in this memory. ${x.w.context}`,
    })),
    ...base.words,
  ]
    .filter((w, i, a) => a.findIndex((x) => x.id === w.id) === i)
    .slice(0, 4);
  return {
    ...base,
    id: `story-${story.id}-${fingerprint(story.title + story.text + base.id)}`,
    name: `Words from ${story.title}`,
    short: story.title,
    description: `A personal practice inspired by ${story.people}’s memory. Words are selected locally from the existing phrase bank, not a translation of the story.`,
    words,
    baseTopic: base.id,
    storyId: story.id,
  };
}
