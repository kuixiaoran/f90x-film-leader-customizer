import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, animate, motion, useMotionValue, type PanInfo } from "motion/react";
import { WorkChip } from "@/components/WorkChip";
import { LeaderPanel } from "@/components/LeaderPanel";
import { UI } from "@/assets/ui/assets";
import { LEADER_MAX, LEADER_MIN } from "@/lib/leader";
import { clampFilmPx, snapFilmToLeader } from "@/lib/filmLeader";
import { FILM_MASK_W, FILM_MAX_SHIFT_PX, STAGE, WORK_CHIP_HIT, WORK_FILM_DRAG_HIT, WORK_LEADER_IDLE_HIDE_MS } from "@/layout/uiStage";
import { commLinkBlink } from "@/layout/introMotion";
import {
  filmSnapSpring,
  rearCoverExit,
  rearCoverHingeOrigin,
  workEnterTransition,
  workLayerEnter,
} from "@/layout/workMotion";
import { t } from "@/lib/i18n";
import { promptSaveDump } from "@/lib/saveDump";
import { api, isUiOnlyMode } from "@/lib/wails";
import { useStudioStore } from "@/store/useStudioStore";

export function WorkScene() {
  const workPhase = useStudioStore((s) => s.workPhase);
  const coverVisible = useStudioStore((s) => s.coverVisible);
  const filmPx = useStudioStore((s) => s.filmPx);
  const leaderDraft = useStudioStore((s) => s.leaderDraft);
  const busy = useStudioStore((s) => s.busy);
  const status = useStudioStore((s) => s.status);
  const setBusy = useStudioStore((s) => s.setBusy);
  const setError = useStudioStore((s) => s.setError);
  const setFilmPx = useStudioStore((s) => s.setFilmPx);
  const setLeaderDraft = useStudioStore((s) => s.setLeaderDraft);
  const enterWorkEdit = useStudioStore((s) => s.enterWorkEdit);
  const refreshStatus = useStudioStore((s) => s.refreshStatus);
  const appendLog = useStudioStore((s) => s.appendLog);
  const locale = useStudioStore((s) => s.locale);
  const filmRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const filmX = useMotionValue(0);
  const dragStartPx = useRef(0);
  const draggingRef = useRef(false);
  const filmHoverRef = useRef(false);
  const leaderHideTimerRef = useRef<number | null>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [leaderRetracted, setLeaderRetracted] = useState(true);

  const clearLeaderHideTimer = useCallback(() => {
    if (leaderHideTimerRef.current !== null) {
      window.clearTimeout(leaderHideTimerRef.current);
      leaderHideTimerRef.current = null;
    }
  }, []);

  const expandLeader = useCallback(() => {
    clearLeaderHideTimer();
    setLeaderRetracted(false);
  }, [clearLeaderHideTimer]);

  const scheduleLeaderRetract = useCallback(() => {
    clearLeaderHideTimer();
    leaderHideTimerRef.current = window.setTimeout(() => {
      leaderHideTimerRef.current = null;
      if (!filmHoverRef.current && !draggingRef.current) {
        setLeaderRetracted(true);
      }
    }, WORK_LEADER_IDLE_HIDE_MS);
  }, [clearLeaderHideTimer]);

  useEffect(() => {
    if (workPhase === "edit" && !coverVisible) {
      setLeaderRetracted(true);
      clearLeaderHideTimer();
      filmHoverRef.current = false;
      return;
    }
    clearLeaderHideTimer();
  }, [workPhase, coverVisible, clearLeaderHideTimer]);

  useEffect(() => () => clearLeaderHideTimer(), [clearLeaderHideTimer]);

  const renderScale = useCallback(() => {
    const stage =
      sceneRef.current?.closest(".ui-stage") ??
      filmRef.current?.closest(".ui-stage");
    if (!stage) return 1;
    const w = stage.getBoundingClientRect().width;
    return w > 0 ? w / STAGE.w : 1;
  }, []);

  const stageScaleX = useCallback(() => {
    const scale = renderScale();
    return scale > 0 ? 1 / scale : 1;
  }, [renderScale]);

  const animateFilmTo = useCallback(
    (px: number, immediate = false) => {
      const target = px * renderScale();
      if (immediate) {
        filmX.set(target);
        return;
      }
      void animate(filmX, target, filmSnapSpring);
    },
    [filmX, renderScale],
  );

  useEffect(() => {
    if (draggingRef.current) return;
    animateFilmTo(filmPx);
  }, [filmPx, animateFilmTo]);

  /** MODIFY 进入时 filmPx 可能未变但缩放已就绪 — 强制同步胶片位置。 */
  useEffect(() => {
    if (draggingRef.current) return;
    if (workPhase === "edit" && !coverVisible) {
      animateFilmTo(filmPx, true);
    }
  }, [workPhase, coverVisible, filmPx, animateFilmTo]);

  useEffect(() => {
    const onResize = () => {
      if (!draggingRef.current) animateFilmTo(filmPx, true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [filmPx, animateFilmTo]);

  const designPxFromMotion = useCallback(() => {
    const scale = renderScale();
    return scale > 0 ? clampFilmPx(filmX.get() / scale) : 0;
  }, [filmX, renderScale]);

  const applyLeaderDetent = useCallback(
    (roughPx: number) => {
      const { leader, px } = snapFilmToLeader(roughPx);
      filmX.set(px * renderScale());
      setLeaderDraft(leader);
      return { leader, px };
    },
    [filmX, renderScale, setLeaderDraft],
  );

  const pxFromDragOffset = (offsetX: number) =>
    clampFilmPx(dragStartPx.current + offsetX * stageScaleX());

  const onFilmDrag = (_: PointerEvent, info: PanInfo) => {
    applyLeaderDetent(pxFromDragOffset(info.offset.x));
  };

  const onFilmDragStart = () => {
    draggingRef.current = true;
    expandLeader();
    dragStartPx.current = filmPx;
    const scale = renderScale();
    setDragConstraints({
      left: (-FILM_MAX_SHIFT_PX - filmPx) * scale,
      right: -filmPx * scale,
    });
  };

  const onFilmDragEnd = () => {
    const { leader, px } = applyLeaderDetent(designPxFromMotion());
    setFilmPx(px);
    setLeaderDraft(leader);
    draggingRef.current = false;
    if (!filmHoverRef.current) {
      scheduleLeaderRetract();
    }
  };

  const onFilmPointerEnter = () => {
    filmHoverRef.current = true;
    expandLeader();
  };

  const onFilmPointerLeave = () => {
    filmHoverRef.current = false;
    if (!draggingRef.current) {
      scheduleLeaderRetract();
    }
  };

  const handleDump = async () => {
    if (useStudioStore.getState().busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.dump();
      const ok = await refreshStatus();
      if (!ok || !useStudioStore.getState().status?.hasDump) {
        setError(t("err.dump_status_stale", locale), "err.dump_status_stale");
        return;
      }
      const saved = await promptSaveDump();
      if (saved === "skipped") {
        appendLog(t("log.dump_not_saved", locale));
      }
      enterWorkEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleModify = async () => {
    if (useStudioStore.getState().busy) return;
    const writeLeader = leaderDraft;
    setBusy(true);
    setError(null);
    try {
      await api.writeLeader(writeLeader);
      const ok = await refreshStatus();
      if (!ok) {
        setError(t("err.write_status_stale", locale), "err.write_status_stale");
        return;
      }
      const after = useStudioStore.getState().status;
      if (after && !after.checksumOk) {
        setError(t("err.write_checksum_verify", locale), "err.write_checksum_verify");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const chipHitStyle: CSSProperties = {
    left: `${WORK_CHIP_HIT.left * 100}%`,
    top: `${WORK_CHIP_HIT.top * 100}%`,
    width: `${WORK_CHIP_HIT.width * 100}%`,
    height: `${WORK_CHIP_HIT.height * 100}%`,
  };

  const filmDragHitStyle: CSSProperties = {
    left: `${WORK_FILM_DRAG_HIT.left * 100}%`,
    top: `${WORK_FILM_DRAG_HIT.top * 100}%`,
    width: `${WORK_FILM_DRAG_HIT.width * 100}%`,
    height: `${WORK_FILM_DRAG_HIT.height * 100}%`,
  };

  const filmInteractive = workPhase === "edit" && !coverVisible && !busy;
  const canDump = isUiOnlyMode() || Boolean(status?.connected);

  return (
    <div ref={sceneRef} className="scene-layers scene-work">
      <AnimatePresence>
        {busy ? (
          <motion.img
            key="work-comm-link"
            initial={{ opacity: 0 }}
            animate={commLinkBlink.animate}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={commLinkBlink.transition}
            src={UI.commLink}
            alt=""
            className="ui-layer z-work-comm intro-comm-link"
            draggable={false}
          />
        ) : null}
      </AnimatePresence>
      {workPhase === "edit" && !coverVisible ? (
        <LeaderPanel leader={leaderDraft} retracted={leaderRetracted} />
      ) : null}
      <motion.img
        {...workLayerEnter}
        transition={workEnterTransition(0)}
        src={UI.logoBottom}
        alt=""
        className="ui-layer z-1 ui-soft-shadow"
        draggable={false}
      />
      <motion.img
        {...workLayerEnter}
        transition={workEnterTransition(1)}
        src={UI.cameraBack}
        alt=""
        className="ui-layer z-2 ui-body-shadow"
        draggable={false}
      />

      <motion.div
        {...workLayerEnter}
        transition={workEnterTransition(2)}
        className="film-clip-layer z-3"
        style={
          {
            "--film-mask-w": FILM_MASK_W,
            "--stage-w": STAGE.w,
          } as CSSProperties
        }
      >
        <motion.div className="film-drag-track" style={{ x: filmX }}>
          <img src={UI.film} alt="" className="film-slide-img" draggable={false} />
        </motion.div>
      </motion.div>

      <motion.img
        {...workLayerEnter}
        transition={workEnterTransition(3)}
        src={UI.canister}
        alt=""
        className="ui-layer z-4"
        draggable={false}
      />

      {filmInteractive ? (
        <motion.div
          ref={filmRef}
          className="film-drag-handle z-8"
          style={filmDragHitStyle}
          drag="x"
          dragMomentum={false}
          dragElastic={0}
          dragSnapToOrigin
          dragConstraints={dragConstraints}
          onDragStart={onFilmDragStart}
          onDrag={onFilmDrag}
          onDragEnd={onFilmDragEnd}
          onPointerEnter={onFilmPointerEnter}
          onPointerLeave={onFilmPointerLeave}
          aria-label={t("ui.work.drag_film", locale)}
          role="slider"
          aria-valuemin={LEADER_MIN}
          aria-valuemax={LEADER_MAX}
          aria-valuenow={leaderDraft}
        />
      ) : null}

      <AnimatePresence>
        {coverVisible ? (
          <motion.img
            key="cover"
            {...workLayerEnter}
            transition={workEnterTransition(4)}
            src={UI.rearCover}
            alt=""
            className="ui-layer z-5 rear-cover-hinge"
            style={{ transformOrigin: rearCoverHingeOrigin }}
            draggable={false}
            exit={rearCoverExit}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {workPhase === "dump" && coverVisible ? (
          <motion.div
            key="dump-chip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.22 } }}
          >
            <WorkChip
              artSrc={UI.dumpBtn}
              label="DUMP"
              hitStyle={chipHitStyle}
              disabled={!canDump}
              busy={busy}
              onPress={handleDump}
            />
          </motion.div>
        ) : null}
        {workPhase === "edit" && !coverVisible ? (
          <motion.div
            key="modify-chip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.22 } }}
          >
            <WorkChip
              artSrc={UI.modifyBtn}
              label="MODIFY"
              hitStyle={chipHitStyle}
              busy={busy}
              onPress={handleModify}
              useLayerEnter={false}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
