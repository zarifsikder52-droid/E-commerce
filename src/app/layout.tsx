import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextShop - Modern E-Commerce | Shop Electronics, Fashion & More",
  description: "Discover amazing products at unbeatable prices. Shop electronics, fashion, home & living, beauty, sports, and more with free shipping on orders above ৳2,000.",
  keywords: ["NextShop", "e-commerce", "online shopping", "electronics", "fashion", "Bangladesh", "bKash", "Nagad"],
  authors: [{ name: "NextShop" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "NextShop - Modern E-Commerce",
    description: "Shop the latest products at amazing prices. Free shipping available.",
    siteName: "NextShop",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}