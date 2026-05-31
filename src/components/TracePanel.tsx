import { useState } from "react";
import { Panel } from "./Panel";
import type { WorkbenchState } from "../lib/state";

interface RunNode {
  id: string;
  kind: "agent" | "planning" | "tool" | "llm";
  label: string;
  duration: string;
  children?: RunNode[];
}

const KIND_STYLE: Record<RunNode["kind"], { bg: string; fg: string }> = {
  agent: { bg: "bg-bg-success-weak", fg: "text-fg-success-strong" },
  planning: { bg: "bg-bg-deco-violet-strong", fg: "text-[#4c2a99]" },
  tool: { bg: "bg-bg-warning-weak", fg: "text-fg-warning-strong" },
  llm: { bg: "bg-bg-core-accent", fg: "text-fg-accent" },
};

interface TracePanelProps {
  state: WorkbenchState;
  width?: number | string;
  className?: string;
  showClose?: boolean;
  onClose?: () => void;
  closeIcon?: string;
}

export function TracePanel({
  state,
  width,
  className,
  showClose = true,
  onClose,
  closeIcon,
}: TracePanelProps) {
  const userMsgs = state.messages.filter((m) => m.role === "user");
  const latestUser = userMsgs[userMsgs.length - 1];
  const hasData = state.traceRevealed && !!latestUser;

  const tree: RunNode[] = hasData
    ? [
        {
          id: "agent",
          kind: "agent",
          label: "agent_execution",
          duration: "1.243s",
          children: [
            {
              id: "plan-0",
              kind: "planning",
              label: "planning_phase_0",
              duration: "0.612s",
              children: [
                { id: "llm-0", kind: "llm", label: "llm_interaction", duration: "0.412s" },
              ],
            },
            {
              id: "plan-1",
              kind: "planning",
              label: "planning_phase_1",
              duration: "0.631s",
              children: [
                { id: "tool-0", kind: "tool", label: "tool_execution", duration: "0.241s" },
                { id: "llm-1", kind: "llm", label: "llm_interaction", duration: "0.388s" },
              ],
            },
          ],
        },
      ]
    : [];

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    agent: true,
    "plan-0": true,
    "plan-1": true,
  });
  const [selected, setSelected] = useState<string>("agent");

  const allNodes: RunNode[] = [];
  const walk = (n: RunNode) => {
    allNodes.push(n);
    n.children?.forEach(walk);
  };
  tree.forEach(walk);
  const selectedNode = allNodes.find((n) => n.id === selected) ?? tree[0];

  const messagePreview = latestUser?.text
    ? latestUser.text.slice(0, 60) + (latestUser.text.length > 60 ? "..." : "")
    : "Enter a test message in Preview";

  return (
    <Panel
      icon="fa-solid fa-bars-staggered"
      title="Trace"
      width={width}
      className={className}
      showClose={showClose}
      onClose={onClose}
      closeIcon={closeIcon}
      bodyClassName="bg-bg-card-parent"
    >
      <div className="px-4 py-3">
        <div
          className={`flex items-center w-full h-8 px-2.5 border border-border-weak rounded-sm bg-bg-card-parent ${
            hasData ? "" : "opacity-70"
          }`}
        >
          <i
            className={`fa-solid fa-magnifying-glass text-[12px] mr-2 ${
              hasData ? "text-fg-secondary" : "text-fg-tertiary"
            }`}
          />
          <span
            className={`flex-1 text-body-sm truncate ${
              hasData ? "text-fg-primary" : "text-fg-tertiary"
            }`}
          >
            {messagePreview}
          </span>
          <i className="fa-solid fa-chevron-down text-[10px] text-fg-secondary" />
        </div>
      </div>

      {!hasData ? (
        <>
          <div className="px-4 grid grid-cols-4 gap-x-3 gap-y-3 mb-4">
            <Stat label="Duration" value="N/A" />
            <Stat label="Token" value="N/A" />
            <Stat label="Kind" value="N/A" />
            <Stat label="Status" value="N/A" />
          </div>
          <div className="px-4 mb-4 flex items-center gap-3 text-caption-md text-fg-secondary">
            <span>Logid : N/A</span>
            <i className="fa-regular fa-clipboard text-[10px]" />
            <span>Start Time : N/A</span>
          </div>
          <div className="px-4 text-caption-md text-fg-secondary">
            Duration First : N/A
          </div>
        </>
      ) : (
        <div className="animate-trace-in">
          <div className="px-4 pb-4">
            <h3 className="text-label-md font-medium text-fg-primary mb-2">
              Run Tree
            </h3>
            <ul className="flex flex-col">
              {tree.map((n) => (
                <RunRow
                  key={n.id}
                  node={n}
                  depth={0}
                  expanded={expanded}
                  setExpanded={setExpanded}
                  selected={selected}
                  setSelected={setSelected}
                />
              ))}
            </ul>
          </div>

          <div className="px-4">
            <h3 className="text-label-md font-medium text-fg-primary mb-2">
              Span Detail
            </h3>
            <div className="grid grid-cols-4 gap-x-3 gap-y-2 mb-3">
              <Stat label="Duration" value={selectedNode?.duration ?? "N/A"} copy />
              <Stat label="Token" value={selectedNode?.kind === "llm" ? "812" : "—"} />
              <Stat label="Kind" value={selectedNode ? capitalize(selectedNode.kind) : "—"} />
              <Stat
                label="Status"
                value={
                  <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded-sm bg-bg-success-weak text-fg-success-strong text-label-sm font-medium">
                    <i className="fa-solid fa-circle-check text-[10px]" />
                    Success
                  </span>
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-caption-md text-fg-secondary mb-1">
              <div className="flex items-center gap-1">
                <span>Logid : {selectedNode?.id ?? "—"}</span>
                <i className="fa-regular fa-clipboard text-[10px]" />
              </div>
              <div>Start Time : {nowLabel()}</div>
            </div>
            <div className="text-caption-md text-fg-secondary mb-4">
              Duration First : {selectedNode?.duration ?? "—"}
            </div>

            <div className="border-t border-divider-weak pt-3">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-label-sm font-medium text-fg-primary">
                  Name
                </span>
                <span className="text-label-sm font-medium text-fg-primary">
                  Value
                </span>
              </div>
              <ul className="flex flex-col">
                {detailRows(selectedNode).map((s, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between py-2 border-t border-divider-weak text-body-sm text-fg-primary first:border-t-0"
                  >
                    <span>{s.name}</span>
                    <span className="font-mono text-fg-secondary">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

function detailRows(node?: RunNode) {
  if (!node) return [];
  if (node.kind === "llm")
    return [
      { name: "model", value: "gpt-4o" },
      { name: "tokens.input", value: "412" },
      { name: "tokens.output", value: "400" },
    ];
  if (node.kind === "tool")
    return [
      { name: "tool.name", value: "get_events_for_turbine" },
      { name: "tool.args", value: "{turbine_id:1}" },
      { name: "tool.status", value: "ok" },
    ];
  return [
    { name: "execustion.status", value: "completed" },
    { name: "context", value: "Text" },
    { name: "session.id", value: "session-4603" },
  ];
}

function nowLabel() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(
    d.getDate()
  )}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

function Stat({
  label,
  value,
  copy,
}: {
  label: string;
  value: React.ReactNode;
  copy?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-caption-md text-fg-secondary">{label}</span>
      <span className="text-label-md font-medium text-fg-primary flex items-center gap-1">
        {value}
        {copy && (
          <i className="fa-regular fa-clipboard text-[10px] text-fg-secondary" />
        )}
      </span>
    </div>
  );
}

function RunRow({
  node,
  depth,
  expanded,
  setExpanded,
  selected,
  setSelected,
}: {
  node: RunNode;
  depth: number;
  expanded: Record<string, boolean>;
  setExpanded: (v: Record<string, boolean>) => void;
  selected: string;
  setSelected: (v: string) => void;
}) {
  const s = KIND_STYLE[node.kind];
  const isExpanded = expanded[node.id] ?? false;
  const isSel = selected === node.id;
  return (
    <li>
      <div
        onClick={() => setSelected(node.id)}
        className={`flex items-center gap-2 h-7 rounded-sm cursor-pointer ${
          isSel ? "bg-bg-core-accent" : "hover:bg-bg-action-hover"
        }`}
        style={{ paddingLeft: depth * 16 }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded({ ...expanded, [node.id]: !isExpanded });
          }}
          className="w-4 h-4 flex items-center justify-center text-fg-secondary"
        >
          {node.children && node.children.length > 0 ? (
            isExpanded ? (
              <i className="fa-solid fa-chevron-down text-[9px]" />
            ) : (
              <i className="fa-solid fa-chevron-right text-[9px]" />
            )
          ) : null}
        </button>
        <i className="fa-solid fa-circle-check text-fg-success text-[12px]" />
        <span
          className={`inline-flex items-center px-1.5 h-5 rounded-sm ${s.bg} ${s.fg} text-label-sm font-medium`}
        >
          {node.kind}
        </span>
        <span className="text-body-sm text-fg-primary truncate">{node.label}</span>
        <span className="text-body-sm text-fg-secondary ml-auto pr-1 font-mono">
          {node.duration}
        </span>
      </div>
      {isExpanded && node.children && (
        <ul>
          {node.children.map((c) => (
            <RunRow
              key={c.id}
              node={c}
              depth={depth + 1}
              expanded={expanded}
              setExpanded={setExpanded}
              selected={selected}
              setSelected={setSelected}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
