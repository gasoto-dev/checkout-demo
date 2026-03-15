# Architecture

## Data Flow

```
User → Product Catalog (/) → Cart (/cart) → Checkout (/checkout)
                                                    │
                              ┌─────────────────────┤
                              │                     │
                        Step 1: Address        Step 2: Payment
                              │                     │
                              │              POST /api/checkout
                              │              (validates total, creates PaymentIntent)
                              │                     │
                              │              stripe.confirmCardPayment()
                              │                     │
                              │              POST /api/orders (mark paid)
                              │                     │
                              └──────────► /checkout/success?orderId=xxx
                                                     │
                                              SQLite (orders.db)
                                                     │
                                             GET /api/orders → /orders
```

## Component Tree

```
RootLayout
├── Nav (Products, Cart, Orders links)
└── CartProvider (localStorage persistence)
    ├── / → CatalogPage
    │   └── ProductCard × 6 (Add to Cart)
    ├── /cart → CartPage
    │   └── CartItem (quantity controls, remove)
    ├── /checkout → CheckoutPage (Stripe Elements wrapper)
    │   ├── AddressStep (name, email, address, city, state, zip)
    │   ├── PaymentStep (CardElement, order summary, submit)
    │   └── OrderSummary sidebar
    ├── /checkout/success → SuccessPage
    │   └── orderId display, links to orders + home
    └── /orders → OrdersPage (server component, fetches SQLite)
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/checkout` | Creates Stripe PaymentIntent, saves pending order to SQLite |
| POST | `/api/orders` | Marks order status = 'paid' |
| GET | `/api/orders` | Returns all orders (for history page) |

## SQLite Schema

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,          -- UUID
  email TEXT NOT NULL,          -- buyer email
  items TEXT NOT NULL,          -- JSON: [{productId, quantity, price}]
  total INTEGER NOT NULL,       -- total in cents
  status TEXT NOT NULL,         -- 'pending' | 'paid'
  stripe_payment_intent TEXT,   -- Stripe PaymentIntent ID
  created_at INTEGER NOT NULL   -- Unix timestamp ms
);
```

## Key Design Decisions

- **Server-side price validation**: The `/api/checkout` route recalculates the total from product prices — never trusts the client-sent total.
- **Idempotent order creation**: Orders are created as 'pending' when PaymentIntent is created, then marked 'paid' only after Stripe confirms success.
- **No auth**: This is a demo — in production, orders would be associated with user accounts.
- **SQLite**: Lightweight, no external dependencies. Suitable for demos and low-traffic apps.
