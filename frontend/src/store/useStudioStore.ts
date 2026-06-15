import { create } from "zustand";
import type { SceneId, WorkPhase } from "@/flow/scenes";
import { preferredComPort } from "@/lib/comPort";
import { filmPxFromLeader } from "@/lib/filmLeader";
import {
  getStartupLogs,
  isUiPreviewLine,
  loadLocale,
  saveLocale,
  STARTUP_LOG_COUNT,
  t,
  type Locale,
} from "@/lib/i18n";
import { translateErrorLine } from "@/lib/i18n/errors";
import { translateLogLines } from "@/lib/i18n/logLines";
import { clampLeader } from "@/lib/leader";
import type { StatusDTO } from "@/lib/studioTypes";
import { api, isUiOnlyMode } from "@/lib/wails";

type StudioState = {
  scene: SceneId;
  workPhase: WorkPhase;
  coverVisible: boolean;
  filmPx: number;
  ports: string[];
  selectedPort: string;
  status: StatusDTO | null;
  leaderDraft: number;
  busy: boolean;
  error: string | null;
  errorKey: string | null;
  errorParams: Record<string, string | number> | undefined;
  logs: string[];
  locale: Locale;
  setScene: (scene: SceneId) => void;
  setFilmPx: (px: number) => void;
  refreshPorts: () => Promise<void>;
  refreshStatus: () => Promise<boolean>;
  appendLog: (line: string) => void;
  setLeaderDraft: (v: number) => void;
  setBusy: (b: boolean) => void;
  setError: (
    msg: string | null,
    key?: string | null,
    params?: Record<string, string | number>,
  ) => void;
  setSelectedPort: (port: string) => void;
  setLocale: (locale: Locale) => void;
  enterWorkDump: () => void;
  enterWorkEdit: () => void;
};

const initialLocale = loadLocale();

export const useStudioStore = create<StudioState>((set, get) => ({
  scene: "intro",
  workPhase: "dump",
  coverVisible: true,
  filmPx: 0,
  ports: [],
  selectedPort: "",
  status: null,
  leaderDraft: 6,
  busy: false,
  error: null,
  errorKey: null,
  errorParams: undefined,
  locale: initialLocale,
  logs: getStartupLogs(initialLocale),

  setScene: (scene) => set({ scene }),
  setFilmPx: (filmPx) => set({ filmPx }),

  setLocale: (locale) => {
    set((s) => {
      try {
        const skip =
          STARTUP_LOG_COUNT +
          (isUiOnlyMode() &&
          s.logs.length > STARTUP_LOG_COUNT &&
          isUiPreviewLine(s.logs[STARTUP_LOG_COUNT])
            ? 1
            : 0);
        const head = isUiOnlyMode()
          ? [...getStartupLogs(locale), t("log.ui_preview", locale)]
          : getStartupLogs(locale);
        const operational = translateLogLines(s.logs.slice(skip), locale);
        let nextError = s.error;
        if (s.errorKey) {
          nextError = t(s.errorKey, locale, s.errorParams);
        } else if (s.error) {
          nextError = translateErrorLine(s.error, locale);
        }
        return {
          locale,
          logs: [...head, ...operational],
          error: nextError,
        };
      } catch (e) {
        console.error("setLocale failed:", e);
        return { locale };
      }
    });
    saveLocale(locale);
  },

  enterWorkDump: () =>
    set({
      scene: "work",
      workPhase: "dump",
      coverVisible: true,
    }),

  enterWorkEdit: () => {
    const leader = get().status?.leader ?? get().leaderDraft;
    const px = filmPxFromLeader(leader);
    set({
      scene: "work",
      workPhase: "edit",
      coverVisible: false,
      filmPx: px,
      leaderDraft: clampLeader(leader),
    });
  },

  refreshPorts: async () => {
    try {
      const ports = await api.listPorts();
      set((s) => ({
        ports,
        selectedPort:
          s.selectedPort && ports.includes(s.selectedPort)
            ? s.selectedPort
            : preferredComPort(ports),
      }));
    } catch (e) {
      console.error("refreshPorts failed:", e);
    }
  },

  refreshStatus: async () => {
    try {
      const status = await api.getStatus();
      set({
        status,
        leaderDraft: status.leader,
        filmPx: filmPxFromLeader(status.leader),
      });
      return true;
    } catch (e) {
      console.error("refreshStatus failed:", e);
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: msg, errorKey: null, errorParams: undefined });
      return false;
    }
  },

  appendLog: (line) =>
    set((s) => ({ logs: [...s.logs.slice(-200), line] })),

  setLeaderDraft: (v) => set({ leaderDraft: v }),
  setBusy: (busy) => set({ busy }),
  setError: (msg, key, params) => {
    if (msg === null && !key) {
      set({ error: null, errorKey: null, errorParams: undefined });
      return;
    }
    const locale = get().locale;
    const errorKey = key ?? null;
    set({
      error: errorKey ? t(errorKey, locale, params) : msg,
      errorKey,
      errorParams: params,
    });
  },
  setSelectedPort: (selectedPort) => set({ selectedPort }),
}));
