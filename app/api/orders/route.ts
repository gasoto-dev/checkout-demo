import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const orders = db
      .prepare(
        "SELECT * FROM orders ORDER BY created_at DESC"
      )
      .all();
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.orderId) {
      return NextResponse.json(
        { error: "Missing required field: orderId" },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = db
      .prepare(
        "UPDATE orders SET status = 'paid' WHERE id = ? AND status = 'pending'"
      )
      .run(body.orderId);

    if (result.changes === 0) {
      // Either already paid or not found
      const order = db
        .prepare("SELECT id, status FROM orders WHERE id = ?")
        .get(body.orderId);
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      // Already paid, return success
    }

    const order = db
      .prepare("SELECT * FROM orders WHERE id = ?")
      .get(body.orderId);

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Orders POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
