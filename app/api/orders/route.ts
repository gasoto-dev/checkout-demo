import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

/** POST /api/orders — mark order as paid */
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 })
    }
    const db = getDb()
    const result = db.prepare(
      `UPDATE orders SET status = 'paid' WHERE id = ?`
    ).run(orderId)
    if (result.changes === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    )
  }
}

/** GET /api/orders — list all orders (for /orders page) */
export async function GET() {
  try {
    const db = getDb()
    const orders = db.prepare(
      `SELECT id, email, total, status, created_at FROM orders ORDER BY created_at DESC`
    ).all()
    return NextResponse.json({ orders })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    )
  }
}
