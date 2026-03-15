# Architecture

## Data Flow

```
User Action              App Layer              External/Storage
─────────────────────────────────────────────────────────────────

Browse catalog           app/page.tsx
                         lib/products.ts (mock data)

Add to cart              CartContext (React)
                         localStorage (persistence)

View cart                app/cart/page.tsx
                         CartContext

Start checkout           app/checkout/page.tsx
 └─ Step 1: Address      AddressStep component (client validation)
 └─ Step 2: Payment      PaymentStep component
                          ├─ Stripe Elements (CardElement)
                          └─ POST /api/checkout
                                │
                                ├─→ Validate items vs server prices
                                ├─→ stripe.paymentIntents.create()    → Stripe API
                                └─→ INSERT orders (status=pending)    → SQLite

                         stripe.confirmCardPayment() (client)         → Stripe API
                          └─ on success: POST /api/orders
                                └─→ UPDATE orders SET status='paid'   → SQLite

                         clearCart() + redirect /checkout/success

Order success            app/checkout/success/page.tsx
                         Shows orderId from URL

Order history            app/orders/page.tsx
                          └─ GET /api/orders
                                └─→ SELECT * FROM orders              → SQLite
```

## Component Tree

```
RootLayout (app/layout.tsx)
└── CartProvider (components/CartContext.tsx)
    ├── Navbar (inline in layout)
    ├── CatalogPage (app/page.tsx)
    │   └── ProductCard × 6
    ├── CartPage (app/cart/page.tsx)
    │   ├── CartItemRow × n
    │   └── OrderSummary
    ├── CheckoutPage (app/checkout/page.tsx)
    │   └── Elements (Stripe)
    │       ├── AddressStep
    │       ├── PaymentStep
    │       │   └── CardElement (Stripe)
    │       └── OrderSummary (sidebar)
    ├── SuccessPage (app/checkout/success/page.tsx)
    └── OrdersPage (app/orders/page.tsx)
```

## API Routes

| Method | Path            | Auth | Description                              |
|--------|-----------------|------|------------------------------------------|
| POST   | /api/checkout   | none | Creates Stripe PaymentIntent, saves order |
| POST   | /api/orders     | none | Marks order as 'paid' after confirmation  |
| GET    | /api/orders     | none | Returns all orders (newest first)         |

### POST /api/checkout

**Request body:**
```json
{
  "items": [{ "productId": "vintage-camera", "quantity": 1 }],
  "email": "buyer@example.com",
  "address": { "name": "...", "address": "...", "city": "...", "state": "...", "zip": "..." }
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "orderId": "uuid-v4"
}
```

**Validation:**
- `items` must be a non-empty array
- `email` is required
- Each `productId` must match a known product (server-side price lookup)
- `quantity` must be a positive integer

### POST /api/orders

**Request body:**
```json
{ "orderId": "uuid-v4" }
```

**Response:**
```json
{ "order": { "id": "...", "status": "paid", ... } }
```

### GET /api/orders

**Response:**
```json
{
  "orders": [
    {
      "id": "uuid-v4",
      "email": "buyer@example.com",
      "items": "[{...}]",
      "total": 12900,
      "status": "paid",
      "stripe_payment_intent": "pi_xxx",
      "created_at": 1710000000000
    }
  ]
}
```

## SQLite Schema

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  items TEXT NOT NULL,        -- JSON array of { productId, name, price, quantity }
  total INTEGER NOT NULL,     -- total in cents
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent TEXT, -- Stripe PI id for reference
  created_at INTEGER NOT NULL -- Unix timestamp (ms)
);
```

## Cart State (localStorage)

Key: `checkout-demo-cart`

Value:
```json
[
  {
    "productId": "vintage-camera",
    "name": "Vintage Camera",
    "price": 129,
    "quantity": 2,
    "imageSeed": "camera"
  }
]
```

## Security Notes

- Prices are **never trusted from the client** — all amounts are computed server-side from the known product catalog
- Stripe webhook verification is out of scope for this demo
- No authentication — this is a demo only
- `.env.local` is gitignored; only placeholder `.env.local.example` is committed
