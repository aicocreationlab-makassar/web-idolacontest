import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Idola Contest",
    template: "%s | Admin Idola Contest",
  },
  description: "Ruang pengelola Idola Contest",
  manifest: "/admin/manifest.webmanifest",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
