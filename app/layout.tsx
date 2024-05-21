import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Facility Reservation",
  description: "Made by Kaisei",
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
        <link rel="apple-touch-icon" href="" />
        <link rel="apple-touch-icon" sizes="72x72" href="" />
        <link rel="apple-touch-icon" sizes="114x114" href="" />
        <link rel="apple-touch-startup-image" href="" />
        <link rel="apple-touch-startup-image" sizes="768x1004" href="" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
