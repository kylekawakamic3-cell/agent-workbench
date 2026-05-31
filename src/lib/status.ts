export type LifecycleStatus = "draft" | "template" | "registry" | "deployed";

export const STATUS_LABEL: Record<LifecycleStatus, string> = {
  draft: "Draft",
  template: "Template",
  registry: "Registry",
  deployed: "Deployed",
};

export const STATUS_STYLE: Record<
  LifecycleStatus,
  { bg: string; fg: string; icon: string }
> = {
  draft: {
    bg: "bg-bg-warning-weak",
    fg: "text-fg-warning-strong",
    icon: "fa-solid fa-pen",
  },
  template: {
    bg: "bg-bg-warning-weak",
    fg: "text-fg-warning-strong",
    icon: "fa-regular fa-clone",
  },
  registry: {
    bg: "bg-bg-deco-violet-strong",
    fg: "text-[#4c2a99]",
    icon: "fa-solid fa-box-archive",
  },
  deployed: {
    bg: "bg-bg-success-weak",
    fg: "text-fg-success-strong",
    icon: "fa-solid fa-circle-check",
  },
};
