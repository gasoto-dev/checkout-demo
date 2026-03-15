"use client"

import Link from "next/link"
import { useCart } from "@/components/CartContext"

export default function NavBar() {
  const { totalItems } = useCart()

  return (
    <nav className="sticky top-0 z-50 bg-[#111] text-white shadow-xl mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">
              SHOP<span className="text-orange-400 group-hover:text-white">DEMO</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Products</Link>
            <Link href="/orders" className="hover:text-white transition-colors">Orders</Link>
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Cart
            {totalItems > 0 && (
              <span className="bg-white text-orange-500 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
