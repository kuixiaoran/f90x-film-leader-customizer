import { DevToolbar } from "@/components/DevToolbar";
import { AppStage } from "@/components/AppStage";
import { AdvancedPanel } from "@/components/AdvancedPanel";
import { LogPanel } from "@/components/LogPanel";
import { useStudioBoot, useWailsDesktop, useWailsLog } from "@/hooks/useWails";
import { useStudioStore } from "@/store/useStudioStore";

export default function App() {
  const error = useStudioStore((s) => s.error);
  const busy = useStudioStore((s) => s.busy);
  const wailsDesktop = useWailsDesktop();

  useStudioBoot();
  useWailsLog();

  return (
    <div
      className={[
        "app-root",
        wailsDesktop ? "app-root--wails app-root--wails-fill" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <DevToolbar />
      <main className="app-stage" aria-busy={busy}>
        <AppStage />
        {error ? <div className="error-banner">{error}</div> : null}
      </main>
      <footer className="app-chrome">
        <AdvancedPanel />
        <LogPanel />
      </footer>
    </div>
  );
}
