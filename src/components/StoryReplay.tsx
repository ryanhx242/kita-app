import { useEffect, useRef, useState } from "react";
import { Headphones, Play, Square } from "lucide-react";
export function AudioPlayer({ blob }: { blob: Blob }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const value = URL.createObjectURL(blob);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [blob]);
  return (
    <audio
      aria-label="Original story recording"
      controls
      preload="metadata"
      src={url}
    />
  );
}
export function StoryReplay({ text, audio }: { text: string; audio?: Blob }) {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  const ownsSpeech = useRef(false);
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;
  useEffect(
    () => () => {
      if (ownsSpeech.current) window.speechSynthesis?.cancel();
    },
    [],
  );
  function stop() {
    window.speechSynthesis.cancel();
    ownsSpeech.current = false;
    setSpeaking(false);
  }
  function read() {
    if (!supported) return;
    setError("");
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = /[\u3400-\u9fff]/.test(text) ? "zh-CN" : "en-SG";
    u.onend = () => {
      ownsSpeech.current = false;
      setSpeaking(false);
    };
    u.onerror = (e) => {
      ownsSpeech.current = false;
      setSpeaking(false);
      if (e.error !== "canceled" && e.error !== "interrupted")
        setError(
          "Device read-aloud is unavailable. You can still read the description or replay an original recording.",
        );
    };
    ownsSpeech.current = true;
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }
  return (
    <section className="card" aria-label="Replay story">
      <h2>
        <Headphones size={19} /> Replay this memory
      </h2>
      {audio ? (
        <>
          <p className="small">
            Original recording · listen, pause, seek, or play again.
          </p>
          <AudioPlayer blob={audio} />
        </>
      ) : (
        <p className="small">
          No original recording was saved. You can add one in Edit story.
        </p>
      )}
      <button
        className="button secondary full"
        disabled={!supported || !text.trim()}
        onClick={speaking ? stop : read}
      >
        {speaking ? <Square size={16} /> : <Play size={16} />}{" "}
        {speaking ? "Stop reading" : "Read description aloud"}
      </button>
      <p className="small">
        Optional device voice, not the storyteller’s voice or a Hokkien
        pronunciation guide. English or Mandarin voice availability depends on
        your browser; your device may use an online speech service.
      </p>
      {!supported && (
        <p className="small">
          This browser does not support read-aloud. Original recordings still
          use the audio player above.
        </p>
      )}
      {error && <p role="status">{error}</p>}
    </section>
  );
}
