import type { ReactNode } from "react";
import { Header } from "./Header";
import type { LifecycleStatus } from "../lib/status";

interface WorkbenchProps {
  title?: string;
  status?: LifecycleStatus;
  subStatus?: string;
  showDocumentation?: boolean;
  showDuplicate?: boolean;
  primary?: Parameters<typeof Header>[0]["primary"];
  showEditTitle?: boolean;
  children: ReactNode;
  modal?: ReactNode;
}

export function Workbench({
  title,
  status,
  subStatus,
  showDocumentation,
  showDuplicate,
  primary,
  showEditTitle,
  children,
  modal,
}: WorkbenchProps) {
  return (
    <div className="w-full min-w-[720px] h-screen min-h-[640px] bg-bg-tertiary flex flex-col relative overflow-hidden">
      <Header
        title={title}
        status={status}
        subStatus={subStatus}
        showDocumentation={showDocumentation}
        showDuplicate={showDuplicate}
        primary={primary}
        showEditTitle={showEditTitle}
      />
      <main className="flex-1 flex gap-2 p-4 overflow-hidden min-h-0">
        {children}
      </main>
      {modal}
    </div>
  );
}
