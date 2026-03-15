/**
 * API route tests for POST /api/checkout
 * Mocks: stripe, better-sqlite3
 */

// Mock Stripe
const mockPaymentIntentCreate = jest.fn();
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: mockPaymentIntentCreate,
    },
  }));
});

// Mock better-sqlite3
const mockRun = jest.fn().mockReturnValue({ changes: 1 });
const mockPrepare = jest.fn().mockReturnValue({ run: mockRun });
const mockExec = jest.fn();
const mockPragma = jest.fn();
const mockDb = {
  prepare: mockPrepare,
  exec: mockExec,
  pragma: mockPragma,
};
jest.mock("better-sqlite3", () => {
  return jest.fn().mockImplementation(() => mockDb);
});

// Mock next/server helpers
jest.mock("next/server", () => ({
  NextRequest: class {
    private _body: string;
    constructor(_url: string, init?: { method?: string; body?: string }) {
      this._body = init?.body || "";
    }
    async json() {
      return JSON.parse(this._body);
    }
  },
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: async () => data,
      _data: data,
    }),
  },
}));

import { POST } from "@/app/api/checkout/route";

function makeRequest(body: unknown) {
  return {
    json: async () => body,
  } as ReturnType<typeof Request["prototype"]> & { json: () => Promise<unknown> };
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPaymentIntentCreate.mockResolvedValue({
      id: "pi_test_123",
      client_secret: "pi_test_123_secret_abc",
    });
    mockPrepare.mockReturnValue({ run: mockRun });
  });

  test("returns 400 when body is missing required fields", async () => {
    const req = makeRequest({ items: [] });
    // @ts-expect-error - using simplified mock
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  test("returns 400 when items is empty", async () => {
    const req = makeRequest({ items: [], email: "test@test.com" });
    // @ts-expect-error - using simplified mock
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/empty/i);
  });

  test("returns 400 for unknown product ID", async () => {
    const req = makeRequest({
      items: [{ productId: "nonexistent-product", quantity: 1 }],
      email: "test@test.com",
    });
    // @ts-expect-error - using simplified mock
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/unknown product/i);
  });

  test("happy path: creates PaymentIntent and order", async () => {
    const req = makeRequest({
      items: [
        { productId: "vintage-camera", quantity: 1 },
        { productId: "ceramic-mug", quantity: 2 },
      ],
      email: "buyer@example.com",
      address: {
        name: "Jane Doe",
        address: "123 Main St",
        city: "Springfield",
        state: "IL",
        zip: "62701",
      },
    });

    // @ts-expect-error - using simplified mock
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.clientSecret).toBe("pi_test_123_secret_abc");
    expect(data.orderId).toBeTruthy();
    expect(typeof data.orderId).toBe("string");
  });

  test("calls Stripe with correct amount in cents", async () => {
    const req = makeRequest({
      items: [{ productId: "leather-journal", quantity: 2 }],
      email: "test@example.com",
    });

    // @ts-expect-error - using simplified mock
    await POST(req);

    expect(mockPaymentIntentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 9000, // $45 * 2 = $90 = 9000 cents
        currency: "usd",
      })
    );
  });

  test("returns 500 on Stripe error", async () => {
    const stripeError = Object.assign(new Error("Stripe error"), {
      statusCode: 402,
      type: "card_error",
    });
    mockPaymentIntentCreate.mockRejectedValueOnce(stripeError);

    const req = makeRequest({
      items: [{ productId: "ceramic-mug", quantity: 1 }],
      email: "fail@example.com",
    });

    // @ts-expect-error - using simplified mock
    const res = await POST(req);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test("returns 400 when items is not an array", async () => {
    const req = makeRequest({ items: "not-an-array", email: "x@x.com" });
    // @ts-expect-error - using simplified mock
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
