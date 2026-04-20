import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CalcHub — 290+ Free Online Calculators | Math, Finance, Science, Ciphers",
  description: "Free online calculators for math, finance, health, physics, chemistry, engineering, cipher decoding, unit conversion, and more. Integral calculator, cipher decoder, mortgage calculator, and 290+ tools. Fast, simple, no signup.",
  keywords: [
    "online calculator", "free calculator", "integral calculator", "cipher decoder", "mortgage calculator",
    "math calculator", "finance calculator", "unit converter", "BMI calculator", "percentage calculator",
    "Caesar cipher decoder", "Vigenere cipher decoder", "Laplace transform calculator", "derivative calculator",
    "quadratic equation solver", "compound interest calculator", "hash generator", "base64 encoder",
    "scientific calculator", "physics calculator", "chemistry calculator", "engineering calculator",
    "resistor color code calculator", "pH calculator", "loan calculator", "retirement calculator",
    "calorie calculator", "age calculator", "word counter", "color converter"
  ],
  authors: [{ name: "CalcHub" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "CalcHub — 290+ Free Online Calculators",
    description: "Free calculators for math, finance, science, ciphers, and everyday life. Integral calculator, cipher decoder, and 290+ more tools.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
