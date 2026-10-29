import type { Topic, Phrase } from "../data";
export type BotReply = { text: string; hokkien?: Phrase };
export type Message = {
  role: "assistant" | "user";
  text: string;
  hokkien?: Phrase;
};
export type Review = {
  id: string;
  original: string;
  proposed: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  correction: string;
  decisions: { action: string; at: string }[];
};
export const reviewRules = {
  sensitive: /\b(death|inheritance|illness|religion|conflict|hate|stupid)\b/i,
  ambiguous: /\b(translate|honorific|ambiguous)\b/i,
};
export function needsReview(text: string, confidence = 1) {
  return confidence < 0.75
    ? "Uncertain translation"
    : reviewRules.sensitive.test(text)
      ? "Sensitive or potentially inappropriate interpretation"
      : reviewRules.ambiguous.test(text)
        ? "Expression requires linguistic verification"
        : null;
}
export interface ConversationService {
  respond(topic: Topic, messages: Message[], input: string): Promise<BotReply>;
}
export class SimulatedConversationService implements ConversationService {
  async respond(topic: Topic, messages: Message[], input: string) {
    if (/mean|clarif|help/i.test(input))
      return {
        text: `“${topic.words[0].singapore}” means “${topic.words[0].meaning.toLowerCase()}”. Try a short question and give them time to answer. These dialect drafts still need fluent-speaker checking.`,
      };
    if (/correct|wrong/i.test(input))
      return {
        text: "Let’s keep it simple. Use one phrase from your vocabulary cards, and ask your family how they would say it. I cannot verify your Hokkien grammar.",
      };
    const turns = messages.filter((m) => m.role === "user").length;
    const baseTopic = topic.baseTopic || topic.id;
    const responses =
      baseTopic === "music"
        ? [
            "We used to gather around the radio after dinner. My sister always chose the songs. Who do you listen with?",
            "Those songs remind me of our old home. Is there a song that brings back a memory for you?",
            "Maybe we can listen together next time. Ask your grandparent which recording they remember.",
          ]
        : baseTopic === "food"
          ? [
              "My mother taught me to cook. We would prepare dinner together on Sundays. What do you like eating?",
              "A family meal always reminds me of home. Who would you like to cook with?",
              "Let’s make something together one day. You could ask your grandparent about a favourite ingredient.",
            ]
          : [
              "We played outside with our neighbours until dinner. What games do you enjoy?",
              "My closest friend lived next door. Is there someone you grew up with?",
              "Our old neighbourhood has changed so much. Maybe we could look at a photograph together.",
            ];
    const draft = replies[baseTopic] || replies.childhood;
    return {
      text: responses[turns % responses.length],
      hokkien: draft[turns % draft.length],
    };
  }
}
// Curated short replies, not a claimed translation of the longer English scenario.
const reply = (
  id: string,
  expression: string,
  romanisation: string,
  singapore: string,
  meaning: string,
): Phrase => ({
  id,
  expression,
  romanisation,
  singapore,
  meaning,
  context:
    "Draft Singapore Hokkien. Household usage and tones need fluent-speaker checking.",
  verified: false,
  audio: null,
});
const replies: Record<string, Phrase[]> = {
  music: [
    reply(
      "music-like",
      "我愛聽歌。",
      "Góa ài thiaⁿ koa.",
      "Wa ai tiaⁿ kua.",
      "I like listening to songs.",
    ),
    reply(
      "music-sing",
      "我愛唱歌。",
      "Góa ài chhiùⁿ koa.",
      "Wa ai chiuⁿ kua.",
      "I like singing.",
    ),
    reply(
      "music-together",
      "好，咱做伙聽歌。",
      "Hó, lán chò-hóe thiaⁿ koa.",
      "Ho, lan cho hue tiaⁿ kua.",
      "Okay, let’s listen to songs together.",
    ),
  ],
  food: [
    reply(
      "food-full",
      "我食飽矣。",
      "Góa chia̍h pá--ah.",
      "Wa jiak ba ah.",
      "I have eaten my fill.",
    ),
    reply(
      "food-tasty",
      "真好食。",
      "Chin hó-chia̍h.",
      "Jin ho jiak.",
      "It is really tasty.",
    ),
    reply(
      "food-together",
      "好，做伙食。",
      "Hó, chò-hóe chia̍h.",
      "Ho, cho hue jiak.",
      "Okay, let’s eat together.",
    ),
  ],
  childhood: [
    reply(
      "child-play",
      "我佮朋友做伙耍。",
      "Góa kah pêng-iú chò-hóe sńg.",
      "Wa kah peng iu cho hue sng.",
      "I play with friends.",
    ),
    reply(
      "child-home",
      "這是阮兜。",
      "Che sī gún tau.",
      "Che si gun tau.",
      "This is our home.",
    ),
    reply(
      "child-friend",
      "伊是我的朋友。",
      "I sī góa ê pêng-iú.",
      "Ee si wa eh peng iu.",
      "That person is my friend.",
    ),
  ],
};
// Future server integration: the server must authenticate, apply review checks, and keep API keys server-side.
export class BackendConversationService implements ConversationService {
  constructor(private endpoint = "/api/conversation") {}
  async respond(topic: Topic, messages: Message[], input: string) {
    const r = await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topic.id, messages, input }),
    });
    if (!r.ok) throw Error("Conversation service unavailable");
    const data = await r.json();
    if (typeof data.text !== "string") throw Error("Invalid service response");
    return { text: data.text };
  }
}
export function followUps(summary: string) {
  const subject = /radio|song|music/i.test(summary)
    ? "that song"
    : /cook|food|meal/i.test(summary)
      ? "that meal"
      : /friend|sister|brother/i.test(summary)
        ? "that person"
        : "that memory";
  return [
    `What do you remember most about ${subject}?`,
    `Who else was part of ${subject}?`,
    `Could we explore ${subject} together sometime?`,
  ];
}
