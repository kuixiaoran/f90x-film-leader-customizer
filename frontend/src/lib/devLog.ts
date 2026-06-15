type LogListener = (line: string) => void;

const listeners = new Set<LogListener>();

export function emitDevLog(line: string): void {
  for (const listener of listeners) {
    listener(line);
  }
}

export function onDevLog(listener: LogListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
