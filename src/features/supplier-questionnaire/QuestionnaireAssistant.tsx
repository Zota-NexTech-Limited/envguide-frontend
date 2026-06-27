import React, { useEffect, useRef, useState, useCallback } from "react";
import { getApiBaseUrl } from "../../lib/apiBaseUrl";
import type { QuestionnaireSection } from "../../config/questionnaireSchema";
import { SECTION_HELP, FIELD_HELP } from "../../config/questionnaireHelp";
import "./QuestionnaireAssistant.css";

/**
 * Eco AI assistant for the supplier questionnaire.
 *
 * Two ways for a supplier to get help while filling the form, they pick which:
 *   • Chat  — type a question, grounded in the section they're on.
 *   • Voice — talk to the assistant (Groq Whisper STT) and hear it reply
 *             (cloud TTS when configured, browser voice otherwise).
 *
 * Both modes call the same context-aware /api/ai-chat brain, so the answers
 * always know which questions the supplier is currently looking at.
 */

type Mode = "chat" | "voice";
type VoiceState = "idle" | "recording" | "processing" | "speaking";
interface Msg {
  role: "user" | "ai";
  text: string;
}

interface Props {
  section: QuestionnaireSection;
  stepIndex: number;
  totalSteps: number;
}

// Build the context string handed to the AI so its replies are about the exact
// questions on screen. Uses the curated guidance where we have it.
function buildContext(section: QuestionnaireSection): string {
  const lines: string[] = [`Section: ${section.title}`];
  const sh = SECTION_HELP[section.id];
  if (sh) {
    lines.push(`About this section: ${sh.summary}`);
    if (sh.whereToFind) lines.push(`Where to find the data: ${sh.whereToFind}`);
  }
  const questions = section.fields.filter((f) => f.type !== "info" && f.label);
  if (questions.length) {
    lines.push("Questions in this section:");
    for (const f of questions) {
      let line = `- ${f.label}`;
      const fh = FIELD_HELP[f.name];
      if (fh?.plain) line += ` | meaning: ${fh.plain}`;
      if (fh?.whereToFind) line += ` | where to find it: ${fh.whereToFind}`;
      if (fh?.example) line += ` | example: ${fh.example}`;
      lines.push(line);
    }
  }
  return lines.join("\n");
}

// The assistant should never speak with em/en dashes — normalise to commas.
const cleanReply = (text: string) => (text || "").replace(/\s*[—–]\s*/g, ", ");

const SUGGESTIONS = [
  "Explain this section simply",
  "Where do I find this data?",
  "Give me an example answer",
  "I don't have exact numbers",
];

const QuestionnaireAssistant: React.FC<Props> = ({ section, stepIndex, totalSteps }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "Hi! 🌱 I'm Eco AI. I can help you fill in this questionnaire. Ask me what any question means, where to find the data, or how to estimate it. Not sure? Just tap a suggestion below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [voiceReply, setVoiceReply] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const langRef = useRef<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, busy]);

  // Ask the context-aware brain for a reply to one user message.
  const getReply = useCallback(
    async (history: Msg[]): Promise<string> => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/ai-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.slice(-12).map((m) => ({ role: m.role === "user" ? "user" : "assistant", text: m.text })),
            context: buildContext(section),
          }),
        });
        const json = await res.json();
        const reply = json?.data?.reply;
        return reply && reply.trim()
          ? cleanReply(reply)
          : "Sorry, I couldn't reach the assistant just now. Please try again in a moment.";
      } catch {
        return "Sorry, I couldn't reach the assistant just now. Please check your connection and try again.";
      }
    },
    [section]
  );

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const history: Msg[] = [...messages, { role: "user", text: trimmed }];
    setMessages(history);
    setInput("");
    setBusy(true);
    const reply = await getReply(history);
    setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    setBusy(false);
  };

  // ── Voice ────────────────────────────────────────────────────────────────
  const speakReply = async (text: string) => {
    setVoiceState("speaking");
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/voice/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: langRef.current }),
      });
      const json = await res.json();
      const audio: string | null = json?.data?.audio;
      if (audio) {
        const el = audioRef.current || new Audio();
        audioRef.current = el;
        el.src = audio;
        el.onended = () => setVoiceState("idle");
        await el.play();
        return;
      }
    } catch {
      /* fall through to browser voice */
    }
    // Browser fallback (used until cloud TTS key is configured).
    try {
      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(text);
        if (langRef.current) utter.lang = langRef.current;
        utter.onend = () => setVoiceState("idle");
        window.speechSynthesis.speak(utter);
        return;
      }
    } catch {
      /* ignore */
    }
    setVoiceState("idle");
  };

  const handleAudio = async (blob: Blob) => {
    setVoiceState("processing");
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const tRes = await fetch(`${getApiBaseUrl()}/api/voice/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: dataUrl, mimeType: blob.type || "audio/webm" }),
      });
      const tJson = await tRes.json();
      const text: string = (tJson?.data?.text || "").trim();
      langRef.current = tJson?.data?.language || langRef.current;

      if (!text) {
        setTranscript("");
        setVoiceReply("I didn't catch that. Please tap the mic and try again.");
        setVoiceState("idle");
        return;
      }
      setTranscript(text);

      const history: Msg[] = [...messages, { role: "user", text }];
      setMessages(history);
      const reply = await getReply(history);
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setVoiceReply(reply);
      await speakReply(reply);
    } catch {
      setVoiceReply("Something went wrong while processing your voice. Please try again.");
      setVoiceState("idle");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        void handleAudio(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setTranscript("");
      setVoiceReply("");
      setVoiceState("recording");
    } catch {
      setVoiceReply("I couldn't access your microphone. Please allow microphone access and try again.");
      setVoiceState("idle");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const onMicClick = () => {
    if (voiceState === "recording") stopRecording();
    else if (voiceState === "idle") void startRecording();
  };

  // Stop any audio/recording when closing or switching mode.
  useEffect(() => {
    if (!open || mode !== "voice") {
      try {
        window.speechSynthesis?.cancel();
        audioRef.current?.pause();
        if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      } catch {
        /* ignore */
      }
      if (voiceState !== "idle") setVoiceState("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  const voiceStatusText =
    voiceState === "recording"
      ? "Listening… tap to stop"
      : voiceState === "processing"
        ? "Understanding what you said…"
        : voiceState === "speaking"
          ? "Speaking…"
          : "Tap the mic and ask your question";

  if (!open) {
    return (
      <div className="qa-root">
        <button className="qa-launcher" onClick={() => setOpen(true)} aria-label="Open Eco AI assistant">
          <span className="qa-launcher-emoji">🌱</span>
          Need help? Ask Eco AI
        </button>
      </div>
    );
  }

  return (
    <div className="qa-root">
      <div className="qa-panel" role="dialog" aria-label="Eco AI questionnaire assistant">
        {/* Header */}
        <div className="qa-header">
          <div className="qa-header-avatar">🌱</div>
          <div className="qa-header-text">
            <p className="qa-title">Eco AI</p>
            <p className="qa-subtitle">
              Helping with {section.title} · step {stepIndex + 1} of {totalSteps}
            </p>
          </div>
          <button className="qa-close" onClick={() => setOpen(false)} aria-label="Close assistant">
            ×
          </button>
        </div>

        {/* Mode toggle */}
        <div className="qa-tabs">
          <button
            className={`qa-tab ${mode === "chat" ? "qa-tab-active" : ""}`}
            onClick={() => setMode("chat")}
          >
            💬 Chat
          </button>
          <button
            className={`qa-tab ${mode === "voice" ? "qa-tab-active" : ""}`}
            onClick={() => setMode("voice")}
          >
            🎙️ Voice
          </button>
        </div>

        {mode === "chat" ? (
          <>
            <div className="qa-body" ref={bodyRef}>
              {messages.map((m, i) =>
                m.role === "ai" ? (
                  <div key={i} className="qa-row">
                    <div className="qa-avatar-mini">🌱</div>
                    <div className="qa-bubble qa-bubble-ai">{m.text}</div>
                  </div>
                ) : (
                  <div key={i} className="qa-row qa-row-user">
                    <div className="qa-bubble qa-bubble-user">{m.text}</div>
                  </div>
                )
              )}

              {busy && (
                <div className="qa-row">
                  <div className="qa-avatar-mini">🌱</div>
                  <div className="qa-bubble qa-bubble-ai">
                    <span className="qa-typing">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                </div>
              )}

              {messages.length <= 1 && !busy && (
                <div className="qa-chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="qa-chip" onClick={() => void sendText(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="qa-footer">
              <form
                className="qa-input-bar"
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendText(input);
                }}
              >
                <input
                  className="qa-input"
                  placeholder="Ask about any question…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Message Eco AI"
                />
                <button className="qa-send" type="submit" disabled={!input.trim() || busy} aria-label="Send">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
              </form>
              <p className="qa-disclaimer">AI-generated content may be inaccurate.</p>
            </div>
          </>
        ) : (
          <div className="qa-voice">
            <button
              className={`qa-mic ${voiceState === "recording" ? "qa-mic-recording" : ""}`}
              onClick={onMicClick}
              disabled={voiceState === "processing" || voiceState === "speaking"}
              aria-label={voiceState === "recording" ? "Stop recording" : "Start recording"}
            >
              🎙️
            </button>
            <div className="qa-voice-status">{voiceStatusText}</div>

            {transcript && (
              <div className="qa-voice-transcript">
                <span className="qa-voice-label">You said</span>
                {transcript}
              </div>
            )}
            {voiceReply && (
              <div className="qa-voice-transcript">
                <span className="qa-voice-label">Eco AI</span>
                {voiceReply}
              </div>
            )}
            {!transcript && !voiceReply && (
              <p className="qa-voice-hint">
                Speak in any language. I'll explain the question, tell you where to find the data, and read the
                answer back to you.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnaireAssistant;
