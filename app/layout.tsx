import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Comic_Neue } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const comicNeue = Comic_Neue({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-comic-neue",
});

export const metadata: Metadata = {
  title: "Remembering My Golden Retriever",
  description: "A memorial website to celebrate and share memories of our beloved golden retriever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${comicNeue.variable}`}>
        {children}
      </body>
    </html>
  );
}
