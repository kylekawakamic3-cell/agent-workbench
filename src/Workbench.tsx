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
    <Shell
      status="draft"
      modal={
        state.toast && (
          <div className="absolute top-4 left-1/2 z-50 animate-toast-in">
            <div className="flex items-stretch min-w-[340px] max-w-[600px] rounded-lg bg-bg-primary shadow-elev02 overflow-hidden">
              <div className="w-1.5 bg-fg-success shrink-0" />
              <div className="flex items-center gap-2.5 flex-1 pl-3 pr-2 py-3">
                <i className="fa-solid fa-circle-check text-fg-success text-[18px]" />
                <span className="flex-1 text-body-md font-semibold text-fg-primary whitespace-nowrap">
                  {state.toast}
                </span>
                <button
                  onClick={state.dismissToast}
                  className="w-6 h-6 flex items-center justify-center text-fg-secondary hover:text-fg-primary rounded-sm shrink-0"
                >
                  <i className="fa-solid fa-xmark text-[14px]" />
                </button>
              </div>
            </div>
          </div>
        )
      }
    >
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
