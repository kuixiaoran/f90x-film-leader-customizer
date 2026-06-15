import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  pickerChevronTransition,
  pickerMenuVariants,
  pickerOptionVariants,
  pickerTapTransition,
  pickerValueTransition,
  pickerValueVariants,
} from "@/layout/comPickerMotion";
import { comPortNumber } from "@/lib/comPort";
import { useStudioStore } from "@/store/useStudioStore";

type ComPortPickerProps = {
  ports: string[];
  value: string;
  disabled?: boolean;
  onChange: (port: string) => void;
};

export function ComPortPicker({
  ports,
  value,
  disabled = false,
  onChange,
}: ComPortPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const refreshPorts = useStudioStore((s) => s.refreshPorts);
  const menuVariants = useMemo(() => pickerMenuVariants(ports.length), [ports.length]);

  const empty = ports.length === 0;
  const display = empty ? "—" : comPortNumber(value) || "·";

  useEffect(() => {
    if (!open) return;
    void refreshPorts();
  }, [open, refreshPorts]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const pick = (port: string) => {
    onChange(port);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="intro-com-picker">
      <motion.button
        type="button"
        className="intro-com-picker-trigger"
        disabled={disabled || empty}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.97 }}
        transition={pickerTapTransition}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={display}
            className="intro-com-picker-value"
            variants={pickerValueVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pickerValueTransition}
          >
            {display}
          </motion.span>
        </AnimatePresence>
        {!empty ? (
          <motion.span
            className="intro-com-picker-chevron"
            animate={{ rotate: open ? 180 : 0 }}
            transition={pickerChevronTransition}
            aria-hidden
          />
        ) : null}
      </motion.button>

      <AnimatePresence>
        {open && !empty ? (
          <motion.ul
            id={listId}
            role="listbox"
            className="intro-com-picker-menu"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {ports.map((port) => {
              const num = comPortNumber(port);
              const selected = port === value;
              return (
                <motion.li
                  key={port}
                  role="option"
                  aria-selected={selected}
                  className={`intro-com-picker-option${selected ? " is-selected" : ""}`}
                  variants={pickerOptionVariants}
                  onClick={() => pick(port)}
                >
                  {num}
                </motion.li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
