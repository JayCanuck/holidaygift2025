import type { Metadata } from "next";
import { Geist, Geist_Mono, Cookie } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cookie = Cookie({
  variable: "--font-cookie",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Happy Holidays!",
  description: "Jay sent you a holiday surprise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="./js-dos/js-dos.css" />
        <Script src="./js-dos/js-dos.js" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${cookie.variable}`}>
        {children}
      </body>
    </html>
  );
}
