import { BrandNavbar } from "./brand-navbar";
import { BrandFooter } from "./brand-footer";
import { MobileCta } from "./mobile-cta";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BrandNavbar />
      <main id="main">{children}</main>
      <BrandFooter />
      <MobileCta />
    </>
  );
}
