import { STATUS_LABEL, STATUS_STYLE, type LifecycleStatus } from "../lib/status";

type PrimaryAction =
  | { label: "Finish Configuration" }
  | { label: "Duplicate" }
  | { label: "Deploy" }
  | { label: "Make Deployable" }
  | { label: "Save changes"; disabled?: boolean }
  | { label: string; variant?: "primary" | "secondary"; disabled?: boolean }
  | null;

interface HeaderProps {
  title?: string;
  status?: LifecycleStatus;
  subStatus?: string;
  showDocumentation?: boolean;
  showDuplicate?: boolean;
  primary?: PrimaryAction;
  showEditTitle?: boolean;
}

export function Header({
  title = "Wind Turbine Alert Research Agent",
  status = "draft",
  subStatus,
  showDocumentation = true,
  showDuplicate = true,
  primary = { label: "Finish Configuration" },
  showEditTitle = true,
}: HeaderProps) {
  const s = status ? STATUS_STYLE[status] : null;
  return (
    <header className="h-12 w-full flex items-center justify-between gap-3 px-4 bg-bg-card-parent border-b border-divider-weak shrink-0">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <button className="w-6 h-6 shrink-0 flex items-center justify-center text-fg-primary text-sm hover:bg-bg-action-hover rounded-sm">
          <i className="fa-solid fa-chevron-left text-[12px]" />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-header-sm text-fg-primary font-semibold truncate">
            {title}
          </span>
          {showEditTitle && (
            <button className="w-5 h-5 shrink-0 flex items-center justify-center text-fg-secondary hover:text-fg-primary">
              <i className="fa-regular fa-pen-to-square text-[14px]" />
            </button>
          )}
          {s && (
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 px-2 h-[22px] rounded-sm ${s.bg} ${s.fg}`}
            >
              <i className={`${s.icon} text-[10px] leading-none`} />
              <span className="text-label-sm font-medium leading-none">
                {STATUS_LABEL[status]}
              </span>
            </span>
          )}
          {subStatus && (
            <span className="text-caption-md text-fg-secondary ml-1 truncate">
              {subStatus}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {showDocumentation && (
          <button className="flex items-center gap-1.5 px-2 h-8 text-fg-primary hover:bg-bg-action-hover rounded-sm">
            <i className="fa-solid fa-book text-[13px]" />
            <span className="text-btn-md">Documentation</span>
          </button>
        )}
        {showDuplicate && (
          <button className="flex items-center gap-1.5 px-2 h-8 text-fg-primary hover:bg-bg-action-hover rounded-sm">
            <i className="fa-regular fa-clone text-[13px]" />
            <span className="text-btn-md">Duplicate</span>
          </button>
        )}
        {primary && <PrimaryButton {...primary} />}
      </div>
    </header>
  );
}

function PrimaryButton(p: NonNullable<PrimaryAction>) {
  const variant = (p as { variant?: "primary" | "secondary" }).variant ?? "primary";
  const disabled = (p as { disabled?: boolean }).disabled ?? false;
  const base = "px-3 h-8 rounded-sm text-btn-md font-medium transition-colors";
  if (variant === "secondary") {
    return (
      <button
        disabled={disabled}
        className={`${base} bg-bg-card-parent text-fg-accent border border-fg-accent hover:bg-bg-core-accent`}
      >
        {p.label}
      </button>
    );
  }
  return (
    <button
      disabled={disabled}
      className={`${base} ${disabled ? "bg-[#a3bff8] text-white cursor-not-allowed" : "bg-bg-accent hover:bg-bg-accent-hover text-white"}`}
    >
      {p.label}
    </button>
  );
}
