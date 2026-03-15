import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/CartContext"
import NavBar from "@/components/NavBar"

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ShopDemo — Modern E-Commerce",
  description: "A live e-commerce checkout demo with Stripe test mode",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} antialiased min-h-screen`} style={{ background: "#f5f5f5" }}>
        <CartProvider>
          <NavBar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  )
}
