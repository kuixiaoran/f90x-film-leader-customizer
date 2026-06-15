import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { UI } from "@/assets/ui/assets";
import { leaderToMm } from "@/lib/leader";
import { WORK_LEADER_PANEL, WORK_LEADER_SLIDE_RETRACT_X, WORK_LEADER_TEXT_NUDGE } from "@/layout/uiStage";
import { workEnterTransition } from "@/layout/workMotion";

type LeaderPanelProps = {
  leader: number;
  retracted: boolean;
};

const readoutStyle: CSSProperties = {
  left: `${WORK_LEADER_PANEL.left * 100}%`,
  top: `${WORK_LEADER_PANEL.top * 100}%`,
  width: `${WORK_LEADER_PANEL.width * 100}%`,
  height: `${WORK_LEADER_PANEL.height * 100}%`,
  ["--leader-text-nudge-x" as string]: `${WORK_LEADER_TEXT_NUDGE.x}px`,
  ["--leader-text-nudge-y" as string]: `${WORK_LEADER_TEXT_NUDGE.y}px`,
};

export function LeaderPanel({ leader, retracted }: LeaderPanelProps) {
  const mm = leaderToMm(leader);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={workEnterTransition(0)}
      className={`leader-panel-layer z-0${retracted ? " is-retracted" : ""}`}
      style={{ ["--leader-slide-x" as string]: `${WORK_LEADER_SLIDE_RETRACT_X}px` }}
      aria-hidden
    >
      <img src={UI.leaderBg} alt="" className="ui-layer leader-panel-bg" draggable={false} />
      <div className="leader-panel-readout font-led" style={readoutStyle}>
        <div className="leader-panel-label">LEADER</div>
        <div className="leader-panel-value">
          <span className="leader-panel-num">{mm.toString().padStart(2, "0")}</span>
          <span className="leader-panel-unit" aria-hidden>
            <span>m</span>
            <span>m</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
