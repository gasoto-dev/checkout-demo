"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="text-center py-20 max-w-md mx-auto" data-testid="success-page">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed!</h1>
      <p className="text-gray-500 mb-6">
        Thank you for your order. Your payment was successful.
      </p>
      {orderId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Order ID</p>
          <p className="font-mono text-sm text-gray-900 break-all">{orderId}</p>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <Link
          href="/orders"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          View All Orders
        </Link>
        <Link
          href="/"
          className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
