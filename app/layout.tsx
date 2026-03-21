import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import QueryProvider from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const kantumruy = localFont({
  src: "../public/fonts/KantumruyPro-Medium.ttf",
  variable: "--font-kantumruy",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "Lomhea - Explore the Heart of Cambodia",
  description:
    "Discover breathtaking temples, hidden beaches, and majestic waterfalls in Cambodia. Your ultimate interactive guide to exploring the Kingdom of Wonder.",
  keywords: [
    "Cambodia",
    "Travel",
    "Tourism",
    "Map",
    "Angkor Wat",
    "Phnom Penh",
    "Siem Reap",
    "Lomhea",
  ],
  authors: [{ name: "Lomhea Team" }],
  openGraph: {
    title: "Lomhea - Explore Cambodia Like Never Before",
    description: "Interactive map and guide for Cambodia's best destinations.",
    url: "https://lomhea.vercel.app",
    siteName: "Lomhea",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lomhea - Cambodian Travel Map",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lomhea - Explore Cambodia",
    description: "Interactive map and guide for Cambodia's best destinations.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${kantumruy.variable} font-sans antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
