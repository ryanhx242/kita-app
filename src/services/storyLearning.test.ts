import { describe, it, expect } from "vitest";
import { topics, type Story } from "../data";
import { storyLesson, inferTopic } from "./storyLessons";
import {
  reward,
  complete,
  emptyProgress,
  migrateProgress,
  activityCount,
} from "./progress";
import { SimulatedConversationService } from "./conversation";
const story: Story = {
  id: "memory1",
  title: "Radio Sundays",
  text: "Grandpa listened to songs on the radio and sang with his friends.",
  people: "Grandpa",
  photoId: "",
  summary: "",
  transcript: "",
  topic: "",
};
describe("story vocabulary", () => {
  it("uses matching existing words, never new translations, without changing the story", () => {
    const before = structuredClone(story);
    const t = storyLesson(story)!;
    expect(t.baseTopic).toBe("music");
    expect(t.words.some((w) => w.id === "song")).toBe(true);
    expect(t.words.some((w) => w.id === "friend")).toBe(true);
    expect(
      t.words.every((w) =>
        topics.some((base) =>
          base.words.some((v) => v.id === w.id && v.singapore === w.singapore),
        ),
      ),
    ).toBe(true);
    expect(story).toEqual(before);
    expect(t.storyId).toBe(story.id);
  });
  it("does not claim a match when content is unrelated, and allows a starting topic", () => {
    const other = {
      ...story,
      title: "A memory",
      text: "Watching clouds drift.",
      people: "Gran",
    };
    expect(storyLesson(other)).toBeUndefined();
    expect(storyLesson(other, "food")?.baseTopic).toBe("food");
    expect(inferTopic("music radio")).toBe("music");
    expect(inferTopic("delicious rice recipe")).toBe("food");
  });
  it("keeps lesson IDs stable through activity routes and changes them when the story changes", () => {
    const a = storyLesson(story)!;
    expect(storyLesson(story, a.baseTopic)!.id).toBe(a.id);
    expect(
      storyLesson({ ...story, text: "We cooked rice for dinner." })!.id,
    ).not.toBe(a.id);
  });
  it("matches whole words and Chinese vocabulary", () => {
    expect(inferTopic("corporate paperwork")).toBeUndefined();
    expect(inferTopic("阿媽煮飯")).toBe("food");
  });
});
describe("individual XP", () => {
  it("awards questions individually and never double-rewards a question", () => {
    const one = reward(emptyProgress, "music:word:song", 5);
    expect(one.xp).toBe(5);
    expect(reward(one, "music:word:song", 5).xp).toBe(5);
    const two = reward(one, "music:word:listen", 5);
    expect(two.xp).toBe(10);
    expect(activityCount(two, topics[1])).toBe(0);
    expect(activityCount(complete(two, "music-vocabulary"), topics[1])).toBe(1);
  });
  it("allows independent conversation sessions and deduplicates the same submit", () => {
    const one = reward(emptyProgress, "music:talk:session1", 15);
    expect(reward(one, "music:talk:session1", 15).xp).toBe(15);
    expect(reward(one, "music:talk:session2", 15).xp).toBe(30);
  });
  it("preserves legacy XP and prevents re-awarding its vocabulary lump sum", () => {
    const old = {
      xp: 30,
      completed: ["music-vocabulary", "music-practice"],
      days: ["2026-10-23"],
      favourites: ["songs"],
    } as typeof emptyProgress;
    const migrated = migrateProgress(old);
    expect(migrated.xp).toBe(30);
    expect(migrated.completed).toEqual(old.completed);
    expect(migrated.rewarded).toContain("music:word:song");
    expect(reward(migrated, "music:word:song", 5).xp).toBe(30);
    expect(migrateProgress(migrated)).toBe(migrated);
  });
});
describe("Singapore Hokkien replies", () => {
  it("provides short bilingual bot replies with reading aids, not full-scenario translations", async () => {
    const engine = new SimulatedConversationService();
    for (const t of topics) {
      const r = await engine.respond(t, [], "Tell me a memory");
      expect(r.hokkien?.expression).toBeTruthy();
      expect(r.hokkien?.singapore).toBeTruthy();
      expect(r.hokkien?.meaning).toBeTruthy();
      expect(r.hokkien?.verified).toBe(false);
    }
    expect(
      (await engine.respond(topics[0], [], "help")).hokkien,
    ).toBeUndefined();
  });
  it("has a Singapore reading aid for every taught word and prompt", () => {
    for (const t of topics)
      for (const p of [...t.words, ...t.prompts])
        expect(p.singapore).toBeTruthy();
    expect(topics[0].words[0].singapore).toBe("jiak");
    expect(topics[0].prompts[0].singapore).toBe("Jiak beh?");
  });
});
