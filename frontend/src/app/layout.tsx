import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vizzy — AI Visual Storytelling",
  description: "Create graphic novels, storyboards and visual books with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
