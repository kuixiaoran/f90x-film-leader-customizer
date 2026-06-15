import { useCallback, useEffect, useState } from "react";
import type { ChecksumInfoDTO } from "@/lib/studioTypes";
import { t } from "@/lib/i18n";
import { api } from "@/lib/wails";
import { useStudioStore } from "@/store/useStudioStore";

function hexByte(v: number): string {
  if (v < 0) return "—";
  return `0x${v.toString(16).padStart(2, "0").toUpperCase()}`;
}

export function AdvancedPanel() {
  const status = useStudioStore((s) => s.status);
  const scene = useStudioStore((s) => s.scene);
  const workPhase = useStudioStore((s) => s.workPhase);
  const busy = useStudioStore((s) => s.busy);
  const locale = useStudioStore((s) => s.locale);
  const setBusy = useStudioStore((s) => s.setBusy);
  const setError = useStudioStore((s) => s.setError);
  const refreshStatus = useStudioStore((s) => s.refreshStatus);

  const [info, setInfo] = useState<ChecksumInfoDTO | null>(null);
  const [hex, setHex] = useState("");

  const reload = useCallback(async () => {
    try {
      const [checksum, dumpHex] = await Promise.all([
        api.getChecksumInfo(),
        api.getDumpHex(),
      ]);
      setInfo(checksum);
      setHex(dumpHex);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [setError]);

  useEffect(() => {
    if (busy) return;
    void reload();
  }, [reload, busy, status?.hasDump, status?.checksumOk, status?.leader]);

  const handleWriteChecksum = async () => {
    if (useStudioStore.getState().busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.writeChecksumOnly();
      await refreshStatus();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleRefreshDump = async () => {
    if (useStudioStore.getState().busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.refreshDump();
      await refreshStatus();
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const hasDump = info?.hasDump ?? false;
  const inModify = scene === "work" && workPhase === "edit";
  const canWrite = hasDump && !busy && Boolean(status?.port);
  const canRedump = inModify && !busy && Boolean(status?.port);

  return (
    <aside className="advanced-panel" aria-label={t("ui.advanced.aria", locale)}>
      <div className="advanced-panel-head">
        <span className="advanced-panel-head-label">{t("ui.advanced.title", locale)}</span>
        <div className="advanced-panel-actions">
          <button
            type="button"
            className="advanced-panel-btn"
            disabled={busy}
            onClick={() => void reload()}
          >
            {t("ui.advanced.refresh", locale)}
          </button>
          {inModify ? (
            <button
              type="button"
              className="advanced-panel-btn"
              disabled={!canRedump}
              title={t("ui.advanced.redump_hint", locale)}
              onClick={() => void handleRefreshDump()}
            >
              {t("ui.advanced.redump", locale)}
            </button>
          ) : null}
          <button
            type="button"
            className="advanced-panel-btn advanced-panel-btn--accent"
            disabled={!canWrite}
            title={!status?.port ? t("ui.advanced.need_dump_hint", locale) : undefined}
            onClick={() => void handleWriteChecksum()}
          >
            {t("ui.advanced.write_checksum", locale)}
          </button>
        </div>
      </div>

      <div className="advanced-panel-body">
        {!hasDump ? (
          <p className="advanced-panel-empty">{t("ui.advanced.empty", locale)}</p>
        ) : (
          <>
            <dl className="advanced-panel-stats">
              <div>
                <dt>0x169</dt>
                <dd>{hexByte(info?.leader ?? -1)} (DEC {info?.leader ?? "—"})</dd>
              </div>
              <div>
                <dt>{t("ui.advanced.checksum_current", locale)}</dt>
                <dd>{hexByte(info?.current ?? -1)}</dd>
              </div>
              <div>
                <dt>{t("ui.advanced.checksum_expected", locale)}</dt>
                <dd>{hexByte(info?.expected ?? -1)}</dd>
              </div>
              <div>
                <dt>{t("ui.advanced.verify", locale)}</dt>
                <dd className={info?.ok ? "is-ok" : "is-bad"}>
                  {info?.ok
                    ? t("ui.advanced.verify_ok", locale)
                    : t("ui.advanced.verify_fail", locale)}
                  {info?.sumMod != null && info.sumMod >= 0
                    ? t("ui.advanced.sum_mod", locale, { s: String(info.sumMod) })
                    : ""}
                </dd>
              </div>
            </dl>
            <pre className="advanced-panel-hex">{hex || "—"}</pre>
          </>
        )}
      </div>
    </aside>
  );
}
