export const LEADER_MIN = 6; // 留片头 55mm
export const LEADER_MAX = 31; // 留片头 5mm（详见 README「0x169 留片头」）
export const LEADER_MM_AT_MIN = 55;
export const LEADER_MM_AT_MAX = 5;

export function clampLeader(value: number): number {
  return Math.min(LEADER_MAX, Math.max(LEADER_MIN, Math.round(value)));
}

/** DEC 6→55 mm，DEC 31→5 mm，中间线性；每增减 1 档 DEC，约 2 mm。 */
export function leaderToMm(leader: number): number {
  const v = clampLeader(leader);
  const t = (v - LEADER_MIN) / (LEADER_MAX - LEADER_MIN);
  return Math.round(LEADER_MM_AT_MIN - t * (LEADER_MM_AT_MIN - LEADER_MM_AT_MAX));
}

/**
 * Drag position 0..1 → DEC 6..31 (matches studio_service.go LeaderDragToValue).
 * t=1 → DEC 6 (longest leader), t=0 → DEC 31 (shortest).
 */
export function leaderFromDragT(t: number): number {
  const u = Math.min(1, Math.max(0, t));
  const span = LEADER_MAX - LEADER_MIN;
  return clampLeader(Math.round(LEADER_MAX - u * span));
}

/** Inverts leaderFromDragT (matches studio_service.go LeaderValueToDrag). */
export function dragTFromLeader(leader: number): number {
  const span = LEADER_MAX - LEADER_MIN;
  if (span <= 0) return 0;
  return (LEADER_MAX - clampLeader(leader)) / span;
}
