import type { SceneId, WorkPhase } from "@/flow/scenes";
import { seedMockIntro, seedMockWorkDump, seedMockWorkEdit } from "@/lib/mockApi";
import { isUiOnlyMode } from "@/lib/wails";
import { useStudioStore } from "@/store/useStudioStore";

const jumps: { id: SceneId; phase?: WorkPhase; label: string }[] = [
  { id: "intro", label: "开场 1-4" },
  { id: "work", phase: "dump", label: "工作 DUMP" },
  { id: "work", phase: "edit", label: "工作 MODIFY" },
];

export function DevToolbar() {
  const scene = useStudioStore((s) => s.scene);
  const workPhase = useStudioStore((s) => s.workPhase);
  const setScene = useStudioStore((s) => s.setScene);
  const enterWorkDump = useStudioStore((s) => s.enterWorkDump);
  const enterWorkEdit = useStudioStore((s) => s.enterWorkEdit);
  const setError = useStudioStore((s) => s.setError);
  const refreshStatus = useStudioStore((s) => s.refreshStatus);

  if (!isUiOnlyMode()) return null;

  const jump = (id: SceneId, phase?: WorkPhase) => {
    setError(null);
    if (id === "intro") {
      seedMockIntro();
      setScene("intro");
    } else if (phase === "edit") {
      seedMockWorkEdit();
      enterWorkEdit();
    } else {
      seedMockWorkDump();
      enterWorkDump();
    }
    void refreshStatus();
  };

  const isActive = (id: SceneId, phase?: WorkPhase) => {
    if (scene !== id) return false;
    if (id === "work" && phase) return workPhase === phase;
    return id === "intro";
  };

  return (
    <div className="dev-toolbar" role="toolbar" aria-label="UI 预览">
      <span className="dev-toolbar-tag">UI 预览</span>
      {jumps.map(({ id, phase, label }) => (
        <button
          key={label}
          type="button"
          className={`dev-toolbar-btn ${isActive(id, phase) ? "is-active" : ""}`}
          onClick={() => jump(id, phase)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
