import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UI } from "@/assets/ui/assets";
import { ComPortPicker } from "@/components/ComPortPicker";
import {
  cameraReveal,
  comPanelReveal,
  commLinkBlink,
  INTRO_TIMING,
  overlayRevealAt,
} from "@/layout/introMotion";
import {
  introCameraExit,
  introOverlayExit,
  introSceneExit,
} from "@/layout/workMotion";
import { INTRO_COM_PANEL, INTRO_CONNECT_HIT } from "@/layout/uiStage";
import { api } from "@/lib/wails";
import { t } from "@/lib/i18n";
import { useStudioStore } from "@/store/useStudioStore";
/** 1 = film only (AppStage) · 2 = camera · 3 = logo + port together */
type IntroStep = 1 | 2 | 3;

export function IntroScene() {
  const ports = useStudioStore((s) => s.ports);
  const selectedPort = useStudioStore((s) => s.selectedPort);
  const status = useStudioStore((s) => s.status);
  const connected = Boolean(status?.connected);
  const busy = useStudioStore((s) => s.busy);
  const setBusy = useStudioStore((s) => s.setBusy);
  const setError = useStudioStore((s) => s.setError);
  const locale = useStudioStore((s) => s.locale);
  const setSelectedPort = useStudioStore((s) => s.setSelectedPort);
  const refreshStatus = useStudioStore((s) => s.refreshStatus);
  const enterWorkDump = useStudioStore((s) => s.enterWorkDump);

  const [step, setStep] = useState<IntroStep>(1);
  const [commLinkActive, setCommLinkActive] = useState(false);

  useEffect(() => {
    const tCamera = window.setTimeout(
      () => setStep(2),
      INTRO_TIMING.camera,
    );
    const tOverlay = window.setTimeout(
      () => setStep(3),
      INTRO_TIMING.overlay,
    );
    return () => {
      window.clearTimeout(tCamera);
      window.clearTimeout(tOverlay);
    };
  }, []);

  useEffect(() => {
    if (!connected) return;
    const t = window.setTimeout(() => {
      enterWorkDump();
    }, 320);
    return () => window.clearTimeout(t);
  }, [connected, enterWorkDump]);

  const handleConnect = async () => {
    if (useStudioStore.getState().busy) return;
    if (!selectedPort) {
      setError(t("err.select_com", locale), "err.select_com");
      return;
    }
    setBusy(true);
    setError(null);
    setCommLinkActive(true);
    try {
      await api.connect(selectedPort);
      const ok = await refreshStatus();
      if (!ok) {
        setError(t("err.connect_status", locale), "err.connect_status");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setCommLinkActive(false);
    }
  };

  return (
    <motion.div
      className="scene-layers scene-intro"
      exit={introSceneExit}
    >
      {step >= 2 ? (
        <motion.img
          key="camera-intro"
          {...cameraReveal}
          exit={introCameraExit}
          src={UI.cameraIntro}
          alt=""
          className="ui-layer z-intro-1 ui-body-shadow"
          draggable={false}
        />
      ) : null}

      {step >= 3 ? (
        <>
          <AnimatePresence>
            {commLinkActive ? (
              <motion.img
                key="comm-link"
                initial={{ opacity: 0 }}
                animate={commLinkBlink.animate}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={commLinkBlink.transition}
                src={UI.commLink}
                alt=""
                className="ui-layer z-intro-2 intro-comm-link"
                draggable={false}
              />
            ) : null}
          </AnimatePresence>
          <motion.img
            key="logo-intro"
            {...overlayRevealAt(0)}
            exit={introOverlayExit}
            src={UI.logoIntro}
            alt=""
            className="ui-layer z-intro-3 ui-soft-shadow"
            draggable={false}
          />
          <motion.img
            key={connected ? "port-on" : "port-off"}
            {...overlayRevealAt(0)}
            exit={introOverlayExit}
            src={connected ? UI.portConnected : UI.portIdle}
            alt=""
            className="ui-layer z-intro-4"
            draggable={false}
          />
          <motion.div
            {...comPanelReveal}
            exit={introOverlayExit}
            className="intro-com-panel z-intro-5"
            style={{
              left: `${INTRO_COM_PANEL.left * 100}%`,
              top: `${INTRO_COM_PANEL.top * 100}%`,
              width: `${INTRO_COM_PANEL.width * 100}%`,
              height: `${INTRO_COM_PANEL.height * 100}%`,
            }}
          >
            <ComPortPicker
              ports={ports}
              value={selectedPort}
              disabled={busy || connected}
              onChange={setSelectedPort}
            />
          </motion.div>
          <motion.button
            {...overlayRevealAt(3)}
            exit={introOverlayExit}
            type="button"
            className="intro-connect-hit z-intro-6"
            style={{
              left: `${INTRO_CONNECT_HIT.left * 100}%`,
              top: `${INTRO_CONNECT_HIT.top * 100}%`,
              width: `${INTRO_CONNECT_HIT.width * 100}%`,
              height: `${INTRO_CONNECT_HIT.height * 100}%`,
            }}
            disabled={busy || connected || !selectedPort}
            onClick={() => void handleConnect()}
            aria-label={t("ui.intro.connect_aria", locale)}
          />
        </>
      ) : null}
    </motion.div>
  );
}