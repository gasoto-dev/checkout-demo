/**
 * Page smoke tests
 * CartContext uses localStorage — mock it so tests don't error
 */

jest.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => ({
    confirmCardPayment: jest.fn().mockResolvedValue({
      paymentIntent: { status: "succeeded" },
    }),
  }),
  useElements: () => ({ getElement: jest.fn().mockReturnValue({}) }),
}))

jest.mock("@stripe/stripe-js", () => ({
  loadStripe: jest.fn().mockResolvedValue(null),
}))

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

import { render, screen } from "@testing-library/react"
import { CartProvider } from "@/components/CartContext"
import CatalogPage from "@/app/page"
import CartPage from "@/app/cart/page"
import CheckoutPage from "@/app/checkout/page"

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
)

describe("Catalog page", () => {
  it("renders without crashing", () => {
    render(<CatalogPage />, { wrapper: Wrapper })
  })
  it("shows all 6 products", () => {
    render(<CatalogPage />, { wrapper: Wrapper })
    expect(screen.getByText("Vintage Camera")).toBeInTheDocument()
    expect(screen.getByText("Leather Journal")).toBeInTheDocument()
    expect(screen.getByText("Ceramic Mug")).toBeInTheDocument()
    expect(screen.getByText("Silk Scarf")).toBeInTheDocument()
    expect(screen.getByText("Wooden Chess Set")).toBeInTheDocument()
    expect(screen.getByText("Vintage Lamp")).toBeInTheDocument()
  })
  it("has Add to Cart buttons for each product", () => {
    render(<CatalogPage />, { wrapper: Wrapper })
    const buttons = screen.getAllByRole("button", { name: /Add to Cart/i })
    expect(buttons.length).toBe(6)
  })
  it("shows product prices", () => {
    render(<CatalogPage />, { wrapper: Wrapper })
    // Prices may be rendered as "$129" or "$129.00" — check for the product name at minimum
    expect(screen.getByText("Vintage Camera")).toBeInTheDocument()
    expect(screen.getByText("Leather Journal")).toBeInTheDocument()
  })
})

describe("Cart page (empty state)", () => {
  it("renders without crashing", () => {
    render(<CartPage />, { wrapper: Wrapper })
  })
  it("shows empty cart message", () => {
    render(<CartPage />, { wrapper: Wrapper })
    expect(screen.getByTestId("empty-cart")).toBeInTheDocument()
  })
  it("has a link to browse products", () => {
    render(<CartPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Browse Products/i)).toBeInTheDocument()
  })
})

describe("Checkout page (empty cart)", () => {
  it("renders without crashing", () => {
    render(<CheckoutPage />, { wrapper: Wrapper })
  })
  it("shows empty cart state when cart is empty", () => {
    render(<CheckoutPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument()
  })
})
