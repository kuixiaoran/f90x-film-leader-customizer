import { dragTFromLeader, leaderFromDragT } from "@/lib/leader";
import { FILM_MAX_SHIFT_PX } from "@/layout/uiStage";

/** @1x stage coords: 0 = initial (DEC 6, rightmost); −345 = leftmost (DEC 31). */
export function clampFilmPx(px: number): number {
  return Math.min(0, Math.max(-FILM_MAX_SHIFT_PX, px));
}

function dragTFromFilmPx(px: number): number {
  if (FILM_MAX_SHIFT_PX <= 0) return 1;
  // px=0 → t=1 (DEC 6); px=−MAX → t=0 (DEC 31) — matches Go LeaderValueToDrag.
  return 1 - clampFilmPx(px) / -FILM_MAX_SHIFT_PX;
}

function filmPxFromDragT(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  return clampFilmPx((u - 1) * FILM_MAX_SHIFT_PX);
}

/** Map film position to EEPROM DEC (6–31). */
export function leaderFromFilmPx(px: number): number {
  return leaderFromDragT(dragTFromFilmPx(px));
}

/** Map EEPROM DEC to film position (one detent per integer). */
export function filmPxFromLeader(leader: number): number {
  return filmPxFromDragT(dragTFromLeader(leader));
}

/** Snap arbitrary film px to the nearest leader detent. */
export function snapFilmToLeader(px: number): { leader: number; px: number } {
  const leader = leaderFromFilmPx(px);
  return { leader, px: filmPxFromLeader(leader) };
}

/** Exported for tests — must stay aligned with Go LeaderDragToValue. */
export { dragTFromFilmPx, filmPxFromDragT, leaderFromDragT, dragTFromLeader };
