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
              <ChatBubble key={m.id} msg={m} />
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
  sending,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-4 h-12">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        placeholder="Message goes here..."
        className="flex-1 h-8 px-3 text-input-md text-fg-primary bg-bg-card-parent placeholder:text-fg-tertiary"
      />
      <button
        onClick={onSend}
        disabled={sending || !value.trim()}
        className={`w-8 h-8 flex items-center justify-center rounded-sm ${
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

function ChatBubble({ msg }: { msg: ChatMessage }) {
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
