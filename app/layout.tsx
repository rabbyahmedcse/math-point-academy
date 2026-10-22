
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Footer from "./footer";

export const metadata: Metadata = {
  title: "Math Point Academy",
  description:
    "Math Point Academy — গণিত (ষষ্ঠ–দশম) ও ICT (HSC) এর বিশেষায়িত কোচিং, নগরকান্দা, ফরিদপুর।",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap"
        />
      </head>

      <body className="flex min-h-screen flex-col">
        <main className="flex flex-1 flex-col">
          {children}
        </main>

      </body>
    </html>
  );
}
