import { useEffect, useRef } from "react";
import { Panel } from "./Panel";
import type { ChatMessage, WorkbenchState } from "../lib/state";

interface PreviewPanelProps {
  state: WorkbenchState;
  locked?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  closeIcon?: string;
  width?: number | string;
  className?: string;
}

export function PreviewPanel({
  state,
  locked = false,
  showClose = true,
  onClose,
  closeIcon,
  width,
  className = "flex-1 min-w-[280px]",
}: PreviewPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const showEmpty = state.messages.length === 0 && !state.sending;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages.length, state.sending]);

  return (
    <Panel
      icon="fa-regular fa-message"
      title="Preview"
      locked={locked}
      showClose={showClose}
      onClose={onClose}
      closeIcon={closeIcon}
      width={width}
      className={className}
      actions={
        <button
          onClick={state.clearChat}
          className="flex items-center gap-1.5 h-7 px-2 text-fg-primary hover:bg-bg-action-hover rounded-sm"
        >
          <i className="fa-regular fa-message text-[12px]" />
          <span className="text-btn-sm font-medium">New chat</span>
        </button>
      }
      bodyClassName="bg-bg-card-parent"
      footer={
        <Composer
          value={state.composer}
          onChange={state.setComposer}
          onSend={state.sendMessage}
          onActivate={
            state.messages.length === 0 && !state.sending && !state.composer
              ? state.runDemo
              : undefined
          }
          sending={state.sending}
        />
      }
    >
      <div ref={scrollRef} className="flex flex-col h-full overflow-y-auto scrollbar-thin">
        {showEmpty ? (
          <EmptyState />
        ) : (
          <div className="px-4 py-4 flex flex-col gap-4">
            {state.messages.map((m) => (
              <ChatBubble
                key={m.id}
                msg={m}
                onViewTrace={state.revealTrace}
                traceRevealed={state.traceRevealed}
              />
            ))}
            {state.sending && <TypingIndicator />}
          </div>
        )}
      </div>
    </Panel>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  onActivate,
  sending,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onActivate?: () => void;
  sending: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow with the content, capped so it scrolls past a few lines.
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  return (
    <div className="flex items-end gap-2 px-4 py-2 min-h-12">
      <textarea
        ref={taRef}
        value={value}
        rows={1}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onActivate?.()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Message goes here..."
        className="flex-1 resize-none py-1.5 px-3 max-h-[140px] leading-snug text-input-md text-fg-primary bg-bg-card-parent placeholder:text-fg-tertiary scrollbar-thin"
      />
      <button
        onClick={onSend}
        disabled={sending || !value.trim()}
        className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-sm ${
          sending
            ? "bg-bg-primary-inverse text-white"
            : value.trim()
            ? "text-fg-accent hover:bg-bg-core-accent"
            : "text-fg-disabled cursor-not-allowed"
        }`}
      >
        {sending ? (
          <span className="w-2.5 h-2.5 bg-white rounded-[1px]" />
        ) : (
          <i className="fa-regular fa-paper-plane text-[14px]" />
        )}
      </button>
    </div>
  );
}

function ChatBubble({
  msg,
  onViewTrace,
  traceRevealed,
}: {
  msg: ChatMessage;
  onViewTrace?: () => void;
  traceRevealed?: boolean;
}) {
  if (msg.role === "user") {
    return (
      <div className="rounded-md bg-bg-core-accent px-3 py-2 self-end max-w-[88%]">
        {(msg.sender || msg.time) && (
          <div className="flex items-center gap-2 mb-1">
            {msg.sender && (
              <span className="text-label-sm font-medium text-fg-primary">
                {msg.sender}
              </span>
            )}
            {msg.time && (
              <span className="text-caption-md text-fg-secondary">
                {msg.time}
              </span>
            )}
          </div>
        )}
        {msg.text && (
          <p className="text-body-md text-fg-primary whitespace-pre-wrap">
            {msg.text}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {msg.sender && (
            <span className="text-label-sm font-medium text-fg-primary">
              {msg.sender}
            </span>
          )}
          {msg.time && (
            <span className="text-caption-md text-fg-secondary">
              {msg.time}
            </span>
          )}
        </div>
        {msg.feedback && <Feedback />}
      </div>
      <div className="text-body-md text-fg-primary whitespace-pre-wrap">
        {msg.text}
        {msg.body}
      </div>
      {msg.showTrace && (
        <button
          onClick={onViewTrace}
          className={`mt-2.5 self-start inline-flex items-center gap-1.5 h-7 px-2 rounded-sm border transition-colors ${
            traceRevealed
              ? "border-border-weak text-fg-secondary"
              : "border-border-weak text-fg-secondary hover:text-fg-primary hover:bg-bg-action-hover"
          }`}
        >
          <i className="fa-solid fa-bars-staggered text-[11px]" />
          <span className="text-btn-sm font-medium">
            {traceRevealed ? "Trace shown" : "View trace"}
          </span>
        </button>
      )}
    </div>
  );
}

function Feedback() {
  return (
    <div className="flex items-center gap-1 text-fg-secondary">
      <button className="w-6 h-6 flex items-center justify-center hover:text-fg-primary">
        <i className="fa-regular fa-thumbs-up text-[12px]" />
      </button>
      <button className="w-6 h-6 flex items-center justify-center hover:text-fg-primary">
        <i className="fa-regular fa-thumbs-down text-[12px]" />
      </button>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 text-fg-secondary">
      <span className="w-1.5 h-1.5 bg-fg-secondary rounded-full animate-pulse" />
      <span className="w-1.5 h-1.5 bg-fg-secondary rounded-full animate-pulse [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 bg-fg-secondary rounded-full animate-pulse [animation-delay:240ms]" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-[160px] h-[140px] mb-4 relative">
        <div
          className="absolute inset-0 rounded-md"
          style={{
            background:
              "linear-gradient(135deg, #e8e8ef 0%, #f3f3f7 60%, #ffffff 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(closest-side at 35% 65%, rgba(220,225,235,0.8), transparent 60%), radial-gradient(closest-side at 70% 45%, rgba(200,205,220,0.6), transparent 60%)",
            mixBlendMode: "multiply",
          }}
        />
      </div>
      <h3 className="text-title-sm font-medium text-fg-primary mb-1">
        Test Your Agent Here
      </h3>
      <p className="text-body-sm text-fg-secondary leading-snug max-w-[260px]">
        Provide an input to test your Agent.
        <br />
        The Agent will use your provided prompt, tools, and configurations.
      </p>
    </div>
  );
}
