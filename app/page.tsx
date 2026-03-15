"use client";

import { products, getImageUrl } from "@/lib/products";
import { useCart } from "@/components/CartContext";
import { useState } from "react";
import Link from "next/link";

export default function CatalogPage() {
  const { addItem, totalItems } = useCart();
  const [added, setAdded] = useState<string | null>(null);

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageSeed: product.imageSeed,
    });
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1200);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
          <p className="text-gray-500 mt-1">Handpicked items just for you</p>
        </div>
        {totalItems > 0 && (
          <Link
            href="/cart"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Cart ({totalItems})
          </Link>
        )}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        data-testid="product-grid"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            data-testid="product-card"
          >
            <img
              src={getImageUrl(product.imageSeed)}
              alt={product.name}
              className="w-full h-52 object-cover"
            />
            <div className="p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {product.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xl font-bold text-gray-900">
                  ${product.price}
                </span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    added === product.id
                      ? "bg-green-500 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {added === product.id ? "✓ Added!" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
