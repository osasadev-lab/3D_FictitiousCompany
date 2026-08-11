"use client";

import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, PerspectiveCamera } from "@react-three/drei";
import { sections, type ContentSection } from "@/lib/content";
import { latLonToVector3 } from "@/lib/sphere-math";
import { useSphereRotation } from "@/context/SphereRotationContext";

const SPHERE_RADIUS = 1.4;
const CAMERA_FOV = 42;
// How much of the shorter viewport axis the sphere's diameter should fill.
const TARGET_FRACTION = 0.62;
const MIN_DISTANCE = 3.4;
// High enough that narrow portrait aspect ratios (tall phones) never get
// clamped before the sphere fully fits within the viewport width.
const MAX_DISTANCE = 16;
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

function computeCameraDistance(width: number, height: number) {
  const aspect = width / height;
  const fitFactor = Math.min(1, aspect); // narrower viewport (portrait) => smaller fitFactor => camera pulls back
  const distance =
    SPHERE_RADIUS /
    (TARGET_FRACTION * fitFactor * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV) / 2));
  return THREE.MathUtils.clamp(distance, MIN_DISTANCE, MAX_DISTANCE);
}

function useResponsiveCameraDistance() {
  const [distance, setDistance] = useState(() =>
    computeCameraDistance(window.innerWidth, window.innerHeight)
  );

  useEffect(() => {
    const handleResize = () => {
      setDistance(computeCameraDistance(window.innerWidth, window.innerHeight));
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return distance;
}

export default function Scene() {
  const cameraDistance = useResponsiveCameraDistance();

  return (
    <div className="fixed inset-0 touch-none">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera
          makeDefault
          fov={CAMERA_FOV}
          position={[0, 0, cameraDistance]}
        />
        <color attach="background" args={["#0a0b0e"]} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <pointLight position={[-4, -2, 3]} intensity={1.2} color="#4f9dff" />
        <pointLight position={[4, 1, -3]} intensity={0.6} color="#ffb74f" />
        <SphereGroup />
      </Canvas>
    </div>
  );
}

function SphereGroup() {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const { mode, targetQuaternion, beginDrag, endDrag, completeFocus } =
    useSphereRotation();

  const dragPointerId = useRef<number | null>(null);
  const lastPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef(new THREE.Vector2(0, 0));
  const prefersReducedMotion = useRef(false);

  const applyYawPitch = useCallback((yaw: number, pitch: number) => {
    const group = groupRef.current;
    if (!group) return;
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(Y_AXIS, yaw);
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(X_AXIS, pitch);
    group.quaternion.premultiply(yawQuat).premultiply(pitchQuat);
  }, []);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    const ROTATE_SPEED = 0.006;

    const handlePointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      dragPointerId.current = e.pointerId;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      velocity.current.set(0, 0);
      beginDrag();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (dragPointerId.current !== e.pointerId) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      const yaw = dx * ROTATE_SPEED;
      const pitch = dy * ROTATE_SPEED;
      velocity.current.set(yaw, pitch);
      applyYawPitch(yaw, pitch);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (dragPointerId.current !== e.pointerId) return;
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
      dragPointerId.current = null;
      endDrag();
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [gl, beginDrag, endDrag, applyYawPitch]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    if (mode === "animating" && targetQuaternion) {
      if (prefersReducedMotion.current) {
        group.quaternion.copy(targetQuaternion);
        completeFocus();
        return;
      }
      group.quaternion.slerp(targetQuaternion, 0.12);
      if (group.quaternion.angleTo(targetQuaternion) < 0.01) {
        group.quaternion.copy(targetQuaternion);
        completeFocus();
      }
      return;
    }

    if (mode === "idle" && velocity.current.lengthSq() > 1e-7) {
      applyYawPitch(velocity.current.x, velocity.current.y);
      velocity.current.multiplyScalar(0.92);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[SPHERE_RADIUS, 4]} />
        <meshStandardMaterial color="#262b36" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[SPHERE_RADIUS * 1.003, 4]} />
        <meshBasicMaterial color="#c7ccd6" wireframe transparent opacity={0.4} />
      </mesh>
      {sections.map((section) => (
        <Hotspot key={section.id} section={section} />
      ))}
    </group>
  );
}

function Hotspot({ section }: { section: ContentSection }) {
  const { openDirect, activeId, pendingFocusId } = useSphereRotation();
  const position = useMemo(
    () =>
      latLonToVector3(
        section.position.lat,
        section.position.lon,
        SPHERE_RADIUS + 0.015
      ),
    [section]
  );
  const isActive = activeId === section.id || pendingFocusId === section.id;

  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          openDirect(section.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[isActive ? 0.075 : 0.05, 16, 16]} />
        <meshStandardMaterial
          color={section.accentColor}
          emissive={section.accentColor}
          emissiveIntensity={isActive ? 1.3 : 0.7}
        />
      </mesh>
      <Html position={[0, 0.13, 0]} center distanceFactor={7} style={{ pointerEvents: "none" }}>
        <span
          className="whitespace-nowrap text-[11px] tracking-wide text-white/80"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
        >
          {section.label}
        </span>
      </Html>
    </group>
  );
}
