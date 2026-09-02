import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SamePage — Join a room",
  description: "Join your team on SamePage with a shared room code.",
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
