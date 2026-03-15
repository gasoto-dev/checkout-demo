import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import { getProductById, priceToCents } from "@/lib/products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia",
});

interface CartItem {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !Array.isArray(body.items) || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields: items, email" },
        { status: 400 }
      );
    }

    const { items, email, address } = body as {
      items: CartItem[];
      email: string;
      address: Record<string, string>;
    };

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Server-side price validation
    let totalCents = 0;
    const orderItems = [];

    for (const cartItem of items) {
      const product = getProductById(cartItem.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Unknown product: ${cartItem.productId}` },
          { status: 400 }
        );
      }
      if (!Number.isInteger(cartItem.quantity) || cartItem.quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for ${cartItem.productId}` },
          { status: 400 }
        );
      }
      const priceCents = priceToCents(product.price);
      totalCents += priceCents * cartItem.quantity;
      orderItems.push({
        productId: product.id,
        name: product.name,
        price: priceCents,
        quantity: cartItem.quantity,
      });
    }

    const orderId = uuidv4();

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      metadata: { orderId, email },
    });

    // Store pending order in DB
    const db = getDb();
    db.prepare(
      `INSERT INTO orders (id, email, items, total, status, stripe_payment_intent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      orderId,
      email,
      JSON.stringify(orderItems),
      totalCents,
      "pending",
      paymentIntent.id,
      Date.now()
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    if (err && typeof err === "object" && "type" in err && "statusCode" in err) {
      // Stripe error
      const stripeErr = err as { message: string; statusCode?: number };
      return NextResponse.json(
        { error: stripeErr.message },
        { status: stripeErr.statusCode || 500 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
