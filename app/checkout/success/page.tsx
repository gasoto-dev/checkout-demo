import Link from "next/link"

interface Props { searchParams: Promise<{ orderId?: string }> }

export default async function SuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4" data-testid="success-page">
      {/* Confetti-style success icon */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 ring-8 ring-green-50">
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-4xl font-black text-gray-900 mb-3">Order Confirmed!</h1>
      <p className="text-gray-500 text-lg mb-2 max-w-sm">
        Thank you! A confirmation has been sent to your email.
      </p>
      {orderId && (
        <p className="text-sm text-gray-400 bg-gray-100 px-4 py-2 rounded-full mb-10">
          Order ID: <span className="font-mono text-gray-600" data-testid="order-id">{orderId}</span>
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/orders"
          className="bg-[#111] text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-500 transition-colors"
        >
          View Order History
        </Link>
        <Link
          href="/"
          className="border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-gray-400 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
