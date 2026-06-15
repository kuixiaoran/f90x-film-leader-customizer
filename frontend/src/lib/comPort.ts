/** "COM2" → "2"; empty / unknown → "". */
export function comPortNumber(port: string): string {
  if (!port) return "";
  const match = port.match(/(\d+)/);
  return match ? match[1] : port;
}

/** Prefer COM1 when present; otherwise lowest COM number. */
export function preferredComPort(ports: string[]): string {
  if (ports.length === 0) return "";
  const com1 = ports.find((p) => /^COM1$/i.test(p));
  if (com1) return com1;
  return [...ports].sort((a, b) => {
    const na = Number(comPortNumber(a));
    const nb = Number(comPortNumber(b));
    const va = Number.isFinite(na) ? na : Number.POSITIVE_INFINITY;
    const vb = Number.isFinite(nb) ? nb : Number.POSITIVE_INFINITY;
    return va - vb;
  })[0];
}