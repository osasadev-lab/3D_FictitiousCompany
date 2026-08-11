"use client";

import { sections, studio } from "@/lib/content";
import { useSphereRotation } from "@/context/SphereRotationContext";

export default function Header() {
  const { focusSection, activeId, pendingFocusId, mode } = useSphereRotation();

  return (
    <header className="fixed inset-x-0 top-0 z-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-5 sm:px-10">
      <span className="text-xs font-medium tracking-[0.3em] text-white/60">
        {studio.name}
      </span>
      <nav className="flex flex-wrap gap-x-6 gap-y-2">
        {sections.map((section) => {
          const isActive =
            activeId === section.id || pendingFocusId === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => focusSection(section.id)}
              disabled={mode === "animating"}
              className={`text-xs uppercase tracking-wide transition-colors duration-300 disabled:cursor-wait ${
                isActive ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
