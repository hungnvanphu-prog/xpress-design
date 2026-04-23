"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function TrackingScripts() {
  useEffect(() => {
    console.log("Mock: Initializing Google Analytics (G-XXXXXXXXXX)");
    console.log("Mock: Initializing Facebook Pixel (XXXXXXXXXXXXXXX)");
  }, []);
  return null;
}
