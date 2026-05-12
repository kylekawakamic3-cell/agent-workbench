import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Panel } from "./Panel";
import { MODELS, type Tool, type WorkbenchState } from "../lib/state";

interface ConfigPanelProps {
  state: WorkbenchState;
  title?: string;
  locked?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  closeIcon?: string;
  footer?: ReactNode;
  width?: number | string;
  className?: string;
}

export function ConfigPanel({
  state,
  title = "Configuration",
  locked = false,
  showClose = true,
  onClose,
  closeIcon,
  footer,
  width,
  className,
}: ConfigPanelProps) {
  const disabledStyle = locked ? "opacity-60 pointer-events-none" : "";
  const model = MODELS.find((m) => m.id === state.modelId) ?? MODELS[0];
  const [modelOpen, setModelOpen] = useState(false);

  // Collapsible section open state — all collapsed by default per Figma
  const [openSec, setOpenSec] = useState<Record<string, boolean>>({
    memory: false,
    summarization: false,
    tools: false,
    skills: false,
  });
  const toggleSec = (id: string) =>
    setOpenSec((s) => ({ ...s, [id]: !s[id] }));

  return (
    <Panel
      icon="fa-solid fa-gear"
      title={title}
      locked={locked}
      showClose={showClose}
      onClose={onClose}
      closeIcon={closeIcon}
      width={width}
      className={className}
      footer={footer}
      bodyClassName="bg-bg-card-parent"
    >
      <div className={`flex flex-col ${disabledStyle}`}>
        {/* Objective & Prompt — always expanded */}
        <Section>
          <Label required={!locked}>Objective &amp; Prompt</Label>
          <Hint>
            Guidelines, commands, or prompts provided to a language model to generate specific response or output.
          </Hint>
          <textarea
            value={state.prompt}
            onChange={(e) => state.setPrompt(e.target.value)}
            placeholder="Enter a detailed prompt on your Agent's objective"
            className="w-full h-[170px] mt-2 px-3 py-2 text-body-md text-fg-primary bg-bg-card-parent border border-border-weak rounded-sm resize-none placeholder:text-fg-tertiary focus:border-fg-accent"
          />
        </Section>

        <Divider />

        {/* Model — always expanded */}
        <Section>
          <Label required={!locked}>Model</Label>
          <ModelPicker
            open={modelOpen}
            setOpen={setModelOpen}
            model={model}
            onPick={(id) => {
              state.setModelId(id);
              setModelOpen(false);
            }}
          />
        </Section>

        <Divider />

        {/* Memory — collapsible, no right action */}
        <Collapsible
          title="Memory"
          open={openSec.memory}
          onToggle={() => toggleSec("memory")}
        >
          <div className="pt-3 flex flex-col gap-3">
            <ToggleRow
              label="Short Term Memory"
              hint="Summarizes chat history to better respond to your messages."
              on={state.memoryOn}
              onChange={() => state.setMemoryOn(!state.memoryOn)}
            />
          </div>
        </Collapsible>

        <Divider />

        {/* Summarization — collapsible, toggle on right */}
        <Collapsible
          title="Summarization"
          open={openSec.summarization}
          onToggle={() => toggleSec("summarization")}
          right={
            <Toggle
              on={state.memoryOn}
              onChange={(e) => {
                e.stopPropagation();
                state.setMemoryOn(!state.memoryOn);
              }}
            />
          }
        >
          <p className="pt-3 text-body-sm text-fg-secondary">
            Periodically summarize earlier turns so the agent stays within context.
          </p>
        </Collapsible>

        <Divider />

        {/* Tools — collapsible, + on right */}
        <Collapsible
          title="Tools"
          open={openSec.tools}
          onToggle={() => toggleSec("tools")}
          right={
            !locked && (
              <IconBtn
                icon="fa-solid fa-plus"
                onClick={(e) => e.stopPropagation()}
                label="Add tool"
              />
            )
          }
        >
          <p className="pt-1 text-caption-md text-fg-secondary">
            Tools are actions or functions your agent can use to perform its tasks. Choose tools that match the agent's responsibilities and goals.
          </p>
          {state.tools.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1">
              {state.tools.map((t) => (
                <li
                  key={t.name}
                  className="flex items-start gap-2 py-2 px-1 rounded-sm hover:bg-bg-action-hover"
                >
                  <span className="w-6 h-6 flex items-center justify-center shrink-0">
                    <i className={`${t.icon} text-fg-primary text-[14px]`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-label-sm font-medium text-fg-primary truncate">
                      {t.name}
                    </div>
                    <div className="text-caption-md text-fg-secondary truncate">
                      {t.description}
                    </div>
                  </div>
                  {!locked && (
                    <button
                      onClick={() => state.removeTool(t.name)}
                      className="w-5 h-5 flex items-center justify-center text-fg-secondary hover:text-fg-primary"
                    >
                      <i className="fa-solid fa-xmark text-[12px]" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Collapsible>

        <Divider />

        {/* Skills — collapsible, + on right */}
        <Collapsible
          title="Skills"
          open={openSec.skills}
          onToggle={() => toggleSec("skills")}
          right={
            !locked && (
              <IconBtn
                icon="fa-solid fa-plus"
                onClick={(e) => e.stopPropagation()}
                label="Add skill"
              />
            )
          }
        >
          <p className="pt-1 text-caption-md text-fg-secondary">
            Skills are reusable instructions and behaviors that supplement your prompt.
          </p>
        </Collapsible>

        <div className="h-4" />
      </div>
    </Panel>
  );
}

function Collapsible({
  title,
  open,
  onToggle,
  right,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 group"
      >
        <i
          className={`fa-solid fa-chevron-right text-[10px] text-fg-secondary transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
        <span className="text-label-md font-medium text-fg-primary flex-1 text-left">
          {title}
        </span>
        {right && <span className="flex items-center">{right}</span>}
      </button>
      {open && <div className="pl-5">{children}</div>}
    </div>
  );
}

function IconBtn({
  icon,
  onClick,
  label,
}: {
  icon: string;
  onClick?: (e: React.MouseEvent) => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-6 h-6 flex items-center justify-center text-fg-primary hover:bg-bg-action-hover rounded-sm"
    >
      <i className={`${icon} text-[12px]`} />
    </button>
  );
}

function ToggleRow({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-label-sm font-medium text-fg-primary">{label}</div>
        {hint && (
          <p className="text-caption-md text-fg-secondary mt-0.5">{hint}</p>
        )}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function ModelPicker({
  open,
  setOpen,
  model,
  onPick,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  model: typeof MODELS[number];
  onPick: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, setOpen]);

  return (
    <div ref={ref} className="relative w-full mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 h-8 text-body-md text-fg-primary bg-bg-card-parent border border-border-weak rounded-sm hover:border-border"
      >
        <span className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[8px] font-bold"
            style={{ background: model.bg }}
          >
            {model.initial}
          </span>
          {model.label}
        </span>
        <i className="fa-solid fa-chevron-down text-[10px] text-fg-secondary" />
      </button>
      {open && (
        <ul className="absolute z-20 top-9 left-0 w-full bg-bg-card-parent border border-border-weak rounded-sm shadow-elev01 py-1">
          {MODELS.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => onPick(m.id)}
                className={`w-full flex items-center gap-2 px-3 h-8 text-left text-body-md hover:bg-bg-action-hover ${
                  m.id === model.id ? "bg-bg-core-accent text-fg-accent" : "text-fg-primary"
                }`}
              >
                <span
                  className="w-4 h-4 rounded-sm flex items-center justify-center text-white text-[8px] font-bold shrink-0"
                  style={{ background: m.bg }}
                >
                  {m.initial}
                </span>
                {m.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Section({ children }: { children: ReactNode }) {
  return <div className="px-4 py-4">{children}</div>;
}
function Divider() {
  return <div className="h-px bg-divider-weak mx-4" />;
}
function Label({
  children,
  required,
  small,
}: {
  children: ReactNode;
  required?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={
        small
          ? "text-label-sm font-medium text-fg-primary"
          : "text-label-md font-medium text-fg-primary"
      }
    >
      {children}
      {required && (
        <span className="text-fg-secondary font-normal"> (Required)</span>
      )}
    </div>
  );
}
function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="text-caption-md text-fg-secondary mt-1">{children}</p>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-7 h-4 rounded-pill relative transition-colors shrink-0 ${
        on ? "bg-bg-accent" : "bg-bg-track"
      }`}
    >
      <span
        className={`absolute top-0.5 ${
          on ? "right-0.5" : "left-0.5"
        } w-3 h-3 bg-white rounded-pill shadow transition-all`}
      />
    </button>
  );
}

export function ConfigFooter({
  state,
  saveEnabled = true,
  revertEnabled = true,
  lastSaved = "01:21:55pm",
}: {
  state: WorkbenchState;
  saveEnabled?: boolean;
  revertEnabled?: boolean;
  lastSaved?: string;
}) {
  void state;
  return (
    <div className="flex items-center justify-between px-4 h-12">
      <button
        disabled={!saveEnabled}
        className={`h-8 px-3 rounded-sm text-btn-md font-medium border ${
          saveEnabled
            ? "border-fg-accent text-fg-accent bg-bg-card-parent hover:bg-bg-core-accent"
            : "border-border-weak text-fg-disabled bg-bg-card-parent cursor-not-allowed"
        }`}
      >
        Save configuration
      </button>
      <div className="flex items-center gap-3">
        <button
          disabled={!revertEnabled}
          className={`flex items-center gap-1 text-btn-md ${
            revertEnabled
              ? "text-fg-primary hover:text-fg-accent"
              : "text-fg-disabled cursor-not-allowed"
          }`}
        >
          <i className="fa-solid fa-clock-rotate-left text-[12px]" />
          Revert
        </button>
        <div className="w-px h-4 bg-divider-weak" />
        <div className="px-2 py-0.5 rounded-sm bg-bg-secondary text-caption-md text-fg-secondary">
          Last saved: {lastSaved}
        </div>
      </div>
    </div>
  );
}

export type { Tool };
