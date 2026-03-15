import Link from "next/link"

interface Order {
  id: string
  email: string
  total: number
  status: string
  created_at: number
}

async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/orders`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.orders ?? []
  } catch {
    return []
  }
}

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="max-w-3xl mx-auto" data-testid="orders-page">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Shop
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-gray-500">No orders yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-gray-400 mb-1">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${(order.total / 100).toFixed(2)}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
