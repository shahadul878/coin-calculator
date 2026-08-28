import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { plusJakarta, geistMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coin Requests",
  description: "Professional coin request management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased">{children}</body>
      <Toaster />
    </html>
  );
}
