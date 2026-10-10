import { BrandNavbar } from "./brand-navbar";
import { BrandFooter } from "./brand-footer";
import { MobileCta } from "./mobile-cta";
import { AmbassadorPeek, AmbassadorStrip, type Ambassador } from "./ambassadors";

export function SiteChrome({
  children,
  ambassadors = [],
}: {
  children: React.ReactNode;
  ambassadors?: Ambassador[];
}) {
  return (
    <>
      <BrandNavbar ambassadors={ambassadors} />
      <AmbassadorStrip ambassadors={ambassadors} />
      <main id="main">{children}</main>
      <BrandFooter />
      <MobileCta />
      <AmbassadorPeek ambassadors={ambassadors} />
    </>
  );
}
