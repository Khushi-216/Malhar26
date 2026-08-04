import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Malhar Archives — Vault Access",
  description: "Mechanical vault access for the Malhar archives, 2021–2025.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
