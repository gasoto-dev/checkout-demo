/**
 * Component smoke tests for checkout page and success page
 */
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock Stripe
jest.mock("@stripe/stripe-js", () => ({
  loadStripe: jest.fn().mockResolvedValue({}),
}));

jest.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  CardElement: () => <div data-testid="card-element">Card Input</div>,
  useStripe: () => ({
    confirmCardPayment: jest.fn(),
  }),
  useElements: () => ({
    getElement: jest.fn(),
  }),
}));

// Mock CartContext
const mockClearCart = jest.fn();
let mockCartItems = [
  {
    productId: "vintage-camera",
    name: "Vintage Camera",
    price: 129,
    quantity: 1,
    imageSeed: "camera",
  },
];

jest.mock("@/components/CartContext", () => ({
  useCart: () => ({
    addItem: jest.fn(),
    totalItems: mockCartItems.reduce((s, i) => s + i.quantity, 0),
    items: mockCartItems,
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: mockClearCart,
    totalPrice: mockCartItems.reduce((s, i) => s + i.price * i.quantity, 0),
  }),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams("orderId=test-order-123"),
  usePathname: () => "/checkout",
}));

import CheckoutPage from "@/app/checkout/page";
import SuccessPage from "@/app/checkout/success/page";

describe("CheckoutPage", () => {
  beforeEach(() => {
    mockCartItems = [
      {
        productId: "vintage-camera",
        name: "Vintage Camera",
        price: 129,
        quantity: 1,
        imageSeed: "camera",
      },
    ];
    jest.clearAllMocks();
  });

  test("renders checkout heading", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("Checkout")).toBeInTheDocument();
  });

  test("shows address form on step 1", () => {
    render(<CheckoutPage />);
    expect(screen.getByTestId("address-form")).toBeInTheDocument();
  });

  test("shows shipping step indicator", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("Shipping")).toBeInTheDocument();
  });

  test("shows order summary with cart item", () => {
    render(<CheckoutPage />);
    expect(screen.getByText(/Vintage Camera/)).toBeInTheDocument();
    const prices = screen.getAllByText(/\$129\.00/);
    expect(prices.length).toBeGreaterThanOrEqual(1);
  });

  test("shows address form fields", () => {
    render(<CheckoutPage />);
    expect(screen.getByPlaceholderText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("123 Main St")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Springfield")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("CA")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("90210")).toBeInTheDocument();
  });

  test("shows Continue to Payment button", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("Continue to Payment →")).toBeInTheDocument();
  });
});

describe("CheckoutPage - empty cart", () => {
  beforeEach(() => {
    mockCartItems = [];
    jest.clearAllMocks();
  });

  test("shows empty cart message when cart is empty", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });
});

describe("SuccessPage", () => {
  test("renders success heading", () => {
    render(<SuccessPage />);
    expect(screen.getByText("Order Placed!")).toBeInTheDocument();
  });

  test("shows order ID", () => {
    render(<SuccessPage />);
    expect(screen.getByText("test-order-123")).toBeInTheDocument();
  });

  test("shows View All Orders link", () => {
    render(<SuccessPage />);
    expect(screen.getByText("View All Orders")).toBeInTheDocument();
  });

  test("shows Continue Shopping link", () => {
    render(<SuccessPage />);
    expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
  });
});
