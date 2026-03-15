import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Checkout Demo",
  description: "E-commerce checkout demo with Stripe test mode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        <CartProvider>
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-gray-900">
                🛍️ ShopDemo
              </Link>
              <div className="flex gap-6 text-sm font-medium">
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Products
                </Link>
                <Link href="/cart" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Cart
                </Link>
                <Link href="/orders" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Orders
                </Link>
              </div>
            </div>
          </nav>
          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
