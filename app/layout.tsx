import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Fieldnotes · Пространство для учёбы",
  description: "История, идеи и языки. Личное пространство для учёбы.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Fieldnotes" },
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
