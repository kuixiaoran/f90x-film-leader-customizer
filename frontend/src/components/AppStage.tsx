import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UI } from "@/assets/ui/assets";
import { filmBgSlide, introEase } from "@/layout/introMotion";
import { IntroScene } from "@/scenes/IntroScene";
import { WorkScene } from "@/scenes/WorkScene";
import { useStudioStore } from "@/store/useStudioStore";
import { UiStage } from "./UiStage";

export function AppStage() {
  const scene = useStudioStore((s) => s.scene);
  const [filmEnter, setFilmEnter] = useState(false);

  useEffect(() => {
    if (scene !== "intro") {
      setFilmEnter(false);
      return;
    }
    setFilmEnter(false);
    const id = window.requestAnimationFrame(() => {
      setFilmEnter(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, [scene]);

  return (
    <div className="app-scene-shell">
      <div className="app-scene-fill-host">
        <UiStage className={`app-ui-stage ui-stage--${scene}`} fill>
          <AnimatePresence>
            {scene === "intro" ? (
              <motion.img
                key="intro-film-bg"
                initial={{ x: "-100%" }}
                animate={{ x: filmEnter ? 0 : "-100%" }}
                exit={filmBgSlide.exit}
                transition={{ duration: 1.05, ease: introEase }}
                src={UI.filmBg}
                alt=""
                className="ui-layer ui-layer-film-bg"
                draggable={false}
              />
            ) : null}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {scene === "intro" ? <IntroScene key="intro" /> : null}
            {scene === "work" ? <WorkScene key="work" /> : null}
          </AnimatePresence>
        </UiStage>
      </div>
    </div>
  );
}
