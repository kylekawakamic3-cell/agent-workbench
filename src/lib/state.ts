import { useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";

export interface Tool {
  icon: string;
  name: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  sender?: string;
  time?: string;
  text?: string;
  body?: ReactNode;
  sources?: string[];
  feedback?: boolean;
  showTrace?: boolean;
}

export const DEFAULT_TOOLS: Tool[] = [
  {
    icon: "fa-regular fa-building",
    name: "get_events_for_turbine",
    description:
      "Retrieves events for a specific wind turbine — maintenance logs, sensor alerts, and inspection records.",
  },
  {
    icon: "fa-solid fa-wave-square",
    name: "turbine_vibration_anomaly_detection",
    description:
      "Analyzes vibration sensor data for a turbine and flags anomalies with severity scores and affected components.",
  },
  {
    icon: "fa-solid fa-magnifying-glass",
    name: "semantic_search",
    description:
      "Searches the maintenance knowledge base and historical reports using natural-language queries.",
  },
];

const DEFAULT_PROMPT =
  "You are a wind farm operations assistant. Help engineers monitor turbine health, investigate vibration and sensor anomalies, and prioritize maintenance. Use the available tools to pull turbine event history, run vibration anomaly detection, and search maintenance records. Always cite specific turbines, dates, and severity, and recommend a clear next action.";

export type ModelProvider = "openai" | "anthropic" | "google";

export const MODELS: {
  id: string;
  label: string;
  provider: ModelProvider;
  bg: string;
}[] = [
  { id: "gpt-5", label: "GPT-5", provider: "openai", bg: "#111112" },
  { id: "gpt-5-mini", label: "GPT-5 mini", provider: "openai", bg: "#111112" },
  { id: "claude-opus-4-8", label: "Claude Opus 4.8", provider: "anthropic", bg: "#d97757" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "anthropic", bg: "#d97757" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", provider: "anthropic", bg: "#d97757" },
  { id: "gemini-2-5-pro", label: "Gemini 2.5 Pro", provider: "google", bg: "#1a73e8" },
  { id: "gemini-2-5-flash", label: "Gemini 2.5 Flash", provider: "google", bg: "#1a73e8" },
];

// --- Scripted demo content (for screen recording) ---
const DEMO_MESSAGE =
  "Which turbines at the North Ridge site reported vibration anomalies in the last 7 days?";

const DEMO_REPLY =
  "Three turbines at North Ridge flagged vibration anomalies in the last 7 days:\n\n" +
  "•  Turbine 07 — gearbox vibration 4.2σ above baseline (May 26)\n" +
  "•  Turbine 12 — drivetrain resonance, intermittent (May 28)\n" +
  "•  Turbine 19 — blade-pass frequency spike (May 29)\n\n" +
  "Turbine 07 is the most urgent: its anomaly score has trended upward for three " +
  "consecutive days. I'd recommend scheduling an inspection before the next " +
  "high-wind window.";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function timeStamp() {
  const d = new Date();
  let h = d.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m} ${ap}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function clockTime() {
  const d = new Date();
  let h = d.getHours();
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${ap}`;
}

export type PanelId = "config" | "preview" | "trace";

export function useWorkbenchState() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [modelId, setModelId] = useState("gpt-5");
  const [temperature, setTemperature] = useState(0.5);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [memoryOn, setMemoryOn] = useState(false);
  const [tools, setTools] = useState<Tool[]>(DEFAULT_TOOLS);
  const [lastSaved, setLastSaved] = useState("01:21:55pm");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composer, setComposer] = useState("");
  const [sending, setSending] = useState(false);
  const [traceRevealed, setTraceRevealed] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<PanelId, boolean>>({
    config: false,
    preview: false,
    trace: false,
  });
  const demoRunning = useRef(false);

  const togglePanel = useCallback((id: PanelId) => {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  }, []);

  const revealTrace = useCallback(() => {
    setTraceRevealed(true);
    setCollapsed((c) => ({ ...c, trace: false }));
  }, []);

  // Scripted demo for screen recording: types a message, sends it,
  // shows the agent "thinking", then drops in the reply. The trace stays
  // idle until the user clicks "View trace" under the agent bubble.
  const runDemo = useCallback(async () => {
    if (demoRunning.current) return;
    demoRunning.current = true;

    setMessages([]);
    setTraceRevealed(false);
    setComposer("");
    await sleep(450);

    // Animate typing into the composer
    for (let i = 1; i <= DEMO_MESSAGE.length; i++) {
      setComposer(DEMO_MESSAGE.slice(0, i));
      await sleep(18 + Math.random() * 45);
    }
    await sleep(550);

    // Send the message
    setMessages([
      {
        id: uid(),
        role: "user",
        sender: "You",
        time: timeStamp(),
        text: DEMO_MESSAGE,
      },
    ]);
    setComposer("");
    setSending(true);

    // Agent thinking
    await sleep(2200);

    // Agent reply
    setSending(false);
    setMessages((m) => [
      ...m,
      {
        id: uid(),
        role: "assistant",
        sender: "Agent",
        time: timeStamp(),
        text: DEMO_REPLY,
        feedback: true,
        showTrace: true,
      },
    ]);

    demoRunning.current = false;
  }, []);

  const removeTool = useCallback((name: string) => {
    setTools((t) => t.filter((x) => x.name !== name));
  }, []);

  const sendMessage = useCallback(() => {
    const text = composer.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      sender: "You",
      time: timeStamp(),
      text,
    };
    setMessages((m) => [...m, userMsg]);
    setComposer("");
    setSending(true);
    setTimeout(() => {
      const reply = generateReply(text, prompt);
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          sender: "Agent",
          time: timeStamp(),
          text: reply,
          feedback: true,
          showTrace: true,
        },
      ]);
      setSending(false);
    }, 900);
  }, [composer, sending, prompt]);

  const clearChat = useCallback(() => {
    demoRunning.current = false;
    setMessages([]);
    setComposer("");
    setSending(false);
    setTraceRevealed(false);
  }, []);

  const addTool = useCallback((tool: Tool) => {
    setTools((t) => (t.some((x) => x.name === tool.name) ? t : [...t, tool]));
  }, []);

  const saveConfig = useCallback(() => {
    setLastSaved(clockTime());
    setToast("Configuration saved");
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  return {
    prompt,
    setPrompt,
    modelId,
    setModelId,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
    memoryOn,
    setMemoryOn,
    tools,
    setTools,
    removeTool,
    addTool,
    messages,
    composer,
    setComposer,
    sendMessage,
    sending,
    clearChat,
    collapsed,
    togglePanel,
    traceRevealed,
    revealTrace,
    runDemo,
    lastSaved,
    saveConfig,
    toast,
  };
}

export type WorkbenchState = ReturnType<typeof useWorkbenchState>;

function generateReply(userText: string, prompt: string): string {
  const t = userText.toLowerCase();
  if (t.includes("hi") || t.includes("hello"))
    return "Hi — I'm your test agent. Ask me anything related to the prompt, and I'll respond as configured.";
  if (t.includes("prompt"))
    return `Current objective:\n\n${prompt}`;
  if (t.includes("tool"))
    return "I can call any of the tools listed in the Tools section to the left. Try asking me to get events for a turbine or search the knowledge base.";
  if (t.includes("trace") || t.includes("how"))
    return "Each message you send produces a Trace on the right — Run Tree shows the spans, and Span Detail shows attributes for whichever span is selected.";
  return `I received: "${userText}". This is a mock response so you can exercise the UI — wire me to a real backend and I'll generate real output.`;
}
