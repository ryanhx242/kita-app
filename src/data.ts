export type Phrase = {
  id: string;
  expression: string;
  romanisation: string;
  singapore: string;
  source?: { title: string; url: string };
  meaning: string;
  context: string;
  verified: false;
  audio: null;
};
export type Topic = {
  id: string;
  name: string;
  short: string;
  icon: string;
  color: string;
  description: string;
  words: Phrase[];
  prompts: Phrase[];
  storyId?: string;
  baseTopic?: string;
};
// Informal Singapore-friendly reading aids are not a tone transcription.
// Longer adapted sentences remain draft and require speaker review.
const singaporeReadings: Record<string, string> = {
  eat: "jiak",
  rice: "png",
  tasty: "ho jiak",
  grandma: "ah ma",
  eaten: "Jiak beh?",
  taste: "Ho jiak bo?",
  meal: "Li jiak sim mih?",
  song: "kua / gua",
  listen: "tiaⁿ",
  like: "ai",
  sing: "chiuⁿ",
  songs: "Li ai tiaⁿ sim mih kua?",
  together: "Lan cho hue tiaⁿ kua, ho bo?",
  singq: "Li eh hiao chiuⁿ chit tiau kua bo?",
  home: "chu",
  friend: "peng iu",
  play: "sng",
  where: "toh ui",
  whereq: "Che si toh ui?",
  who: "Chit eh lang si siang?",
  games: "Li seh han sng sim mih?",
};
export const dialectSources = {
  greetings: {
    title: "LearnDialect.sg · Have you eaten?",
    url: "https://www.learndialect.sg/hokkien-how-do-you-say-have-you-eaten/",
  },
  understanding: {
    title: "LearnDialect.sg · Understand",
    url: "https://www.learndialect.sg/hokkien-how-do-you-say-understand/",
  },
  context: {
    title: "Singapore Chinese Cultural Centre · Hokkien in Singapore",
    url: "https://culturepaedia.singaporeccc.org.sg/language-education/the-hokkien-dialect-in-singapore/",
  },
};
const phraseSources: Record<string, { title: string; url: string }> = {
  eat: dialectSources.greetings,
  eaten: dialectSources.greetings,
  home: dialectSources.context,
};
const phrase = (
  id: string,
  expression: string,
  romanisation: string,
  meaning: string,
  context = "Singapore household usage varies. Check with a fluent family member.",
): Phrase => ({
  id,
  expression,
  romanisation,
  singapore: singaporeReadings[id] || romanisation,
  source: phraseSources[id],
  meaning,
  context,
  verified: false,
  audio: null,
});
export const topics: Topic[] = [
  {
    id: "food",
    name: "Food & Family Meals",
    short: "Food & family",
    icon: "🍜",
    color: "peach",
    description: "A little conversation over a favourite dish.",
    words: [
      phrase("eat", "食", "chia̍h", "Eat"),
      phrase("rice", "飯", "pn̄g", "Rice / meal"),
      phrase("tasty", "好食", "hó-chia̍h", "Tasty"),
      phrase("grandma", "阿媽", "a-má", "Grandma"),
    ],
    prompts: [
      phrase("eaten", "食未？", "Chia̍h bē?", "Have you eaten?"),
      phrase("taste", "好食無？", "Hó-chia̍h bô?", "Is it tasty?"),
      phrase(
        "meal",
        "你食啥物？",
        "Lí chia̍h siáⁿ-mi̍h?",
        "What are you eating?",
      ),
    ],
  },
  {
    id: "music",
    name: "Music & Favourite Songs",
    short: "Music & songs",
    icon: "📻",
    color: "yellow",
    description: "Discover the soundtrack to their younger days.",
    words: [
      phrase(
        "song",
        "歌",
        "koa",
        "Song",
        "Try asking about a song they remember.",
      ),
      phrase("listen", "聽", "thiaⁿ", "Listen"),
      phrase("like", "愛", "ài", "Like / love"),
      phrase("sing", "唱", "chhiùⁿ", "Sing"),
    ],
    prompts: [
      phrase(
        "songs",
        "你愛聽啥物歌？",
        "Lí ài thiaⁿ siáⁿ-mi̍h koa?",
        "What songs do you like listening to?",
      ),
      phrase(
        "together",
        "咱做伙聽歌，好無？",
        "Lán chò-hóe thiaⁿ koa, hó bô?",
        "Shall we listen to music together?",
      ),
      phrase(
        "singq",
        "你會曉唱這條歌無？",
        "Lí ē-hiáu chhiùⁿ chit tiâu koa bô?",
        "Do you know how to sing this song?",
      ),
    ],
  },
  {
    id: "childhood",
    name: "Childhood Memories",
    short: "Childhood memories",
    icon: "🪁",
    color: "mint",
    description: "Small questions. A whole lifetime of stories.",
    words: [
      phrase("home", "厝", "chhù", "Home / house"),
      phrase("friend", "朋友", "pêng-iú", "Friend"),
      phrase("play", "耍", "sńg", "Play"),
      phrase("where", "佗位", "tó-uī", "Where"),
    ],
    prompts: [
      phrase("whereq", "這是佗位？", "Che sī tó-uī?", "Where is this?"),
      phrase(
        "who",
        "這个人是啥人？",
        "Chit ê lâng sī siáⁿ-lâng?",
        "Who is this person?",
      ),
      phrase(
        "games",
        "你細漢耍啥物？",
        "Lí sè-hàn sńg siáⁿ-mi̍h?",
        "What did you play when you were little?",
      ),
    ],
  },
];
export const upcoming = [
  ["📷", "Family photographs"],
  ["👋", "Everyday greetings"],
  ["🌱", "Hobbies & interests"],
  ["🏘️", "Places in Singapore"],
  ["🏮", "Celebrations & traditions"],
];
export type Photo = {
  id: string;
  title: string;
  description: string;
  people: string;
  topic: string;
  image?: Blob;
  illustration?: string;
};
export type Story = {
  id: string;
  photoId: string;
  title: string;
  text: string;
  transcript: string;
  summary: string;
  people: string;
  topic: string;
  audio?: Blob;
};
export const samplePhotos: Photo[] = [
  {
    id: "radio",
    title: "Grandpa’s old radio",
    description:
      "The little radio that filled the house with music. What stories does it hold?",
    people: "Grandpa",
    topic: "music",
    illustration: "radio",
  },
  {
    id: "wedding",
    title: "Their wedding day",
    description: "A new beginning, many years ago.",
    people: "Grandma, Grandpa",
    topic: "childhood",
    illustration: "wedding",
  },
  {
    id: "dinner",
    title: "Sunday family dinner",
    description: "A table full of our favourite things.",
    people: "Family",
    topic: "food",
    illustration: "dinner",
  },
  {
    id: "neighbourhood",
    title: "The old neighbourhood",
    description: "The streets they grew up on.",
    people: "Grandpa",
    topic: "childhood",
    illustration: "home",
  },
  {
    id: "celebration",
    title: "Together for the new year",
    description: "Another year of being together.",
    people: "Family",
    topic: "childhood",
    illustration: "lantern",
  },
  {
    id: "recipe",
    title: "Grandma’s recipe",
    description: "A little of this, a little of that.",
    people: "Grandma",
    topic: "food",
    illustration: "recipe",
  },
];
