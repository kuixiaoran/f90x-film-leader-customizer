/** Main stage size (@1x unified exports). */
export const STAGE = {
  w: 1921,
  h: 1081,
  aspect: 1921 / 1081,
} as const;

/** Left band (680px) blocks film; visible window is to the right. */
export const FILM_MASK_W = 680;

/** Max drag left for film strip → 0x169 DEC 31 (5mm leader). */
export const FILM_MAX_SHIFT_PX = 345;

/** "COM" label bbox on layer 4/5 (@1x 1920×1081). */
export const INTRO_COM_TEXT = {
  left: 0.6296875,
  top: 0.1665,
  width: 0.128125,
  height: 0.1545,
} as const;

/** "COM" letters tight bbox on port-idle layer (@1x measured). */
export const INTRO_COM_WORD = {
  left: 0.6390625,
  top: 0.1665,
  width: 0.0552,
  height: 0.0352,
} as const;

/** COM number picker — sized to digit slot beside label on layer 4/5. */
export const INTRO_COM_PICKER = {
  /** Gap between “COM” letters and digit slot (stage width fraction). */
  gap: 0.002,
} as const;

/** Digit slot to the right of “COM” on the grey status strip (@1x measured). */
export const INTRO_COM_DIGIT_SLOT = {
  left: INTRO_COM_WORD.left + INTRO_COM_WORD.width + INTRO_COM_PICKER.gap,
  top: INTRO_COM_WORD.top,
  width: INTRO_COM_TEXT.left + INTRO_COM_TEXT.width - (INTRO_COM_WORD.left + INTRO_COM_WORD.width + INTRO_COM_PICKER.gap),
  height: INTRO_COM_WORD.height,
} as const;

/** COM picker panel anchor (percent of stage). */
export const INTRO_COM_PANEL = INTRO_COM_DIGIT_SLOT;

/** Work-scene chip hotspot — DUMP/MODIFY layers 11/12 share same bbox (@1x, measured). */
export const WORK_CHIP_HIT = {
  left: 0.6184,
  top: 0.1129,
  width: 0.1406,
  height: 0.1776,
} as const;

/** Film drag handle — chamber from canister slot to before take-up spool (@1x, measured). */
export const WORK_FILM_DRAG_HIT = {
  left: 0.2301,
  top: 0.5171,
  width: 0.3144,
  height: 0.2877,
} as const;

/** Leader LED panel — dark core on 14-leader-bg (@1x measured). */
export const WORK_LEADER_PANEL = {
  left: 227 / STAGE.w,
  top: 610 / STAGE.h,
  width: 235 / STAGE.w,
  height: 195 / STAGE.h,
} as const;

/** Readout fine-tune (@1x stage px). */
export const WORK_LEADER_TEXT_NUDGE = {
  x: -155,
  y: 0,
} as const;

/** Retracted slide — whole panel shifts right when idle (@1x px). */
export const WORK_LEADER_SLIDE_RETRACT_X = 230;

/** Idle hide delay after pointer leaves film drag area (ms). */
export const WORK_LEADER_IDLE_HIDE_MS = 3000;

/** Invisible connect hit over DB9 port graphic below the label. */
export const INTRO_CONNECT_HIT = {
  left: 0.632,
  top: 0.227,
  width: 0.123,
  height: 0.09,
} as const;
