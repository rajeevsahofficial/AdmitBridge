import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/header";
import Footer from "@/footer";

const manrope = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "variable", 
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: "variable", 
  display: "swap",
});

/* ─────────────────────────────────────────────────────────────
   Metadata
───────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL("https://admitbridge.com"),
  title: "AdmitBridge — Technology & Digital Solutions",
  description:
    "AdmitBridge builds digital products, drives measurable growth, and delivers technology solutions for businesses and educational institutions.",
  keywords: [
    "web development",
    "software development",
    "SEO",
    "Google Ads",
    "Meta Ads",
    "education technology",
    "admission management",
    "digital solutions",
    "AdmitBridge",
  ],
  authors: [{ name: "AdmitBridge" }],
  creator: "AdmitBridge",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://admitbridge.com",
    siteName: "AdmitBridge",
    title: "AdmitBridge — Technology & Digital Solutions",
    description:
      "AdmitBridge builds digital products, drives measurable growth, and delivers technology solutions for businesses and educational institutions.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AdmitBridge — Technology & Digital Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AdmitBridge — Technology & Digital Solutions",
    description:
      "AdmitBridge builds digital products, drives measurable growth, and delivers technology solutions for businesses and educational institutions.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ─────────────────────────────────────────────────────────────
   Root layout
───────────────────────────────────────────────────────────── */

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#F4F1EA" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F4F1EA] text-[#111111]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
