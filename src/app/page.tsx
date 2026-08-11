"use client";

import dynamic from "next/dynamic";
import { SphereRotationProvider } from "@/context/SphereRotationContext";
import Header from "@/components/Header";
import ContentModal from "@/components/ContentModal";

const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function Home() {
  return (
    <SphereRotationProvider>
      <Header />
      <Scene />
      <ContentModal />
    </SphereRotationProvider>
  );
}
