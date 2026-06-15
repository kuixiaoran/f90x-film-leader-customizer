import { useEffect, useRef, type ReactNode } from "react";
import { STAGE } from "@/layout/uiStage";

type UiStageProps = {
  children: ReactNode;
  className?: string;
  /** Cover-fit: fill parent, crop edges — no letterbox bars. */
  fill?: boolean;
};

export function UiStage({ children, className = "", fill = false }: UiStageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const syncScale = () => {
      const host = fill ? (el.parentElement ?? el) : el;
      const { width, height } = host.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      if (fill) {
        const cover = Math.max(width / STAGE.w, height / STAGE.h);
        el.style.setProperty("--stage-scale", String(cover));
        el.style.width = `${STAGE.w * cover}px`;
        el.style.height = `${STAGE.h * cover}px`;
        return;
      }

      if (width > 0) {
        el.style.removeProperty("width");
        el.style.removeProperty("height");
        el.style.setProperty("--stage-scale", String(width / STAGE.w));
      }
    };

    syncScale();
    const ro = new ResizeObserver(syncScale);
    ro.observe(el);
    if (fill && el.parentElement) ro.observe(el.parentElement);
    window.addEventListener("resize", syncScale);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncScale);
    };
  }, [fill]);

  return (
    <div
      ref={ref}
      className={`ui-stage${fill ? " ui-stage--fill" : ""} ${className}`.trim()}
      style={fill ? undefined : { aspectRatio: `${STAGE.w} / ${STAGE.h}` }}
    >
      {children}
    </div>
  );
}
