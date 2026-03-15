# Checkout Demo

A full e-commerce checkout demo built with Next.js 15, Stripe test mode, and SQLite.

## Features

- **Product catalog** — 6 handpicked products with images
- **Shopping cart** — persisted in localStorage
- **Multi-step checkout** — Address → Payment (Stripe Elements) → Confirmation
- **Order history** — stored in SQLite, viewable at `/orders`
- **Test mode only** — no real payments, no real data

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│  / (catalog) → /cart → /checkout → /success  │
│             CartContext (localStorage)        │
└────────────────────┬────────────────────────┘
                     │ fetch
┌────────────────────▼────────────────────────┐
│              Next.js API Routes              │
│  POST /api/checkout  → Stripe PaymentIntent  │
│  POST /api/orders    → mark paid in SQLite   │
│  GET  /api/orders    → list orders           │
└────────────┬──────────────┬─────────────────┘
             │              │
    ┌────────▼──────┐  ┌────▼──────────┐
    │  Stripe API   │  │  SQLite DB    │
    │  (test mode)  │  │  orders.db    │
    └───────────────┘  └───────────────┘
```

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/gasoto-dev/checkout-demo.git
cd checkout-demo
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Stripe test keys (from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)):

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test Card

Use Stripe's test card to complete checkout:

| Field       | Value                  |
|-------------|------------------------|
| Card Number | `4242 4242 4242 4242`  |
| Expiry      | Any future date        |
| CVC         | Any 3 digits           |
| ZIP         | Any 5 digits           |

## Environment Variables

| Variable                            | Description                          |
|-------------------------------------|--------------------------------------|
| `STRIPE_SECRET_KEY`                 | Stripe secret key (server-side only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| Stripe publishable key (client-side) |

## Running Tests

```bash
npm test
```

53 tests across:
- `products.test.ts` — product data shape, price conversion
- `api-checkout.test.ts` — checkout API happy path, error cases
- `api-orders.test.ts` — orders API GET/POST
- `catalog.test.tsx` — product catalog rendering
- `cart.test.tsx` — cart page with items and empty state
- `checkout.test.tsx` — checkout form, success page

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Stripe** (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`)
- **SQLite** via `better-sqlite3`
- **Jest** + **Testing Library**

## Database

SQLite file `orders.db` is created automatically at the project root on first run. It's gitignored.

## Project Structure

```
app/
├── page.tsx              # Product catalog
├── cart/page.tsx         # Shopping cart
├── checkout/
│   ├── page.tsx          # Multi-step checkout (Address + Payment)
│   └── success/page.tsx  # Order confirmation
├── orders/page.tsx       # Order history
└── api/
    ├── checkout/route.ts # POST - create PaymentIntent
    └── orders/route.ts   # GET/POST - order management

components/
└── CartContext.tsx        # Cart state (localStorage)

lib/
├── products.ts           # Mock product catalog
└── db.ts                 # SQLite connection + schema
```
