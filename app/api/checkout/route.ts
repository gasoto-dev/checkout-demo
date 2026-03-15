import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { v4 as uuidv4 } from "uuid"
import { getDb } from "@/lib/db"
import { getProductById, priceToCents } from "@/lib/products"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  apiVersion: "2026-02-25.clover",
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, email, address } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 })
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate and compute total server-side — never trust client total
    let totalCents = 0
    const validatedItems: { productId: string; quantity: number; price: number }[] = []
    for (const item of items) {
      const product = getProductById(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Unknown product: ${item.productId}` }, { status: 400 })
      }
      const qty = Number(item.quantity) || 1
      totalCents += priceToCents(product.price) * qty
      validatedItems.push({ productId: product.id, quantity: qty, price: product.price })
    }

    if (totalCents < 50) {
      return NextResponse.json({ error: "Order total too small" }, { status: 400 })
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      receipt_email: email,
      metadata: { email },
    })

    // Save pending order to SQLite
    const orderId = uuidv4()
    const db = getDb()
    db.prepare(`
      INSERT INTO orders (id, email, items, total, status, stripe_payment_intent, created_at)
      VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).run(
      orderId,
      email,
      JSON.stringify({ items: validatedItems, address }),
      totalCents,
      paymentIntent.id,
      Date.now(),
    )

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId })
  } catch (err) {
    console.error("[api/checkout]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    )
  }
}
