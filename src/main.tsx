import React, { useState, useEffect, useRef, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Home,
  BookOpen,
  Images,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Flame,
  Sparkles,
  Settings,
  Heart,
  MessageCircle,
  Plus,
  Lock,
  Star,
  Send,
  VolumeX,
  Check,
  Mic,
  Square,
  Trash2,
  Leaf,
  Headphones,
} from "lucide-react";
import {
  topics,
  upcoming,
  type Topic,
  type Photo,
  type Story,
  type Phrase,
} from "./data";
import { storyLesson, inferTopic } from "./services/storyLessons";
import { storage } from "./services/storage";
import {
  emptyProgress,
  readLocal,
  reward,
  streak,
  type Progress,
  XP,
  migrateProgress,
  complete,
  activityCount,
} from "./services/progress";
import {
  SimulatedConversationService,
  needsReview,
  followUps,
  type Message,
  type Review,
  type BotReply,
} from "./services/conversation";
import { StoryReplay, AudioPlayer } from "./components/StoryReplay";
import "./style.css";
const C = React.createContext<ReturnType<typeof useApp> | null>(null);
function useApp() {
  const [progress, setProgress] = useState<Progress>(() =>
    migrateProgress(readLocal("kita-progress", emptyProgress)),
  );
  const [dialect, setDialect] = useState(() =>
    readLocal("kita-dialect", "Hokkien"),
  );
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [reviews, setReviews] = useState<Review[]>(() =>
    readLocal("kita-reviews", []),
  );
  const [notice, setNotice] = useState<{
    text: string;
    photoId?: string;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  async function refresh() {
    try {
      setPhotos(await storage.photos());
      setStories(await storage.stories());
    } catch {
      setError(
        "Local storage is unavailable. Enable browser storage to save family memories.",
      );
    }
  }
  useEffect(() => {
    storage
      .init()
      .then(refresh)
      .catch(() => setError("Could not open private local storage."))
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    localStorage.setItem("kita-progress", JSON.stringify(progress));
  }, [progress]);
  useEffect(() => {
    localStorage.setItem("kita-dialect", JSON.stringify(dialect));
  }, [dialect]);
  useEffect(() => {
    localStorage.setItem("kita-reviews", JSON.stringify(reviews));
  }, [reviews]);
  return {
    progress,
    setProgress,
    dialect,
    setDialect,
    photos,
    stories,
    reviews,
    setReviews,
    refresh,
    error,
    ready,
    notice,
    setNotice,
    finish: (key: string) => setProgress((p) => complete(p, key)),
    award: (key: string, xp: number) => setProgress((p) => reward(p, key, xp)),
  };
}
function useKita() {
  return React.useContext(C)!;
}
function Back({ title, to = "/lessons" }: { title: string; to?: string }) {
  return (
    <div className="pagehead">
      <Link className="iconbtn" aria-label="Go back" to={to}>
        <ArrowLeft size={19} />
      </Link>
      <h1>{title}</h1>
    </div>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}
function Tile({
  to,
  icon,
  title,
  sub,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <Link to={to} className="tile">
      <span className="tileicon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{sub}</small>
      </span>
      <ChevronRight size={18} />
    </Link>
  );
}
function Art({
  kind = "radio",
  large = false,
}: {
  kind?: string;
  large?: boolean;
}) {
  return (
    <div
      className={`art art-${kind} ${large ? "large" : ""}`}
      role="img"
      aria-label={`Illustration of ${kind}`}
    >
      <div className="sun" />
      {kind === "radio" ? (
        <div className="radio">
          <div className="antenna" />
          <div className="radiotop">
            <span />
            <i />
          </div>
          <div className="radiobottom">
            <div className="speaker" />
            <div className="dial">✦</div>
          </div>
        </div>
      ) : (
        <div className="artemoji">
          {{
            wedding: "💐",
            dinner: "🍲",
            home: "🏘️",
            lantern: "🏮",
            recipe: "🥟",
          }[kind] || "🖼️"}
        </div>
      )}
      <span className="artcaption">A LITTLE PIECE OF OUR STORY</span>
    </div>
  );
}
function BlobImage({ blob, alt }: { blob: Blob; alt: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return <img className="photo" src={url} alt={alt} />;
}
function PhotoArt({ photo }: { photo: Photo }) {
  return photo.image ? (
    <BlobImage blob={photo.image} alt={photo.title} />
  ) : (
    <Art kind={photo.illustration} large />
  );
}
function HomeScreen() {
  const { progress, dialect, stories } = useKita();
  return (
    <>
      <div className="row greeting">
        <span>Good to see you 🌿</span>
        <Link className="language" to="/settings">
          {dialect} <ChevronRight size={13} />
        </Link>
      </div>
      <h1 className="home-title">
        Little words.
        <br />
        <span>Closer hearts.</span>
      </h1>
      <p className="intro">
        A little practice today.
        <br />A meaningful conversation tomorrow.
      </p>
      <div className="stats">
        <Link to="/progress">
          <Flame size={18} /> <b>{streak(progress.days)}</b> day streak
        </Link>
        <span />
        <Link to="/progress">
          <Sparkles size={18} />
          <b>{progress.xp}</b> XP earned
        </Link>
      </div>
      <section className="hero">
        <div className="hero-top">
          <span className="lightpill">LET’S KEEP CONNECTING</span>
          <span>✦</span>
        </div>
        <div className="hero-content">
          <div>
            <h2>
              A song.
              <br />A shared memory.
            </h2>
            <p>
              Discover the music
              <br />
              Grandpa grew up with.
            </p>
          </div>
          <div className="hero-radio">
            📻<span>♫</span>
          </div>
        </div>
        <Link className="button white" to="/topic/music">
          Continue learning <ArrowRight size={17} />
        </Link>
        <div className="hero-foot">MUSIC & SONGS · 3 SHORT ACTIVITIES</div>
      </section>
      <div className="sectiontitle">
        <h2>Make a little time</h2>
        <span>FOR CONNECTION</span>
      </div>
      <div className="quickgrid">
        <Link to="/lessons">
          <BookOpen />
          <strong>Learn a little</strong>
          <small>Words that bring us closer</small>
        </Link>
        <Link to="/topic/music/practice">
          <MessageCircle />
          <strong>Practise with AI</strong>
          <small>Find your confidence</small>
        </Link>
        <Link to="/topic/music/talk">
          <Heart />
          <strong>Talk with an elder</strong>
          <small>Be here, together</small>
        </Link>
        <Link to="/album">
          <Images />
          <strong>Family album</strong>
          <small>Every photo has a story</small>
        </Link>
      </div>
      <div className="sectiontitle">
        <h2>A memory worth sharing</h2>
        <Link to="/album">
          View all <ArrowRight size={13} />
        </Link>
      </div>
      <Link className="memory" to="/photo/radio">
        <Art />
        <div>
          <small>FROM YOUR FAMILY ALBUM</small>
          <h3>Grandpa’s old radio</h3>
          <p>What did he love listening to?</p>
          <span>
            Start a conversation <ArrowRight size={14} />
          </span>
        </div>
      </Link>
      {stories.length > 0 && (
        <Tile
          to="/stories"
          icon={<BookOpen />}
          title={stories[0].title}
          sub="Your latest family story"
        />
      )}
      <div className="footnote">
        <Leaf size={15} /> Made for conversations beyond the screen.
      </div>
    </>
  );
}
function TopicSelection() {
  const { progress, dialect, stories } = useKita();
  return (
    <>
      <Eyebrow>ONE LITTLE CONVERSATION AT A TIME</Eyebrow>
      <h1>
        What shall we
        <br />
        talk about?
      </h1>
      <p>Learn a few words. Discover a whole story.</p>
      {dialect !== "Hokkien" && (
        <div className="notice">
          {dialect} is planned. These lessons demonstrate Hokkien.
        </div>
      )}
      <div className="topicgrid">
        {topics.map((t, i) => (
          <Link key={t.id} to={topicPath(t)} className={`topic ${t.color}`}>
            <div className="topic-emoji">{t.icon}</div>
            <small>TOPIC 0{i + 1}</small>
            <h2>{t.short}</h2>
            <p>{t.description}</p>
            <div className="row">
              <span>{activityCount(progress, t)}/3 activities</span>
              <ArrowRight size={17} />
            </div>
          </Link>
        ))}
      </div>
      <h2 className="space">From your family stories</h2>
      <p className="small">
        Personal vocabulary, selected locally from the words in your memories.
      </p>
      {stories.map((story) => (
        <Tile
          key={story.id}
          to={`/story/${story.id}/lesson`}
          icon={<BookOpen />}
          title={story.title}
          sub={`Inspired by ${story.people}’s memory`}
        />
      ))}
      {!stories.length && (
        <Link className="button secondary full" to="/story/new">
          Save a memory to inspire a lesson
        </Link>
      )}
      <h2 className="space">More connections to come</h2>
      {upcoming.map(([icon, name]) => (
        <div className="upcoming" key={name}>
          <span>
            {icon} {name}
          </span>
          <small>COMING SOON</small>
        </div>
      ))}
    </>
  );
}
function topicPath(t: Topic, activity?: string) {
  return t.storyId
    ? `/story/${t.storyId}/lesson${activity ? "/" + activity : ""}${t.baseTopic ? "?base=" + t.baseTopic : ""}`
    : `/topic/${t.id}${activity ? "/" + activity : ""}`;
}
function LessonDetail({ topic: t }: { topic: Topic }) {
  const { progress } = useKita();
  return (
    <>
      <Back
        title="Your next conversation"
        to={t.storyId ? `/stories/${t.storyId}` : "/lessons"}
      />
      <div className={`topic-banner ${t.color}`}>{t.icon}</div>
      <Eyebrow>HOKKIEN · TOPIC</Eyebrow>
      <h1>{t.name}</h1>
      <p>{t.description}</p>
      <div className="notice subtle">
        Start wherever you feel comfortable. Every activity is open.
      </div>
      {[
        [
          "vocabulary",
          <BookOpen />,
          "Learn vocabulary",
          `${t.words.length} useful words · +${XP.word} XP per correct answer`,
        ],
        [
          "practice",
          <MessageCircle />,
          "Practise with AI",
          "A friendly, simulated conversation",
        ],
        [
          "talk",
          <Heart />,
          "Talk with an elder",
          "Simple prompts. Real connection.",
        ],
      ].map(([path, icon, title, sub], i) => (
        <Tile
          key={String(path)}
          to={topicPath(t, String(path))}
          icon={
            progress.completed.includes(t.id + "-" + path) ? <Check /> : icon
          }
          title={`${i + 1}. ${title}`}
          sub={String(sub)}
        />
      ))}
      <div className="footnote">
        No perfect pronunciation needed. Just a willingness to try.
      </div>
    </>
  );
}
function PhraseView({ phrase: p }: { phrase: Phrase }) {
  return (
    <>
      <div className="chinese">{p.expression}</div>
      <div className="reading-label">SINGAPORE HOKKIEN · READING AID</div>
      <div className="romanisation">{p.singapore}</div>
      <details className="formal-reading">
        <summary>Formal romanisation</summary>
        {p.romanisation}
      </details>
      <h2>{p.meaning}</h2>
      {p.source && (
        <a
          className="source-link"
          href={p.source.url}
          target="_blank"
          rel="noreferrer"
        >
          {p.source.title} ↗
        </a>
      )}
      <p>
        {p.context}{" "}
        <span className="small">
          ⁿ marks a nasal sound; these informal spellings do not show tones.
        </span>
      </p>
      <span className="draft">
        <VolumeX size={14} /> Draft reading aid · tones and household usage vary
      </span>
    </>
  );
}
function VocabularyCards({ topic: t }: { topic: Topic }) {
  const [index, setIndex] = useState(0);
  const [quiz, setQuiz] = useState(false);
  return (
    <>
      <Back title="A few useful words" to={topicPath(t)} />
      {quiz ? (
        <VocabularyQuiz topic={t} />
      ) : (
        <>
          <div className="row">
            <Eyebrow>{t.short}</Eyebrow>
            <span className="small">
              {index + 1} OF {t.words.length}
            </span>
          </div>
          <div className="progressbar">
            <div
              style={{ width: ((index + 1) / t.words.length) * 100 + "%" }}
            />
          </div>
          <div className="wordcard">
            <span className="wordicon">{t.icon}</span>
            <PhraseView phrase={t.words[index]} />
          </div>
          <div className="row">
            <button
              className="button secondary"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              Previous
            </button>
            <button
              className="button"
              onClick={() =>
                index < t.words.length - 1
                  ? setIndex((i) => Math.min(i + 1, t.words.length - 1))
                  : setQuiz(true)
              }
            >
              {index < t.words.length - 1
                ? "Next word"
                : "Try a little practice"}
              <ArrowRight size={17} />
            </button>
          </div>
          <p className="small">
            Lesson content is illustrative and has not been validated by a
            proficient Singapore Hokkien speaker. Ask your family how they say
            it.
          </p>
        </>
      )}
    </>
  );
}
function VocabularyQuiz({ topic: t }: { topic: Topic }) {
  const { award, finish, progress } = useKita();
  const [earned, setEarned] = useState(0);
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [q, setQ] = useState(0);
  const [choice, setChoice] = useState("");
  const [done, setDone] = useState(false);
  const correct = choice === t.words[q].id;
  return done ? (
    <div className="completion">
      <div>🌱</div>
      <Eyebrow>A LITTLE STEP CLOSER</Eyebrow>
      <h1>Look at you grow.</h1>
      <p>You’ve practised {t.words.length} words for your next conversation.</p>
      <span className="xp">
        +{earned} XP this practice · {XP.word} XP per new correct answer
      </span>
      <Link className="button full" to={topicPath(t, "practice")}>
        Try them in a conversation <ArrowRight size={18} />
      </Link>
      <Link to={topicPath(t)}>Back to topic</Link>
    </div>
  ) : (
    <>
      <Eyebrow>
        PRACTICE {q + 1} OF {t.words.length}
      </Eyebrow>
      <h1>
        What does
        <br />
        <span className="romanisation">{t.words[q].singapore}</span> mean?
      </h1>
      <p>
        Choose the English meaning. Earn {XP.word} XP for each new correct
        answer.
      </p>
      {[...t.words].reverse().map((w) => (
        <button
          key={w.id}
          className={`answer ${choice === w.id ? "chosen" : ""}`}
          disabled={correct}
          onClick={() => {
            setChoice(w.id);
            if (w.id === t.words[q].id) {
              const key = `${t.id}:word:${w.id}`;
              const fresh = !progress.rewarded.includes(key);
              if (fresh) setEarned((n) => n + XP.word);
              award(key, XP.word);
              setAnswerFeedback(
                fresh
                  ? `That’s right! +${XP.word} XP for this answer.`
                  : "That’s right! This answer was already rewarded.",
              );
            }
          }}
        >
          {w.meaning}
          {choice === w.id && <Check size={18} />}
        </button>
      ))}
      {choice && (
        <div role="status" className={correct ? "notice success" : "notice"}>
          {correct
            ? answerFeedback
            : "Not quite. Revisit the word and try another answer."}
        </div>
      )}
      <button
        className="button full"
        disabled={!correct}
        onClick={() => {
          if (q === t.words.length - 1) {
            finish(t.id + "-vocabulary");
            setDone(true);
          } else {
            setQ(q + 1);
            setChoice("");
          }
        }}
      >
        {q === t.words.length - 1 ? "Finish practice" : "Next question"}
        <ArrowRight size={17} />
      </button>
    </>
  );
}
const engine = new SimulatedConversationService();
function AIPracticeChat({ topic: t }: { topic: Topic }) {
  const { award, finish, progress } = useKita();
  const [replyCount, setReplyCount] = useState(0);
  const [rewardNote, setRewardNote] = useState("");
  const replySet = useRef(new Set<string>());
  const sending = useRef(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: `Let’s imagine we’re sitting together after dinner. ${(t.baseTopic || t.id) === "music" ? "There’s an old song on the radio. Ask me about the music I grew up with." : (t.baseTopic || t.id) === "food" ? "I’ve just made a family recipe. What would you like to ask?" : "We’re looking through childhood photographs. Ask me about the old days."}`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);
  async function send(value: string) {
    if (!value.trim() || sending.current) return;
    sending.current = true;
    setInput("");
    setBusy(true);
    try {
      const reason = needsReview(value);
      const fallback: BotReply = {
        text: "This expression needs verification. I can’t reliably interpret this topic. You can choose a prepared question or ask a trusted fluent speaker.",
      };
      const candidate = reason
        ? fallback
        : await engine.respond(t, messages, value);
      const withheld =
        !!reason ||
        !!needsReview(
          candidate.text + " " + (candidate.hokkien?.meaning || ""),
        );
      const response = withheld ? fallback : candidate;
      setMessages((m) => [
        ...m,
        { role: "user", text: value },
        { role: "assistant", ...response },
      ]);
      const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
      const coaching =
        /\b(mean|clarify|clarification|help|correct|wrong)\b/i.test(value);
      if (
        !withheld &&
        !coaching &&
        !replySet.current.has(normalized) &&
        replySet.current.size < XP.practiceReplies
      ) {
        const turn = replySet.current.size;
        replySet.current.add(normalized);
        setReplyCount(replySet.current.size);
        const key = `${t.id}:reply:${turn}`;
        const fresh = !progress.rewarded.includes(key);
        award(key, XP.reply);
        setRewardNote(
          fresh
            ? `+${XP.reply} XP for this practice reply`
            : "This reply milestone was already rewarded.",
        );
        if (replySet.current.size === XP.practiceReplies)
          finish(t.id + "-practice");
      } else
        setRewardNote(
          withheld
            ? "No XP for a withheld reply."
            : coaching
              ? "Hints are always free; try a conversation reply next."
              : "Keep practising. Repeated replies and replies beyond three do not add XP.",
        );
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Practice is unavailable right now. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
      sending.current = false;
    }
  }

  return (
    <>
      <Back title="A little rehearsal" to={topicPath(t)} />
      <div className="chatperson">
        <span>🌻</span>
        <div>
          <h2>Your practice companion</h2>
          <small>Simulated AI · {t.short}</small>
        </div>
      </div>
      <div className="notice subtle">
        A safe place to try. Scripted responses, not a real grandparent or
        language expert.
      </div>
      <div className="chat">
        {messages.map((m, i) => (
          <div key={i} className={"bubble " + m.role}>
            {m.hokkien && (
              <div className="bot-hokkien">
                <span lang="nan">{m.hokkien.expression}</span>
                <strong>{m.hokkien.singapore}</strong>
                <span>{m.hokkien.meaning}</span>
                <small>Draft translation · Singapore reading aid</small>
              </div>
            )}
            <div>{m.text}</div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="suggestions">
        {t.prompts.slice(0, 2).map((p) => (
          <button
            key={p.id}
            onClick={() => send(p.singapore + " — " + p.meaning)}
          >
            {p.meaning}
          </button>
        ))}
        <button onClick={() => send("Please clarify the phrase")}>
          Help me understand
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="chatinput"
      >
        <input
          aria-label="Your message"
          placeholder="English, Hokkien, or a little of both…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button disabled={busy || !input.trim()} aria-label="Send message">
          <Send size={19} />
        </button>
      </form>
      <details>
        <summary>Keep a few words nearby</summary>
        {t.words.map((w) => (
          <p key={w.id}>
            <strong>{w.singapore}</strong> · {w.meaning}
          </p>
        ))}
      </details>
      <p className="small">
        {messages.filter((m) => m.role === "user").length} replies practised ·
        keep going at your own pace. {replyCount}/{XP.practiceReplies} distinct
        replies this visit.
        <span role="status">{rewardNote}</span>
      </p>
      <Link className="button full" to={topicPath(t, "talk")}>
        Ready for a real conversation <Heart size={17} />
      </Link>
    </>
  );
}
function ConversationCueCards({ topic: t }: { topic: Topic }) {
  const { progress, setProgress, award, finish, setNotice } = useKita();
  const navigate = useNavigate();
  const sessionId = useRef(crypto.randomUUID());
  const submitted = useRef(false);
  const location = useLocation();
  const photoId = new URLSearchParams(location.search).get("photo");
  const initial = Number(new URLSearchParams(location.search).get("cue") || 0);
  const [index, setIndex] = useState(
    Number.isFinite(initial)
      ? Math.max(0, Math.min(initial, t.prompts.length - 1))
      : 0,
  );
  const [help, setHelp] = useState(false);
  const [summary, setSummary] = useState("");
  const [follow, setFollow] = useState<string[]>([]);
  const p = t.prompts[index];
  return (
    <>
      <Back
        title="Together time"
        to={photoId ? "/photo/" + photoId : topicPath(t)}
      />
      <div className="row">
        <Eyebrow>LIVE CONVERSATION</Eyebrow>
        <Heart size={18} />
      </div>
      <h1>
        A question.
        <br />A moment together.
      </h1>
      <p>
        Take a look, then give them your attention.
        <br />
        There’s no hurry here.
      </p>
      <div className="cuecard">
        <div className="row">
          <small>
            QUESTION {index + 1} / {t.prompts.length}
          </small>
          <button
            className="iconbtn"
            aria-label="Favourite prompt"
            aria-pressed={progress.favourites.includes(p.id)}
            onClick={() =>
              setProgress({
                ...progress,
                favourites: progress.favourites.includes(p.id)
                  ? progress.favourites.filter((x) => x !== p.id)
                  : [...progress.favourites, p.id],
              })
            }
          >
            <Star
              size={20}
              fill={progress.favourites.includes(p.id) ? "#e7ba56" : "none"}
            />
          </button>
        </div>
        <PhraseView phrase={p} />
      </div>
      <div className="row">
        <button
          className="button secondary"
          disabled={!index}
          onClick={() => setIndex(index - 1)}
        >
          Previous
        </button>
        <button
          className="button secondary"
          disabled={index === t.prompts.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          Next question <ArrowRight size={16} />
        </button>
      </div>
      <details>
        <summary>A discreet word reference</summary>
        {t.words.map((w) => (
          <p key={w.id}>
            {w.singapore} · {w.meaning}
          </p>
        ))}
      </details>
      <button className="textbutton" onClick={() => setHelp(!help)}>
        <Sparkles size={15} /> Help me find a follow-up
      </button>
      {help && (
        <div className="card">
          <label>
            A short English summary
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Grandpa remembers listening with his sister…"
            />
          </label>
          <button
            className="button full secondary"
            disabled={!summary.trim()}
            onClick={() =>
              setFollow(
                needsReview(summary)
                  ? [
                      "This expression needs verification. Ask a trusted fluent speaker before interpreting a sensitive memory.",
                    ]
                  : followUps(summary),
              )
            }
          >
            Suggest follow-ups
          </button>
          {follow.map((f) => (
            <p className="follow" key={f}>
              {f}
            </p>
          ))}
          <p className="small">
            Rules-based English suggestions. No unverified Hokkien translation
            is generated.
          </p>
        </div>
      )}
      <button
        className="button full"
        onClick={() => {
          if (submitted.current) return;
          submitted.current = true;
          award(`${t.id}:talk:${sessionId.current}`, XP.conversation);
          finish(t.id + "-talk");
          setNotice({
            text: `A little closer. Conversation saved · +${XP.conversation} XP.`,
            photoId: photoId || undefined,
          });
          navigate("/");
        }}
      >
        We had a conversation <Check size={17} />
      </button>
      {photoId && (
        <Link
          className="button full secondary"
          to={"/story/new?photo=" + photoId}
        >
          Save a memory, if you’d like
        </Link>
      )}
      <p className="footnote">
        No recording, timers, or quizzes. Just the two of you.
      </p>
    </>
  );
}
function FamilyAlbum() {
  const { photos, stories } = useKita();
  return (
    <>
      <div className="row">
        <Eyebrow>KEPT CLOSE, JUST FOR FAMILY</Eyebrow>
        <Lock size={16} />
      </div>
      <h1>
        Every photo.
        <br />
        <span>A story to share.</span>
      </h1>
      <p>Start with a memory. See where it takes you.</p>
      <div className="row albumactions">
        <Link className="button" to="/photo/new">
          <Plus size={17} /> Add a photo
        </Link>
        <Link className="button secondary" to="/stories">
          Stories · {stories.length}
        </Link>
      </div>
      <Link className="button full secondary" to="/story/new">
        <BookOpen size={17} /> Save a story without a photo
      </Link>
      <div className="photogrid">
        {photos.map((p) => (
          <Link className="photocard" key={p.id} to={"/photo/" + p.id}>
            <PhotoArt photo={p} />
            <div>
              <h3>{p.title}</h3>
              <small>{p.people}</small>
            </div>
          </Link>
        ))}
      </div>
      {!photos.length && (
        <div className="card">
          <h2>Your memories begin here</h2>
          <p>Add a photograph to start a conversation.</p>
        </div>
      )}
      <p className="footnote">
        <Lock size={13} /> Private on this browser. Sample images are
        illustrations.
      </p>
    </>
  );
}
function PhotoDetail() {
  const { id } = useParams();
  const { photos, refresh } = useKita();
  const navigate = useNavigate();
  const p = photos.find((p) => p.id === id);
  if (!p)
    return (
      <>
        <Back title="Photo unavailable" to="/album" />
        <p>Open the album to choose a memory.</p>
      </>
    );
  const t = topics.find((t) => t.id === p.topic)!;
  return (
    <>
      <Back title="A family memory" to="/album" />
      <PhotoArt photo={p} />
      <Eyebrow>{p.people}</Eyebrow>
      <h1>{p.title}</h1>
      <p>{p.description}</p>
      <div className="row">
        <Link className="textbutton" to={"/photo/" + id + "/edit"}>
          Edit details
        </Link>
        <button
          className="textbutton danger"
          onClick={async () => {
            if (
              confirm(
                "Delete this photograph and its linked stories from this browser?",
              )
            ) {
              await storage.deletePhoto(p.id);
              await refresh();
              navigate("/album");
            }
          }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
      <h2 className="space">Let the story begin</h2>
      <p className="small">Topic-based conversation starters · draft Hokkien</p>
      {t.prompts.map((q, i) => (
        <Link
          className="promptlink"
          key={q.id}
          to={`/topic/${t.id}/talk?photo=${id}&cue=${i}`}
        >
          <strong>{q.meaning}</strong>
          <span>{q.expression}</span>
          <small>{q.singapore}</small>
          <ArrowRight size={16} />
        </Link>
      ))}
      <Link className="button full" to={"/story/new?photo=" + id}>
        Save a family story <BookOpen size={17} />
      </Link>
      <Link className="button full secondary" to={"/stories?photo=" + id}>
        View stories from this photo
      </Link>
    </>
  );
}
function PhotoEditor() {
  const { id } = useParams();
  const { photos, refresh } = useKita();
  const existing = photos.find((p) => p.id === id);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const file = f.get("image") as File;
    const image = file?.size ? file : existing?.image;
    if (
      file?.size &&
      (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024)
    ) {
      setError("Choose an image smaller than 10 MB.");
      return;
    }
    try {
      const photo: Photo = {
        id: existing?.id || crypto.randomUUID(),
        title: String(f.get("title")).trim(),
        description: String(f.get("description")),
        people: String(f.get("people")),
        topic: String(f.get("topic")),
        image,
        illustration: existing?.illustration,
      };
      await storage.photo(photo);
      await refresh();
      navigate("/photo/" + photo.id);
    } catch {
      setError("Could not save. Your browser may be out of storage.");
    }
  }
  return (
    <>
      <Back
        title={existing ? "Edit photo" : "Add a little memory"}
        to="/album"
      />
      <p>Choose a photograph everyone is comfortable keeping here.</p>
      <form className="form" onSubmit={submit}>
        <label>
          Photograph
          <input
            name="image"
            type="file"
            accept="image/*"
            required={!existing}
          />
        </label>
        <label>
          Photo title
          <input
            name="title"
            defaultValue={existing?.title}
            required
            maxLength={100}
          />
        </label>
        <label>
          Description
          <textarea name="description" defaultValue={existing?.description} />
        </label>
        <label>
          People (comma separated)
          <input name="people" defaultValue={existing?.people} />
        </label>
        <label>
          Conversation topic
          <select name="topic" defaultValue={existing?.topic || "music"}>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input type="checkbox" required /> I have permission from the people
          pictured. For children, a parent or guardian has agreed.
        </label>
        {error && <p role="alert">{error}</p>}
        <button className="button full">
          Save privately <Lock size={16} />
        </button>
      </form>
    </>
  );
}
function StoryEditor() {
  const { id } = useParams();
  const { stories, photos, refresh } = useKita();
  const existing = stories.find((s) => s.id === id);
  const photoId =
    new URLSearchParams(useLocation().search).get("photo") ||
    existing?.photoId ||
    "";
  const photo = photos.find((p) => p.id === photoId);
  const navigate = useNavigate();
  const [audio, setAudio] = useState<Blob | undefined>(existing?.audio);
  const [consent, setConsent] = useState(false);
  const consentRef = useRef(false);
  const [recording, setRecording] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
      if (recorder.current?.state === "recording") recorder.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  async function record() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    if (!consentRef.current || mediaBusy) return;
    setMediaBusy(true);
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw Error();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current || !consentRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const r = new MediaRecorder(stream);
      recorder.current = r;
      const parts: BlobPart[] = [];
      r.ondataavailable = (e) => parts.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (mounted.current) {
          const blob = new Blob(parts, { type: r.mimeType });
          if (consentRef.current && blob.size) setAudio(blob);
          setRecording(false);
        }
      };
      r.onerror = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (mounted.current) {
          setRecording(false);
          setError(
            "Recording stopped unexpectedly. Please try again or save a text memory.",
          );
        }
      };
      r.start();
      setRecording(true);
    } catch {
      if (mounted.current)
        setError(
          "Microphone unavailable or permission declined. You can save a text story.",
        );
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } finally {
      if (mounted.current) setMediaBusy(false);
    }
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving || recording || mediaBusy) return;
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title")).trim(),
      text = String(f.get("text")).trim(),
      people = String(f.get("people")).trim();
    if (!title || !text || !people) {
      setError("Add a title, description and storyteller.");
      return;
    }
    if (audio && audio !== existing?.audio && !consentRef.current) {
      setError("Confirm recording permission or remove the new recording.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const story: Story = {
        ...existing,
        id: existing?.id || crypto.randomUUID(),
        photoId,
        title,
        text,
        people,
        summary: existing?.summary || "",
        transcript: existing?.transcript || "",
        topic:
          inferTopic(title + " " + text) ||
          existing?.topic ||
          photo?.topic ||
          "",
        audio,
      };
      await storage.story(story);
      await refresh();
      navigate("/stories/" + story.id);
    } catch {
      setError("Could not save this story. Check browser storage.");
      setSaving(false);
    }
  }
  if (id && !existing) return <Back title="Story unavailable" to="/stories" />;
  return (
    <>
      <Back
        title="Keep a little of their story"
        to={photoId ? "/photo/" + photoId : "/stories"}
      />
      <p>Just a title, a memory, and the person who shared it.</p>
      <form className="form" onSubmit={save}>
        <label>
          Story title
          <input
            name="title"
            required
            maxLength={150}
            defaultValue={existing?.title}
          />
        </label>
        <label>
          Description
          <textarea
            aria-label="Description"
            name="text"
            required
            defaultValue={existing?.text}
            rows={5}
            placeholder="What would you like to remember?"
          />
        </label>
        <label>
          Storyteller
          <input
            name="people"
            required
            maxLength={150}
            defaultValue={existing?.people || photo?.people}
            placeholder="e.g. Grandpa Tan"
          />
        </label>
        <p className="small">
          Save with the storyteller’s permission. These memories stay on this
          browser; saving or recording earns no XP.
        </p>
        <details className="recording-options">
          <summary>Add a recording (optional)</summary>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                consentRef.current = e.target.checked;
                if (!e.target.checked) {
                  if (recorder.current?.state === "recording")
                    recorder.current.stop();
                  if (audio !== existing?.audio) setAudio(existing?.audio);
                }
              }}
            />{" "}
            Everyone involved agrees to this recording. A parent or guardian
            agrees for children.
          </label>
          <button
            type="button"
            className="button secondary full"
            disabled={(!consent && !recording) || mediaBusy}
            onClick={record}
          >
            {recording ? <Square size={16} /> : <Mic size={16} />}{" "}
            {mediaBusy
              ? "Opening microphone…"
              : recording
                ? "Stop recording"
                : "Record audio (optional)"}
          </button>
          <label>
            Or attach an existing recording
            <input
              type="file"
              accept="audio/*"
              disabled={!consent || recording || mediaBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (
                  !file.type.startsWith("audio/") ||
                  file.size > 25 * 1024 * 1024
                ) {
                  setError("Choose an audio file smaller than 25 MB.");
                  e.target.value = "";
                  return;
                }
                setError("");
                setAudio(file);
              }}
            />
          </label>
          <p className="small">
            No automatic transcription. Your original audio is saved locally,
            ready to replay.
          </p>
        </details>
        {audio && (
          <>
            <AudioPlayer blob={audio} />
            <button
              type="button"
              className="textbutton danger"
              disabled={recording || mediaBusy}
              onClick={() => setAudio(undefined)}
            >
              Remove recording
            </button>
          </>
        )}
        {error && <p role="alert">{error}</p>}
        <button
          disabled={recording || mediaBusy || saving}
          className="button full"
        >
          {saving ? "Saving…" : "Save story privately"} <Lock size={16} />
        </button>
      </form>
    </>
  );
}
function StoryLibrary() {
  const { stories, photos } = useKita();
  const [person, setPerson] = useState("");
  const [topic, setTopic] = useState("");
  const [photo, setPhoto] = useState(
    new URLSearchParams(useLocation().search).get("photo") || "",
  );
  const filtered = stories.filter(
    (s) =>
      (!person || s.people.toLowerCase().includes(person.toLowerCase())) &&
      (!topic || s.topic === topic) &&
      (!photo || s.photoId === photo),
  );
  return (
    <>
      <Back title="Our little story library" to="/album" />
      <p>Words and memories, kept close.</p>
      <Link className="button full" to="/story/new">
        <Plus size={16} /> Save a story
      </Link>
      <details>
        <summary>Find a memory</summary>
        <div className="filters">
          <label>
            Storyteller
            <input
              placeholder="Filter by name"
              value={person}
              onChange={(e) => setPerson(e.target.value)}
            />
          </label>
          <label>
            Topic
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.short}
                </option>
              ))}
            </select>
          </label>
          <label>
            Photograph
            <select value={photo} onChange={(e) => setPhoto(e.target.value)}>
              <option value="">All photographs</option>
              {photos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </details>
      {filtered.map((s) => (
        <div className="story-library-card" key={s.id}>
          <Tile
            to={"/stories/" + s.id}
            icon={<BookOpen />}
            title={s.title}
            sub={`Told by ${s.people}`}
          />
          <div className="row">
            <Link className="textbutton" to={"/stories/" + s.id + "#replay"}>
              <Headphones size={15} /> Replay story
            </Link>
            <Link className="textbutton" to={`/story/${s.id}/lesson`}>
              <Sparkles size={15} /> Practise story words
            </Link>
          </div>
        </div>
      ))}
      {!stories.length && (
        <div className="empty">
          <span>🌱</span>
          <h2>Room for your first story</h2>
          <p>
            A conversation is enough on its own. Save a memory whenever you’re
            ready.
          </p>
          <Link className="button" to="/story/new">
            Save your first memory
          </Link>
        </div>
      )}
      {!!stories.length && !filtered.length && (
        <p role="status">No memories match these filters.</p>
      )}
    </>
  );
}
function StoryDetail() {
  const { id } = useParams();
  const { stories, refresh } = useKita();
  const navigate = useNavigate();
  const s = stories.find((s) => s.id === id);
  const replayRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useEffect(() => {
    if (location.hash === "#replay")
      replayRef.current?.scrollIntoView({ block: "start" });
  }, [location.hash]);
  if (!s) return <Back title="Story unavailable" to="/stories" />;
  return (
    <>
      <Back title="A story to keep" to="/stories" />
      <Eyebrow>Told by {s.people}</Eyebrow>
      <h1>{s.title}</h1>
      <div className="card storytext">{s.text}</div>
      <div id="replay" ref={replayRef}>
        <StoryReplay key={s.id} text={s.text} audio={s.audio} />
      </div>
      {(s.summary || s.transcript) && (
        <details>
          <summary>Earlier saved notes</summary>
          {s.summary && (
            <>
              <h2>Summary</h2>
              <p className="storytext">{s.summary}</p>
            </>
          )}
          {s.transcript && (
            <>
              <h2>Manual transcript</h2>
              <p className="storytext">{s.transcript}</p>
            </>
          )}
        </details>
      )}
      <Link className="button full" to={`/story/${s.id}/lesson`}>
        <Sparkles size={17} /> Practise words from this story
      </Link>
      <Link className="button full secondary" to={"/story/" + id + "/edit"}>
        Edit story
      </Link>
      <button
        className="button secondary full danger"
        onClick={async () => {
          if (confirm("Delete this story and its recording?")) {
            await storage.deleteStory(s.id);
            await refresh();
            navigate("/stories");
          }
        }}
      >
        Delete story
      </button>
    </>
  );
}
function StoryLessonScreen() {
  const { id, activity } = useParams();
  const { stories } = useKita();
  const navigate = useNavigate();
  const location = useLocation();
  const fallback = new URLSearchParams(location.search).get("base") || "";
  const story = stories.find((s) => s.id === id);
  if (!story)
    return (
      <>
        <Back title="Memory not found" to="/stories" />
        <p>This story may have been deleted.</p>
      </>
    );
  const lesson = storyLesson(story, fallback);
  if (!lesson)
    return (
      <>
        <Back title="Words from your memory" to={"/stories/" + id} />
        <h1>A starting point for this story</h1>
        <p>
          We don’t yet have matching vocabulary for this memory. Choose a
          starting topic to build a practice from the existing phrase bank.
        </p>
        {topics.map((t) => (
          <button
            key={t.id}
            className="button full secondary"
            onClick={() => navigate(location.pathname + "?base=" + t.id)}
          >
            {t.icon} {t.name}
          </button>
        ))}
      </>
    );
  return (
    <>
      <div className="notice subtle">
        Inspired by “{story.title}”, told by {story.people}. Private, local word
        matching; this does not translate the story.
      </div>
      {activity === "vocabulary" ? (
        <VocabularyCards key={lesson.id} topic={lesson} />
      ) : activity === "practice" ? (
        <AIPracticeChat key={lesson.id} topic={lesson} />
      ) : activity === "talk" ? (
        <ConversationCueCards key={lesson.id} topic={lesson} />
      ) : (
        <LessonDetail topic={lesson} />
      )}
    </>
  );
}

function ProgressScreen() {
  const { progress } = useKita();
  return (
    <>
      <Back title="Every little step counts" to="/" />
      <div className="completion">
        <span>🌿</span>
        <h1>{progress.xp} XP</h1>
        <p>
          {streak(progress.days)} day streak · {progress.completed.length}{" "}
          activities completed
        </p>
      </div>
      {topics.map((t) => (
        <div className="card" key={t.id}>
          <h2>
            {t.icon} {t.short}
          </h2>
          <div className="progressbar">
            <div
              style={{
                width: (activityCount(progress, t) / 3) * 100 + "%",
              }}
            />
          </div>
          <p>{activityCount(progress, t)} of 3 activities</p>
        </div>
      ))}
      <h2>Little milestones</h2>
      <div className="card">
        {progress.xp >= 20
          ? "🌟 First words learned"
          : "○ First words · complete a vocabulary practice"}
      </div>
      <div className="card">
        {progress.completed.some((k) => k.endsWith("talk"))
          ? "💚 A real connection made"
          : "○ Together time · try a conversation"}
      </div>
      <p className="small">
        XP celebrates learning and voluntary conversations. Recording or sharing
        family information never earns points.
      </p>
    </>
  );
}
function SettingsScreen() {
  const { dialect, setDialect, setProgress, refresh, setReviews } = useKita();
  return (
    <>
      <Back title="Make yourself at home" to="/" />
      <h2>Your dialect</h2>
      <label>
        Learning language
        <select value={dialect} onChange={(e) => setDialect(e.target.value)}>
          <option>Hokkien</option>
          <option>Teochew</option>
          <option>Cantonese</option>
        </select>
      </label>
      <p>
        {dialect === "Hokkien"
          ? "Hokkien is our demonstration language. Household and regional usage varies."
          : dialect +
            " is planned. Only Hokkien lessons are available in this prototype."}
      </p>
      <Tile
        to="/progress"
        icon={<Sparkles />}
        title="Your little steps"
        sub="Progress, streaks and milestones"
      />
      <h2 className="space">Private, by default</h2>
      <p>
        Your photos, recordings and stories stay in this browser. Nothing is
        sent to AI providers or reviewers. Clearing browser data removes these
        memories; this prototype has no cloud backup.
      </p>
      <p>
        AI practice and follow-ups are simulations. Dialect content is
        unverified draft material; no synthetic pronunciation or live Hokkien
        transcription is provided.
      </p>
      <p>
        Optional description read-aloud uses your device’s English or Mandarin
        voice, which may rely on its online speech service. It is never
        presented as original audio or Hokkien pronunciation.
      </p>
      <p>
        A future review service could allow authorised people to see flagged
        material, with explicit consent and appropriate access controls. The
        current review demonstration uses synthetic content only. Family
        information is never automatically used for model training.
      </p>
      <p>
        Ask everyone before saving a story or recording, and obtain parent or
        guardian permission for children. You can delete each photo, story and
        recording.
      </p>
      <button
        className="button secondary full danger"
        onClick={async () => {
          if (
            confirm(
              "Permanently delete all local photos, stories, audio, progress and settings?",
            )
          ) {
            await storage.clear();
            localStorage.removeItem("kita-progress");
            setProgress(emptyProgress);
            setDialect("Hokkien");
            setReviews([]);
            await refresh();
          }
        }}
      >
        Delete all local data
      </button>
      <div className="footnote">
        KITA · NH0007 demonstration
        <br />
        Technology that brings us back to each other.
      </div>
    </>
  );
}
function InternalReview() {
  const { reviews, setReviews } = useKita();
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  function decide(id: string, status: "approved" | "rejected") {
    const correction = corrections[id] || "";
    setReviews(
      reviews.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              correction: status === "approved" ? correction : "",
              decisions: [
                ...r.decisions,
                {
                  action:
                    status === "approved"
                      ? correction
                        ? "Corrected and approved"
                        : "Approved"
                      : "Rejected",
                  at: new Date().toISOString(),
                },
              ],
            }
          : r,
      ),
    );
  }
  return (
    <>
      <Back title="Internal review demo" to="/" />
      <div className="notice">
        Development simulation only. No authentication or external review
        service is connected. Use synthetic content only.
      </div>
      <button
        className="button full"
        onClick={() =>
          setReviews([
            ...reviews,
            {
              id: crypto.randomUUID(),
              original: "Synthetic ambiguous family honorific",
              proposed: "An uncertain demonstration translation",
              reason: "Low translation confidence; cultural honorific",
              status: "pending",
              correction: "",
              decisions: [],
            },
          ])
        }
      >
        Create synthetic review request
      </button>
      {reviews.map((r) => (
        <div className="card" key={r.id}>
          <Eyebrow>{r.status}</Eyebrow>
          <h2>{r.original}</h2>
          <p>Proposed: {r.proposed}</p>
          <p>Reason: {r.reason}</p>
          {r.status === "pending" ? (
            <>
              <div className="notice">
                Output withheld. If no reviewer is available, the user sees a
                verification fallback.
              </div>
              <label>
                Human correction or replacement
                <textarea
                  value={corrections[r.id] || ""}
                  onChange={(e) =>
                    setCorrections({ ...corrections, [r.id]: e.target.value })
                  }
                />
              </label>
              <div className="row">
                <button
                  className="button"
                  onClick={() => decide(r.id, "approved")}
                >
                  Approve / replace
                </button>
                <button
                  className="button secondary"
                  onClick={() => decide(r.id, "rejected")}
                >
                  Reject
                </button>
              </div>
            </>
          ) : (
            <p>
              {r.status === "approved"
                ? "Released (simulation): " + (r.correction || r.proposed)
                : "Output rejected. Verification fallback retained."}
            </p>
          )}
          {r.decisions.map((d, i) => (
            <p className="small" key={i}>
              {d.action} · {d.at}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}
function TopicRoute({ activity }: { activity?: string }) {
  const { id } = useParams();
  const t = topics.find((t) => t.id === id);
  if (!t)
    return (
      <>
        <Back title="Topic not found" />
        <Link to="/lessons">Explore lessons</Link>
      </>
    );
  return activity === "vocabulary" ? (
    <VocabularyCards key={id} topic={t} />
  ) : activity === "practice" ? (
    <AIPracticeChat key={id} topic={t} />
  ) : activity === "talk" ? (
    <ConversationCueCards key={id} topic={t} />
  ) : (
    <LessonDetail topic={t} />
  );
}
function Shell() {
  const app = useApp();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <C.Provider value={app}>
      <div className="app">
        <header>
          <Link to="/" className="brand">
            kita<span className="brandflower">✳</span>
          </Link>
          <span className="brandtag">closer, together</span>
          <Link className="iconbtn" to="/settings" aria-label="Settings">
            <Settings size={20} />
          </Link>
        </header>
        <main ref={mainRef}>
          {app.error && (
            <div role="alert" className="notice">
              {app.error}
            </div>
          )}
          {app.ready ? (
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/lessons" element={<TopicSelection />} />
              <Route path="/topic/:id" element={<TopicRoute />} />
              {["vocabulary", "practice", "talk"].map((a) => (
                <Route
                  key={a}
                  path={"/topic/:id/" + a}
                  element={<TopicRoute activity={a} />}
                />
              ))}
              <Route path="/album" element={<FamilyAlbum />} />
              <Route path="/photo/new" element={<PhotoEditor />} />
              <Route path="/photo/:id" element={<PhotoDetail />} />
              <Route path="/photo/:id/edit" element={<PhotoEditor />} />
              <Route path="/story/new" element={<StoryEditor />} />
              <Route path="/story/:id/lesson" element={<StoryLessonScreen />} />
              <Route
                path="/story/:id/lesson/:activity"
                element={<StoryLessonScreen />}
              />
              <Route path="/story/:id/edit" element={<StoryEditor />} />
              <Route path="/stories" element={<StoryLibrary />} />
              <Route path="/stories/:id" element={<StoryDetail />} />
              <Route path="/progress" element={<ProgressScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/internal/review" element={<InternalReview />} />
              <Route
                path="*"
                element={
                  <>
                    <Back title="Let’s find our way home" to="/" />
                    <Link to="/">Go home</Link>
                  </>
                }
              />
            </Routes>
          ) : (
            <p role="status">Opening your little corner of KITA…</p>
          )}
        </main>
        {app.notice && (
          <div className="app-notice" role="status" aria-live="polite">
            <strong>{app.notice.text}</strong>
            {app.notice.photoId && (
              <Link
                to={"/story/new?photo=" + app.notice.photoId}
                onClick={() => app.setNotice(null)}
              >
                Save a memory (optional)
              </Link>
            )}
            <button
              aria-label="Dismiss notification"
              onClick={() => app.setNotice(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        <nav aria-label="Main navigation">
          {[
            ["/", Home, "Home"],
            ["/lessons", BookOpen, "Lessons"],
            ["/album", Images, "Family Album"],
          ].map(([to, Icon, label]) => {
            const I = Icon as typeof Home;
            const active =
              location.pathname === to ||
              (to === "/lessons" &&
                (location.pathname.startsWith("/topic") ||
                  location.pathname.includes("/lesson"))) ||
              (to === "/album" &&
                /photo|stor/.test(location.pathname) &&
                !location.pathname.includes("/lesson"));
            return (
              <Link
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                key={String(to)}
                to={String(to)}
              >
                <I size={21} />
                <span>{String(label)}</span>
                {active && <i />}
              </Link>
            );
          })}
        </nav>
      </div>
    </C.Provider>
  );
}
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Shell />
  </BrowserRouter>,
);
if ("serviceWorker" in navigator && import.meta.env.PROD)
  window.addEventListener("load", () =>
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => console.warn("Offline support unavailable")),
  );
