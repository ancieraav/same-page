import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SamePage — Are you actually aligned?",
  description: "A clickable SamePage prototype that reveals whether two people really mean the same thing.",
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
