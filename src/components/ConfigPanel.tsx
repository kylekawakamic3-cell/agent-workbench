import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Panel } from "./Panel";
import { MODELS, type ModelProvider, type Tool, type WorkbenchState } from "../lib/state";

function ModelLogo({
  provider,
  bg,
  className = "w-4 h-4",
}: {
  provider: ModelProvider;
  bg: string;
  className?: string;
}) {
  return (
    <span
      className={`${className} rounded-sm flex items-center justify-center shrink-0`}
      style={{ background: bg }}
    >
      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="#fff" aria-hidden>
        {provider === "openai" ? (
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.1419.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6765zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
        ) : (
          // Claude "spark" — radial burst of tapered rays
          Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            const cos = Math.cos(a);
            const sin = Math.sin(a);
            const inner = 1.6;
            const outer = 10.4;
            const wIn = 1.7; // half-width near center
            const cx = 12;
            const cy = 12;
            // perpendicular offset for the tapered base
            const px = -sin * wIn;
            const py = cos * wIn;
            const bx = cx + cos * inner;
            const by = cy + sin * inner;
            const tx = cx + cos * outer;
            const ty = cy + sin * outer;
            return (
              <path
                key={i}
                d={`M ${bx + px} ${by + py} L ${tx} ${ty} L ${bx - px} ${by - py} Z`}
              />
            );
          })
        )}
      </svg>
    </span>
  );
}

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
            <ul className="mt-3 flex flex-col gap-2">
              {state.tools.map((t) => (
                <li
                  key={t.name}
                  className="flex items-start gap-2 p-2 rounded-lg bg-bg-secondary hover:bg-bg-action-hover"
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
          <ModelLogo provider={model.provider} bg={model.bg} />
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
                <ModelLogo provider={m.provider} bg={m.bg} />
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
