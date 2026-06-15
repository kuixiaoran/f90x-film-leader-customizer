import { introEase } from "@/layout/introMotion";

/** Stagger work layers bottom → top (z-1 … z-6). */
export const WORK_LAYER_STAGGER_S = 0.095;
export const WORK_LAYER_ENTER_DURATION = 0.5;

export const workEnterTransition = (index: number) => ({
  delay: index * WORK_LAYER_STAGGER_S,
  duration: WORK_LAYER_ENTER_DURATION,
  ease: introEase,
});

export const workLayerEnter = {
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
} as const;

/** Intro root — overlay / UI leaves first (reverse DOM). */
export const introSceneExit = {
  transition: {
    staggerChildren: 0.1,
    staggerDirection: -1,
  },
} as const;

export const introOverlayExit = {
  opacity: 0,
  y: -14,
  transition: { duration: 0.38, ease: introEase },
} as const;

export const introCameraExit = {
  opacity: 0,
  y: 18,
  scale: 0.992,
  transition: { duration: 0.44, ease: introEase },
} as const;

/** Rear cover — hinge on camera-back right edge, opens to the right. */
export const rearCoverHingeOrigin = "73% 71%";

export const rearCoverExit = {
  rotateY: -86,
  opacity: 0,
  x: "5%",
  transition: { duration: 0.72, ease: introEase },
} as const;

/** DUMP / MODIFY chip art — pressed key travel. */
export const chipPressTransition = {
  type: "spring" as const,
  stiffness: 680,
  damping: 32,
};

export function chipArtMotion(pressed: boolean, busy: boolean) {
  return {
    opacity: 1,
    y: pressed ? 3 : 0,
    scale: pressed ? 0.992 : 1,
    filter: pressed
      ? "brightness(0.88)"
      : busy
        ? "brightness(0.94)"
        : "brightness(1)",
  };
}

/** Film track — snap to leader frame after drag. */
export const filmSnapSpring = {
  type: "spring" as const,
  stiffness: 480,
  damping: 34,
};
