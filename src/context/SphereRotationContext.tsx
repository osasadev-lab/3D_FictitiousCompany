"use client";

import * as THREE from "three";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { sections } from "@/lib/content";
import { latLonToVector3, quaternionFacingFront } from "@/lib/sphere-math";

type RotationMode = "idle" | "dragging" | "animating";

type SphereRotationContextValue = {
  /** id of the section whose modal is currently open. */
  activeId: string | null;
  /** id of the section the sphere is currently rotating towards. */
  pendingFocusId: string | null;
  mode: RotationMode;
  targetQuaternion: THREE.Quaternion | null;
  /** Header nav: rotate the sphere to face this section, then open its modal. */
  focusSection: (id: string) => void;
  /** Hotspot tap: open the modal immediately, no rotation. */
  openDirect: (id: string) => void;
  /** Close the currently open modal. */
  close: () => void;
  /** Called by the scene when the user starts dragging the sphere. */
  beginDrag: () => void;
  /** Called by the scene when the user releases the sphere. */
  endDrag: () => void;
  /** Called by the scene once the focus animation reaches its target. */
  completeFocus: () => void;
};

const SphereRotationContext =
  createContext<SphereRotationContextValue | null>(null);

export function SphereRotationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  const [mode, setMode] = useState<RotationMode>("idle");
  const [targetQuaternion, setTargetQuaternion] =
    useState<THREE.Quaternion | null>(null);

  const focusSection = useCallback((id: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;

    const point = latLonToVector3(
      section.position.lat,
      section.position.lon,
      1
    );
    setTargetQuaternion(quaternionFacingFront(point));
    setPendingFocusId(id);
    setMode("animating");
  }, []);

  const openDirect = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const close = useCallback(() => {
    setActiveId(null);
  }, []);

  const beginDrag = useCallback(() => {
    setPendingFocusId(null);
    setTargetQuaternion(null);
    setMode("dragging");
  }, []);

  const endDrag = useCallback(() => {
    setMode((current) => (current === "dragging" ? "idle" : current));
  }, []);

  const completeFocus = useCallback(() => {
    setActiveId(pendingFocusId);
    setPendingFocusId(null);
    setTargetQuaternion(null);
    setMode("idle");
  }, [pendingFocusId]);

  const value = useMemo<SphereRotationContextValue>(
    () => ({
      activeId,
      pendingFocusId,
      mode,
      targetQuaternion,
      focusSection,
      openDirect,
      close,
      beginDrag,
      endDrag,
      completeFocus,
    }),
    [
      activeId,
      pendingFocusId,
      mode,
      targetQuaternion,
      focusSection,
      openDirect,
      close,
      beginDrag,
      endDrag,
      completeFocus,
    ]
  );

  return (
    <SphereRotationContext.Provider value={value}>
      {children}
    </SphereRotationContext.Provider>
  );
}

export function useSphereRotation() {
  const ctx = useContext(SphereRotationContext);
  if (!ctx) {
    throw new Error(
      "useSphereRotation must be used within a SphereRotationProvider"
    );
  }
  return ctx;
}
