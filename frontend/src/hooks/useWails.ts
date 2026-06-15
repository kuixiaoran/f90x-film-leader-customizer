import { useEffect, useRef, useState } from "react";
import { Events } from "@wailsio/runtime";
import { onDevLog } from "@/lib/devLog";
import { t } from "@/lib/i18n";
import { api, isUiOnlyMode, isWailsReady } from "@/lib/wails";
import { useStudioStore } from "@/store/useStudioStore";

export function useWailsLog() {
  const appendLog = useStudioStore((s) => s.appendLog);

  useEffect(() => {
    if (isUiOnlyMode()) {
      const locale = useStudioStore.getState().locale;
      appendLog(t("log.ui_preview", locale));
      return onDevLog(appendLog);
    }

    const off = Events.On("log", (ev) => {
      if (typeof ev.data === "string") appendLog(ev.data);
    });
    return off;
  }, [appendLog]);
}

const WAILS_READY_POLL_MS = 50;
const WAILS_READY_INITIAL_MS = 5000;
const WAILS_READY_LATE_MS = 10000;

/** Resolves when the Wails bridge appears or the initial wait elapses. */
export function waitForWailsReady(initialMs = WAILS_READY_INITIAL_MS): Promise<void> {
  if (isUiOnlyMode() || isWailsReady()) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const deadline = Date.now() + initialMs;
    const tick = () => {
      if (isWailsReady() || Date.now() >= deadline) {
        resolve();
        return;
      }
      window.setTimeout(tick, WAILS_READY_POLL_MS);
    };
    tick();
  });
}

/** Poll until Wails bridge is ready (for late WebView injection). */
export function waitUntilWailsReady(extraMs = WAILS_READY_LATE_MS): Promise<boolean> {
  if (isUiOnlyMode() || isWailsReady()) {
    return Promise.resolve(isWailsReady());
  }
  return new Promise((resolve) => {
    const deadline = Date.now() + extraMs;
    const tick = () => {
      if (isWailsReady()) {
        resolve(true);
        return;
      }
      if (Date.now() >= deadline) {
        resolve(false);
        return;
      }
      window.setTimeout(tick, WAILS_READY_POLL_MS);
    };
    tick();
  });
}

async function syncBackendLocale(locale: string) {
  if (isUiOnlyMode()) return;
  try {
    await api.setLocale(locale);
  } catch (e) {
    console.warn("SetLocale failed:", e);
  }
}

/** Sync UI locale to Go for log/error strings only — never blocks Connect/Dump. */
export function useStudioBoot() {
  const refreshPorts = useStudioStore((s) => s.refreshPorts);
  const refreshStatus = useStudioStore((s) => s.refreshStatus);
  const locale = useStudioStore((s) => s.locale);
  const syncedLocale = useRef<string | null>(null);
  const [wailsReady, setWailsReady] = useState(() => isWailsReady());

  useEffect(() => {
    if (isUiOnlyMode() || isWailsReady()) {
      setWailsReady(true);
      return;
    }
    let cancelled = false;
    void (async () => {
      await waitForWailsReady();
      if (cancelled) return;
      if (isWailsReady()) setWailsReady(true);
      const late = await waitUntilWailsReady();
      if (!cancelled && late) setWailsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refreshAll = async () => {
      await refreshPorts();
      if (cancelled) return;
      await refreshStatus();
      if (cancelled) return;
      await syncBackendLocale(useStudioStore.getState().locale);
    };

    void (async () => {
      await waitForWailsReady();
      if (cancelled) return;
      await refreshAll();
      if (cancelled || isUiOnlyMode() || isWailsReady()) return;

      const late = await waitUntilWailsReady();
      if (cancelled || !late) return;
      await refreshAll();
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshPorts, refreshStatus]);

  useEffect(() => {
    if (!wailsReady || isUiOnlyMode()) return;
    if (syncedLocale.current === locale) return;
    syncedLocale.current = locale;
    void syncBackendLocale(locale);
  }, [locale, wailsReady]);
}

/** Desktop chrome: transparent window + wails layout once the bridge is available. */
export function useWailsDesktop(): boolean {
  const [wailsDesktop, setWailsDesktop] = useState(() => isWailsReady() && !isUiOnlyMode());

  useEffect(() => {
    if (isUiOnlyMode()) {
      setWailsDesktop(false);
      return;
    }

    let cancelled = false;
    const apply = () => {
      if (!isWailsReady()) return false;
      if (!cancelled) setWailsDesktop(true);
      document.documentElement.classList.add("app-wails-transparent");
      return true;
    };

    if (apply()) {
      return () => {
        cancelled = true;
        document.documentElement.classList.remove("app-wails-transparent");
      };
    }

    void (async () => {
      await waitForWailsReady();
      if (cancelled) return;
      if (apply()) return;
      const late = await waitUntilWailsReady();
      if (!cancelled && late) apply();
    })();

    return () => {
      cancelled = true;
      document.documentElement.classList.remove("app-wails-transparent");
    };
  }, []);

  return wailsDesktop;
}
