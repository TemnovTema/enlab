import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Fieldnotes · Английский в контексте",
  description: "Ваши тексты. Ваши выражения. Ежедневная практика.",
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
