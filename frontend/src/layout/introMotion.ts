/** Intro stagger timings (ms from mount). */
export const INTRO_TIMING = {
  /** After film slide settles */
  camera: 920,
  /** Logo + port + COM — after camera fade */
  overlay: 1780,
} as const;

export const introEase = [0.22, 1, 0.36, 1] as const;

export const filmBgSlide = {
  initial: { x: "-100%" },
  animate: { x: 0, transition: { duration: 1.05, ease: introEase } },
  exit: {
    x: "-105%",
    opacity: 0.35,
    transition: { duration: 0.92, ease: introEase, delay: 0.16 },
  },
} as const;

export const cameraReveal = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.92, ease: introEase },
} as const;

/** Stagger overlay layers in step 3 (logo + port together → picker → connect). */
export const INTRO_OVERLAY_STAGGER = 0.1;

export function overlayRevealAt(index: number) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 0.66,
      ease: introEase,
      delay: index * INTRO_OVERLAY_STAGGER,
    },
  } as const;
}

/** COM digit slot — lands shortly after port graphic. */
export const comPanelReveal = {
  initial: { opacity: 0, y: 4, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.34, ease: introEase, delay: 0.2 },
} as const;

/** Comm link overlay — fast blink while connecting. */
export const commLinkBlink = {
  animate: { opacity: [1, 0.14, 1] },
  transition: {
    duration: 0.32,
    repeat: Infinity,
    ease: "linear" as const,
  },
} as const;
