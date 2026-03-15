"use client"

import { useCart } from "@/components/CartContext"
import Link from "next/link"
import { getImageUrl } from "@/lib/products"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]" data-testid="empty-cart">
        <div className="text-8xl mb-6 grayscale opacity-40">🛒</div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Looks like you haven&apos;t added anything yet. Find something you love.
        </p>
        <Link
          href="/"
          className="bg-[#111] text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-500 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-8">
      <h1 className="text-3xl font-black text-gray-900 mb-8">
        Your Cart <span className="text-gray-400 font-normal text-xl">({items.length} item{items.length !== 1 ? "s" : ""})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow"
              data-testid="cart-item"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(item.imageSeed)}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-400">${item.price} each</p>
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 font-bold text-gray-700 transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-gray-900 text-sm">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 font-bold text-gray-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="text-right min-w-[80px]">
                <p className="font-black text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-xs text-gray-400 hover:text-red-500 mt-1 transition-colors"
                  aria-label="Remove item"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-black text-gray-900 mb-5">Order Summary</h2>

            <div className="space-y-2 mb-4 text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-gray-600">
                  <span>{item.name} × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-black text-gray-900 text-xl">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Taxes and shipping calculated at checkout</p>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-orange-500 hover:bg-orange-400 text-white py-4 rounded-full font-bold text-center block text-sm tracking-wide transition-colors"
            >
              Checkout →
            </Link>
            <Link
              href="/"
              className="w-full mt-3 text-center text-sm text-gray-500 hover:text-gray-900 transition-colors block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
