"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const revealSelector = [
  ".section > *",
  ".card",
  ".gallery-card",
  ".competition-card",
  ".feature-item",
  ".prize-card",
  ".timeline-item",
  ".info-card",
  ".faq-list details",
  ".hero-copy > *",
  ".hero-artboard",
].join(",");

export function NavigationEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    requestAnimationFrame(() => {
      if (hash) {
        document.querySelector(hash)?.scrollIntoView({ block: "start" });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    });

    if (pathname.startsWith("/admin")) return;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelector),
    );
    elements.forEach((element, index) => {
      if (!element.dataset.aos) {
        element.dataset.aos = ["fade-up", "zoom-in-up", "flip-left"][index % 3];
        element.dataset.aosDelay = String((index % 4) * 70);
      }
    });

    let active = true;
    void import("aos").then(({ default: AOS }) => {
      if (!active) return;
      AOS.init({
        once: true,
        duration: 850,
        easing: "ease-out-cubic",
        offset: 55,
        anchorPlacement: "top-bottom",
        disable: () =>
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
      AOS.refreshHard();
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
}
