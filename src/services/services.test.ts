import { describe, it, expect } from "vitest";
import { reward, emptyProgress, streak } from "./progress";
import {
  SimulatedConversationService,
  needsReview,
  followUps,
} from "./conversation";
import { topics } from "../data";
describe("learning progress", () => {
  it("rewards an activity once without rewarding private data", () => {
    const p = reward(emptyProgress, "music-vocabulary", 20, "2026-10-23");
    expect(reward(p, "music-vocabulary", 20)).toEqual(p);
    expect(p.xp).toBe(20);
  });
  it("counts consecutive calendar days", () => {
    expect(
      streak(["2026-10-22", "2026-10-23"], new Date("2026-10-23T12:00:00")),
    ).toBe(2);
    expect(streak([], new Date())).toBe(0);
  });
});
describe("offline conversation", () => {
  it("changes response with context and explains a phrase", async () => {
    const s = new SimulatedConversationService();
    const a = await s.respond(topics[1], [], "music");
    const b = await s.respond(
      topics[1],
      [{ role: "user", text: "music" }],
      "more",
    );
    expect(a).not.toBe(b);
    expect(await s.respond(topics[1], [], "clarify")).toContain(
      "Song".toLowerCase(),
    );
  });
  it("withholds sensitive and uncertain interpretations", () => {
    expect(needsReview("inheritance")).toBeTruthy();
    expect(needsReview("hello", 0.5)).toBeTruthy();
    expect(needsReview("a song")).toBeNull();
  });
  it("offers three contextual follow-ups without fabricated translations", () => {
    expect(followUps("radio with sister")).toHaveLength(3);
    expect(followUps("radio")[0]).toContain("song");
  });
});
describe("dialect content integrity", () => {
  it("provides three complete topics and never claims draft audio is validated", () => {
    expect(topics).toHaveLength(3);
    for (const t of topics) {
      expect(t.words.length).toBeGreaterThanOrEqual(3);
      expect(t.prompts).toHaveLength(3);
      for (const p of [...t.words, ...t.prompts]) {
        expect(p.verified).toBe(false);
        expect(p.audio).toBeNull();
        expect(p.romanisation).toBeTruthy();
      }
    }
  });
});
