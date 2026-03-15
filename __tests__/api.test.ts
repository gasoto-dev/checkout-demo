/**
 * @jest-environment node
 */
// API route tests — mock Stripe and SQLite

// Mock uuid (v13 is ESM-only, incompatible with ts-jest CJS transform)
jest.mock("uuid", () => ({ v4: jest.fn().mockReturnValue("test-order-uuid") }))

// Mock stripe
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: "pi_test_123",
        client_secret: "pi_test_123_secret",
      }),
    },
  }))
})

// Mock better-sqlite3
const mockRun = jest.fn().mockReturnValue({ changes: 1 })
const mockAll = jest.fn().mockReturnValue([
  { id: "order-1", email: "test@test.com", total: 12900, status: "paid", created_at: Date.now() },
])
const mockPrepare = jest.fn().mockReturnValue({ run: mockRun, all: mockAll })
jest.mock("better-sqlite3", () =>
  jest.fn().mockImplementation(() => ({
    pragma: jest.fn(),
    exec: jest.fn(),
    prepare: mockPrepare,
  }))
)

import { POST as checkoutPOST } from "@/app/api/checkout/route"
import { POST as ordersPOST, GET as ordersGET } from "@/app/api/orders/route"
import { NextRequest } from "next/server"

function makeReq(body: unknown, method = "POST"): NextRequest {
  return new NextRequest("http://localhost/api/test", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/checkout", () => {
  it("returns 400 when no items", async () => {
    const res = await checkoutPOST(makeReq({ items: [], email: "a@b.com" }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeTruthy()
  })

  it("returns 400 when no email", async () => {
    const res = await checkoutPOST(
      makeReq({ items: [{ productId: "vintage-camera", quantity: 1 }] })
    )
    expect(res.status).toBe(400)
  })

  it("returns 400 for unknown product", async () => {
    const res = await checkoutPOST(
      makeReq({ items: [{ productId: "not-real", quantity: 1 }], email: "a@b.com" })
    )
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain("Unknown product")
  })

  it("returns clientSecret and orderId on success", async () => {
    const res = await checkoutPOST(
      makeReq({
        items: [{ productId: "vintage-camera", quantity: 1 }],
        email: "buyer@example.com",
        address: { name: "Test User", city: "Phoenix" },
      })
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.clientSecret).toBeDefined()
    expect(data.orderId).toBeDefined()
  })
})

describe("POST /api/orders", () => {
  it("returns 400 when orderId missing", async () => {
    const res = await ordersPOST(makeReq({}))
    expect(res.status).toBe(400)
  })

  it("returns ok on valid orderId", async () => {
    const res = await ordersPOST(makeReq({ orderId: "order-1" }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
  })
})

describe("GET /api/orders", () => {
  it("returns orders array", async () => {
    const res = await ordersGET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.orders)).toBe(true)
    expect(data.orders.length).toBeGreaterThan(0)
  })
})
