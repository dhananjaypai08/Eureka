"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Compass } from "lucide-react";

// Dynamically import the Footprints component with no SSR since it uses leaflet
// which requires window access
const FootprintsDynamic = dynamic(
  () => import("../components/Footprint"),
  { ssr: false }
);

export default function FootprintsPage() {
  return (
    <main>
      <FootprintsDynamic />
    </main>
  );
}