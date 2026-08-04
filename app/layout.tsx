import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PLC Software Management Dashboard",
  description: "Dashboard for managing PLC machine software, versions, and uploads",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="light">
      <body className="bg-background text-on-surface">{children}</body>
    </html>
  );
}
