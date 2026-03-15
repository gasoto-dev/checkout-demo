"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  email: string;
  items: string;
  total: number;
  status: string;
  stripe_payment_intent: string | null;
  created_at: number;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        return res.json();
      })
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📦</p>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No orders yet
          </h2>
          <p className="text-gray-500">
            Your order history will appear here after you complete a purchase.
          </p>
        </div>
      ) : (
        <div className="space-y-4" data-testid="orders-list">
          {orders.map((order) => {
            const items: OrderItem[] = JSON.parse(order.items);
            const date = new Date(order.created_at);
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
                data-testid="order-row"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <p className="font-mono text-xs text-gray-400 mb-1">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {date.toLocaleDateString()} · {order.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold text-gray-900">
                      ${(order.total / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {items.map((item, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {item.name} × {item.quantity} — $
                      {((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
