import { ConfigFooter, ConfigPanel } from "./components/ConfigPanel";
import { PreviewPanel } from "./components/PreviewPanel";
import { TracePanel } from "./components/TracePanel";
import { Workbench as Shell } from "./components/Workbench";
import { PanelRail } from "./components/Panel";
import { useWorkbenchState } from "./lib/state";

export default function Workbench() {
  const state = useWorkbenchState();
  const c = state.collapsed;
  const openCount = (c.config ? 0 : 1) + (c.preview ? 0 : 1) + (c.trace ? 0 : 1);
  const canClose = openCount > 1;

  return (
    <Shell status="draft">
      {c.config ? (
        <PanelRail
          icon="fa-solid fa-gear"
          label="Configuration"
          side="left"
          onClick={() => state.togglePanel("config")}
        />
      ) : (
        <ConfigPanel
          state={state}
          className="flex-1 min-w-0 basis-0"
          showClose={canClose}
          closeIcon="fa-solid fa-xmark"
          onClose={() => state.togglePanel("config")}
          footer={<ConfigFooter state={state} saveEnabled revertEnabled />}
        />
      )}

      {c.preview ? (
        <PanelRail
          icon="fa-regular fa-message"
          label="Preview"
          side="left"
          onClick={() => state.togglePanel("preview")}
        />
      ) : (
        <PreviewPanel
          state={state}
          className="flex-1 min-w-0 basis-0"
          showClose={canClose}
          closeIcon="fa-solid fa-xmark"
          onClose={() => state.togglePanel("preview")}
        />
      )}

      {c.trace ? (
        <PanelRail
          icon="fa-solid fa-bars-staggered"
          label="Trace"
          side="right"
          onClick={() => state.togglePanel("trace")}
        />
      ) : (
        <TracePanel
          state={state}
          className="flex-1 min-w-0 basis-0"
          showClose={canClose}
          closeIcon="fa-solid fa-xmark"
          onClose={() => state.togglePanel("trace")}
        />
      )}
    </Shell>
  );
}
