import type { Metadata, Viewport } from "next";
import { SuccessPopup } from "@/components/success-popup";
import { AdminPwa } from "@/components/admin-pwa";

export const metadata: Metadata = {
  title: {
    default: "Idola Admin",
    template: "%s | Idola Admin",
  },
  description: "Ruang pengelola Idola Contest",
  manifest: "/admin/manifest.webmanifest",
  applicationName: "Idola Admin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Idola Admin",
    startupImage: ["/icon-512.png"],
  },
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#153a77",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main" className="admin-root">
      {children}
      <SuccessPopup />
      <AdminPwa />
    </main>
  );
}
