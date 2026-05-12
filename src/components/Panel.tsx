import type { ReactNode } from "react";

interface PanelProps {
  icon?: string;
  title: string;
  locked?: boolean;
  actions?: ReactNode;
  onClose?: () => void;
  showClose?: boolean;
  closeIcon?: string;
  closeLabel?: string;
  width?: number | string;
  className?: string;
  children?: ReactNode;
  footer?: ReactNode;
  bodyClassName?: string;
}

export function Panel({
  icon,
  title,
  locked,
  actions,
  showClose = true,
  onClose,
  closeIcon = "fa-solid fa-angles-left",
  closeLabel = "Collapse panel",
  width,
  className = "",
  children,
  footer,
  bodyClassName = "",
}: PanelProps) {
  return (
    <section
      className={`flex flex-col bg-bg-card-parent rounded-md shadow-elev01 overflow-hidden min-w-0 min-h-0 ${
        width ? "shrink-0" : ""
      } ${className}`}
      style={width ? { width, maxWidth: "100%" } : undefined}
    >
      <header className="flex items-center justify-between h-10 px-4 border-b border-divider-weak shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <i className={`${icon} text-fg-primary text-[14px] shrink-0`} />
          )}
          <h2 className="text-title-sm text-fg-primary font-medium truncate">
            {title}
          </h2>
          {locked && (
            <i className="fa-solid fa-lock text-fg-secondary text-[10px] ml-1" />
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {showClose && (
            <button
              onClick={onClose}
              title={closeLabel}
              aria-label={closeLabel}
              className="w-6 h-6 flex items-center justify-center text-fg-secondary hover:text-fg-primary hover:bg-bg-action-hover rounded-sm"
            >
              <i className={`${closeIcon} text-[12px]`} />
            </button>
          )}
        </div>
      </header>
      <div className={`flex-1 overflow-y-auto scrollbar-thin ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <footer className="border-t border-divider-weak shrink-0">
          {footer}
        </footer>
      )}
    </section>
  );
}

interface PanelRailProps {
  icon: string;
  label: string;
  side?: "left" | "right";
  onClick?: () => void;
}

export function PanelRail({ icon, label, side = "left", onClick }: PanelRailProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 py-4 px-2 bg-bg-card-parent rounded-md shadow-elev01 h-full w-8 shrink-0 hover:bg-bg-action-hover"
    >
      <i className={`${icon} text-[14px] text-fg-primary`} />
      <span
        className="text-label-sm text-fg-primary font-medium"
        style={{
          writingMode: "vertical-rl",
          transform: side === "left" ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        {label}
      </span>
    </button>
  );
}
