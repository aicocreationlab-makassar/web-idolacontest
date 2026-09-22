"use client";

import { usePathname } from "next/navigation";
import { BrandNavbar } from "./brand-navbar";
import { BrandFooter } from "./brand-footer";
import { MobileCta } from "./mobile-cta";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin)
    return (
      <main id="main" className="admin-root">
        {children}
      </main>
    );

  return (
    <>
      <BrandNavbar />
      <main id="main">{children}</main>
      <BrandFooter />
      <MobileCta />
    </>
  );
}
