import { useLayoutEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { Window } from "@wailsio/runtime";
import { t } from "@/lib/i18n";
import { isWailsReady } from "@/lib/wails";
import { useStudioStore } from "@/store/useStudioStore";

/** Pixels from bottom — within this range we keep tailing new log lines. */
const STICKY_TAIL_PX = 24;

export function LogPanel() {
  const logs = useStudioStore((s) => s.logs);
  const locale = useStudioStore((s) => s.locale);
  const setLocale = useStudioStore((s) => s.setLocale);
  const wails = isWailsReady();
  const bodyRef = useRef<HTMLPreElement>(null);
  const tailRef = useRef(true);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el || !tailRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  const onBodyScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    tailRef.current = gap <= STICKY_TAIL_PX;
  };

  const pickLocale = (next: "zh" | "en" | "ja") => (e: ReactMouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocale(next);
  };

  return (
    <aside className="log-panel" aria-label={t("ui.log.aria", locale)}>
      <div className={`log-panel-head${wails ? " log-panel-head--wails" : ""}`}>
        <span className="log-panel-head-label">{t("ui.log.title", locale)}</span>
        <div className="log-panel-head-locale" role="group" aria-label={t("ui.log.language", locale)}>
          <button
            type="button"
            className={`log-panel-locale-btn${locale === "zh" ? " is-active" : ""}`}
            aria-pressed={locale === "zh"}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={pickLocale("zh")}
          >
            中
          </button>
          <button
            type="button"
            className={`log-panel-locale-btn${locale === "en" ? " is-active" : ""}`}
            aria-pressed={locale === "en"}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={pickLocale("en")}
          >
            EN
          </button>
          <button
            type="button"
            className={`log-panel-locale-btn${locale === "ja" ? " is-active" : ""}`}
            aria-pressed={locale === "ja"}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={pickLocale("ja")}
          >
            JP
          </button>
        </div>
        {wails ? (
          <>
            <div className="log-panel-head-drag">F90X Film Leader Customizer</div>
            <div className="log-panel-head-controls">
              <button
                type="button"
                className="log-panel-head-btn"
                aria-label={t("ui.log.minimize", locale)}
                onClick={() => void Window.Minimise()}
              >
                —
              </button>
              <button
                type="button"
                className="log-panel-head-btn log-panel-head-btn--close"
                aria-label={t("ui.log.close", locale)}
                onClick={() => void Window.Close()}
              >
                ×
              </button>
            </div>
          </>
        ) : null}
      </div>
      <pre ref={bodyRef} className="log-panel-body" onScroll={onBodyScroll}>
        {logs.length === 0 ? "—" : logs.join("\n")}
      </pre>
    </aside>
  );
}
