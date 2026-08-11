"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sections } from "@/lib/content";
import { useSphereRotation } from "@/context/SphereRotationContext";

export default function ContentModal() {
  const { activeId, close } = useSphereRotation();
  const section = sections.find((s) => s.id === activeId) ?? null;

  useEffect(() => {
    if (!section) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [section, close]);

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={close}
        >
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111318] p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mb-4 h-1 w-10 rounded-full"
              style={{ backgroundColor: section.accentColor }}
            />
            <h2 id="modal-title" className="text-xl font-semibold text-white">
              {section.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {section.body}
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-8 text-xs uppercase tracking-wide text-white/50 transition-colors hover:text-white"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
