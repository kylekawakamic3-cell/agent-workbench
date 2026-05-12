import { useState, useCallback } from "react";
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
}

export const DEFAULT_TOOLS: Tool[] = [
  {
    icon: "fa-regular fa-building",
    name: "get_events_for_turbine",
    description:
      "Retrieves events associated with a specific wind turbine (e.g., maintenance logs, sensor alert...",
  },
  {
    icon: "fa-solid fa-wave-square",
    name: "turbine_vibration_anomaly_detection",
    description:
      "Retrieves events associated with a specific wind turbine (e.g., maintenance logs, sensor alert...",
  },
  {
    icon: "fa-solid fa-magnifying-glass",
    name: "semantic_search",
    description:
      "Retrieves events associated with a specific wind turbine (e.g., maintenance logs, sensor alert...",
  },
];

const DEFAULT_PROMPT =
  "Develop, refactor, and debug high-quality code across multiple languages and frameworks to accelerate software development, minimize manual errors, and enhance developer productivity through clear, efficient, and maintainable solutions.";

export const MODELS = [
  { id: "gpt-4o", label: "GPT-4o", initial: "G", bg: "#111112" },
  { id: "gpt-4o-mini", label: "GPT-4o mini", initial: "G", bg: "#111112" },
  { id: "claude-opus-4-7", label: "Claude Opus 4.7", initial: "C", bg: "#d97757" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", initial: "C", bg: "#d97757" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", initial: "C", bg: "#d97757" },
];

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

export type PanelId = "config" | "preview" | "trace";

export function useWorkbenchState() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [modelId, setModelId] = useState("gpt-4o");
  const [temperature, setTemperature] = useState(0.5);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [memoryOn, setMemoryOn] = useState(false);
  const [tools, setTools] = useState<Tool[]>(DEFAULT_TOOLS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [composer, setComposer] = useState("");
  const [sending, setSending] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<PanelId, boolean>>({
    config: false,
    preview: false,
    trace: false,
  });

  const togglePanel = useCallback((id: PanelId) => {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
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
        },
      ]);
      setSending(false);
    }, 900);
  }, [composer, sending, prompt]);

  const clearChat = useCallback(() => setMessages([]), []);

  const addTool = useCallback((tool: Tool) => {
    setTools((t) => (t.some((x) => x.name === tool.name) ? t : [...t, tool]));
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
