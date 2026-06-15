import { api, isUiOnlyMode, isWailsReady } from "@/lib/wails";

/** Prompt user to save Dump BIN; returns whether a file was written. */
export async function promptSaveDump(): Promise<"saved" | "skipped"> {
  if (!isUiOnlyMode() && !isWailsReady()) {
    return "skipped";
  }
  const saved = await api.promptSaveDump();
  return saved ? "saved" : "skipped";
}
