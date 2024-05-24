import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Facility Reservation (GLOMAC)",
  description: "Made by Kaisei Sawada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover, minimum-scale=1, maximum-scale=1"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link rel="apple-touch-icon" sizes="57x57" href="/ios-files/57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/ios-files/60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/ios-files/72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/ios-files/76.png" />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/ios-files/114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/ios-files/120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/ios-files/144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/ios-files/152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/ios-files/167.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/ios-files/180.png"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
