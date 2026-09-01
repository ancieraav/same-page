import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SamePage Dashboard",
  description: "A simple SamePage dashboard waiting for a user to join with a shared code.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
