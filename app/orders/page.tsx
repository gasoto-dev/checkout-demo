import Link from "next/link"

interface Order {
  id: string; email: string; total: number; status: string; created_at: number
}

async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/orders`, { cache: "no-store" })
    if (!res.ok) return []
    return (await res.json()).orders ?? []
  } catch { return [] }
}

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="pt-8 max-w-2xl mx-auto" data-testid="orders-page">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900">Order History</h1>
        <Link href="/" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
          ← Shop
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-6 grayscale opacity-30">📦</div>
          <p className="text-gray-500 text-lg mb-6">No orders yet.</p>
          <Link href="/" className="bg-[#111] text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-500 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-gray-400 mb-1 truncate max-w-[200px]">{order.id}</p>
                  <p className="text-sm font-medium text-gray-700">{order.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-900">${(order.total / 100).toFixed(2)}</p>
                  <span className={`inline-block mt-1.5 text-xs px-3 py-1 rounded-full font-semibold ${
                    order.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {order.status === "paid" ? "✓ Paid" : "Pending"}
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
