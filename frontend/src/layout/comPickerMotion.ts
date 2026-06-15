import { introEase } from "@/layout/introMotion";

/** Shared easing — open slightly soft, close snappy. */
export const pickerEase = introEase;
export const pickerCloseEase = [0.42, 0, 0.58, 1] as const;

export const pickerTapTransition = {
  type: "spring" as const,
  stiffness: 620,
  damping: 34,
};

export const pickerChevronTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export const pickerValueVariants = {
  initial: { opacity: 0, scale: 0.9, y: 2 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.05, y: -2 },
};

export const pickerValueTransition = {
  duration: 0.13,
  ease: pickerEase,
};

export function pickerMenuVariants(itemCount: number) {
  const stagger = Math.min(0.032, 0.14 / Math.max(itemCount, 1));

  return {
    hidden: {
      opacity: 0,
      y: 8,
      scaleY: 0.84,
      scaleX: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scaleY: 1,
      scaleX: 1,
      transition: {
        duration: 0.26,
        ease: pickerEase,
        when: "beforeChildren" as const,
        delayChildren: 0.035,
        staggerChildren: stagger,
      },
    },
    exit: {
      opacity: 0,
      y: 5,
      scaleY: 0.9,
      scaleX: 0.99,
      transition: {
        duration: 0.15,
        ease: pickerCloseEase,
        when: "afterChildren" as const,
        staggerChildren: Math.min(stagger * 0.55, 0.018),
        staggerDirection: -1 as const,
      },
    },
  };
}

export const pickerOptionVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.17, ease: pickerEase },
  },
  exit: {
    opacity: 0,
    y: 2,
    transition: { duration: 0.09, ease: pickerCloseEase },
  },
};
