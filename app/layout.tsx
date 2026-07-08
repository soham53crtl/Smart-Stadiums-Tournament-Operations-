import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StadiumSense — FIFA World Cup 2026",
  description:
    "A GenAI operations assistant for fans, organizers, volunteers, and venue staff during FIFA World Cup 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- 
            this rule targets pages/_document.js in the Pages Router; 
            App Router's root layout is the correct place for this. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
