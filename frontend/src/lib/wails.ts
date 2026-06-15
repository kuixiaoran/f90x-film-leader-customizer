import { mockApi } from "@/lib/mockApi";
import type { StudioBridge } from "@/lib/studioTypes";
import * as StudioAPI from "@bindings/f90x_eeprom_studio/studioservice";

/** Real Wails v3 bridge when running inside the desktop WebView. */
export function isWailsReady(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as Window & {
    chrome?: { webview?: { postMessage?: unknown } };
    webkit?: { messageHandlers?: { external?: { postMessage?: unknown } } };
  };
  return Boolean(
    w.chrome?.webview?.postMessage ??
      w.webkit?.messageHandlers?.external?.postMessage,
  );
}

/**
 * UI preview when no Wails bridge (browser).
 * Set VITE_USE_WAILS=0 to force mock even inside the desktop app.
 */
export function isUiOnlyMode(): boolean {
  if (import.meta.env.VITE_USE_WAILS === "0") {
    return true;
  }
  return !isWailsReady();
}

const backend: StudioBridge = {
  ListPorts: () => StudioAPI.ListPorts(),
  Connect: (port) => StudioAPI.Connect(port),
  GetStatus: () => StudioAPI.GetStatus(),
  Dump: () => StudioAPI.Dump(),
  WriteLeader: (length) => StudioAPI.WriteLeader(length),
  GetChecksumInfo: () => StudioAPI.GetChecksumInfo(),
  GetDumpHex: () => StudioAPI.GetDumpHex(),
  WriteChecksumOnly: () => StudioAPI.WriteChecksumOnly(),
  RefreshDump: () => StudioAPI.RefreshDump(),
  PromptSaveDump: () => StudioAPI.PromptSaveDump(),
};

function bridge(): StudioBridge {
  return isUiOnlyMode() ? mockApi : backend;
}

/** camelCase facade for React scenes */
export const api = {
  listPorts: () => bridge().ListPorts(),
  connect: (port: string) => bridge().Connect(port),
  getStatus: () => bridge().GetStatus(),
  dump: () => bridge().Dump(),
  writeLeader: (length: number) => bridge().WriteLeader(length),
  getChecksumInfo: () => bridge().GetChecksumInfo(),
  getDumpHex: () => bridge().GetDumpHex(),
  writeChecksumOnly: () => bridge().WriteChecksumOnly(),
  refreshDump: () => bridge().RefreshDump(),
  promptSaveDump: () => bridge().PromptSaveDump(),
  /** Backend log language only; Connect/Dump do not depend on this. */
  setLocale: (locale: string) => {
    if (isUiOnlyMode()) return Promise.resolve();
    return StudioAPI.SetLocale(locale);
  },
};

export type { StatusDTO, ChecksumInfoDTO, StudioBridge } from "@/lib/studioTypes";
