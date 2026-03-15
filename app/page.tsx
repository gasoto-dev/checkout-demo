"use client"

import { products, getImageUrl } from "@/lib/products"
import { useCart } from "@/components/CartContext"
import { useState } from "react"

export default function CatalogPage() {
  const { addItem } = useCart()
  const [added, setAdded] = useState<string | null>(null)

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({ productId: product.id, name: product.name, price: product.price, imageSeed: product.imageSeed })
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1500)
  }

  return (
    <>
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-[#111] text-white mx-0 px-6 py-20 mb-12 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 50%)" }} />
        <div className="relative max-w-7xl mx-auto">
          <p className="text-orange-400 text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            New Arrivals
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
            Handpicked<br />
            <span className="text-orange-400">For You.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-md">
            Curated artisan goods — each piece tells a story. Free shipping on orders over $100.
          </p>
        </div>
      </div>

      {/* Products section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          All Products <span className="text-gray-400 font-normal text-base">({products.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="product-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100"
            data-testid="product-card"
          >
            {/* Image */}
            <div className="relative overflow-hidden h-56 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(product.imageSeed)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-base font-bold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-gray-900">${product.price}</span>
                  <span className="text-gray-400 text-sm ml-1">.00</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    added === product.id
                      ? "bg-green-500 text-white scale-95"
                      : "bg-[#111] text-white hover:bg-orange-500"
                  }`}
                >
                  {added === product.id ? "✓ Added!" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
