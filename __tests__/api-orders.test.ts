/**
 * API route tests for GET/POST /api/orders
 * Mocks: better-sqlite3
 */

// Mock better-sqlite3
const mockRun = jest.fn().mockReturnValue({ changes: 1 });
const mockAll = jest.fn().mockReturnValue([]);
const mockGet = jest.fn();
const mockPrepare = jest.fn();
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

// Mock next/server
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

import { GET, POST } from "@/app/api/orders/route";

function makeRequest(body: unknown) {
  return {
    json: async () => body,
  } as ReturnType<typeof Request["prototype"]> & { json: () => Promise<unknown> };
}

describe("GET /api/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrepare.mockReturnValue({ all: mockAll, run: mockRun, get: mockGet });
    mockAll.mockReturnValue([]);
  });

  test("returns orders list", async () => {
    const fakeOrders = [
      {
        id: "order-1",
        email: "a@b.com",
        items: JSON.stringify([{ name: "Mug", quantity: 1, price: 2800 }]),
        total: 2800,
        status: "paid",
        stripe_payment_intent: "pi_1",
        created_at: Date.now(),
      },
    ];
    mockAll.mockReturnValueOnce(fakeOrders);

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.orders).toHaveLength(1);
    expect(data.orders[0].id).toBe("order-1");
  });

  test("returns empty array when no orders", async () => {
    mockAll.mockReturnValueOnce([]);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.orders).toEqual([]);
  });
});

describe("POST /api/orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrepare.mockReturnValue({ all: mockAll, run: mockRun, get: mockGet });
    mockRun.mockReturnValue({ changes: 1 });
    mockGet.mockReturnValue({
      id: "order-abc",
      email: "x@x.com",
      items: "[]",
      total: 1000,
      status: "paid",
      stripe_payment_intent: null,
      created_at: Date.now(),
    });
  });

  test("marks order as paid", async () => {
    const req = makeRequest({ orderId: "order-abc" });
    // @ts-expect-error - using simplified mock
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.order).toBeDefined();
  });

  test("returns 400 when orderId is missing", async () => {
    const req = makeRequest({});
    // @ts-expect-error - using simplified mock
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  test("returns 404 when order does not exist", async () => {
    mockRun.mockReturnValueOnce({ changes: 0 });
    mockGet.mockReturnValueOnce(undefined);

    const req = makeRequest({ orderId: "does-not-exist" });
    // @ts-expect-error - using simplified mock
    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});
