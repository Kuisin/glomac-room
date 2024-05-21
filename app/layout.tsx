import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Div100vh from "react-div-100vh";

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
      <meta
        name="viewport"
        content="width=device-width, minimum-scale=1, maximum-scale=1"
      />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <link rel="apple-touch-icon" href="" />
      <link rel="apple-touch-icon" sizes="72x72" href="" />
      <link rel="apple-touch-icon" sizes="114x114" href="" />
      <link rel="apple-touch-startup-image" href="" />
      <link rel="apple-touch-startup-image" sizes="768x1004" href="" />
      <Div100vh>
        <body className={inter.className}>{children}</body>
      </Div100vh>
    </html>
  );
}
