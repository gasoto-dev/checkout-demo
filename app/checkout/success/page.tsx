import Link from "next/link"

interface Props {
  searchParams: Promise<{ orderId?: string }>
}

export default async function SuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams

  return (
    <div className="max-w-lg mx-auto text-center py-24" data-testid="success-page">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
      <p className="text-gray-600 mb-2">
        Thank you for your order. A confirmation has been sent to your email.
      </p>
      {orderId && (
        <p className="text-sm text-gray-400 mb-8">
          Order ID:{" "}
          <span className="font-mono text-gray-600" data-testid="order-id">
            {orderId}
          </span>
        </p>
      )}
      <div className="flex justify-center gap-4">
        <Link
          href="/orders"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          View Order History
        </Link>
        <Link
          href="/"
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
