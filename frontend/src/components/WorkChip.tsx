import { useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import {
  chipArtMotion,
  chipPressTransition,
  workEnterTransition,
  workLayerEnter,
} from "@/layout/workMotion";

type WorkChipProps = {
  artSrc: string;
  label: "DUMP" | "MODIFY";
  hitStyle: CSSProperties;
  disabled?: boolean;
  busy?: boolean;
  onPress: () => void;
  layerIndex?: number;
  useLayerEnter?: boolean;
};

export function WorkChip({
  artSrc,
  label,
  hitStyle,
  disabled = false,
  busy = false,
  onPress,
  layerIndex = 5,
  useLayerEnter = true,
}: WorkChipProps) {
  const [pressed, setPressed] = useState(false);
  const enter = useLayerEnter ? workEnterTransition(layerIndex) : undefined;

  const release = () => setPressed(false);
  const press = () => {
    if (!disabled && !busy) setPressed(true);
  };

  return (
    <>
      <motion.img
        key={`${label}-art`}
        src={artSrc}
        alt=""
        className="ui-layer z-6 work-chip-art"
        draggable={false}
        initial={useLayerEnter ? workLayerEnter.initial : false}
        animate={chipArtMotion(pressed, busy)}
        transition={
          useLayerEnter && enter
            ? { ...enter, ...chipPressTransition }
            : chipPressTransition
        }
      />
      <motion.button
        key={`${label}-hit`}
        type="button"
        className={`work-action-hit z-10${busy ? " work-action-hit--busy" : ""}`}
        style={hitStyle}
        initial={useLayerEnter ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={enter}
        disabled={disabled || busy}
        aria-label={label}
        aria-busy={busy}
        onPointerDown={press}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={release}
        onClick={() => void onPress()}
        whileHover={disabled || busy ? undefined : { scale: 1.012 }}
        whileTap={disabled || busy ? undefined : { scale: 0.988 }}
      />
    </>
  );
}
