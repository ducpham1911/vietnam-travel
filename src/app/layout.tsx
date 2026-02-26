import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "VietnamTravel",
  description: "Discover Vietnamese cities and plan your perfect trip",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VietnamTravel",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D1117",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} antialiased bg-dark-bg text-white`}>
        <AuthProvider>
          <main className="pb-20 min-h-dvh">{children}</main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
