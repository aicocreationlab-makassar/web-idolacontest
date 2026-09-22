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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelector),
    );
    elements.forEach((element, index) => {
      element.classList.add("scroll-reveal");
      element.style.setProperty("--reveal-delay", `${(index % 5) * 55}ms`);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -7%" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
