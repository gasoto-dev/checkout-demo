/**
 * Component smoke tests for the cart page
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock CartContext
const mockRemoveItem = jest.fn();
const mockUpdateQuantity = jest.fn();

const cartItems = [
  {
    productId: "vintage-camera",
    name: "Vintage Camera",
    price: 129,
    quantity: 1,
    imageSeed: "camera",
  },
  {
    productId: "ceramic-mug",
    name: "Ceramic Mug",
    price: 28,
    quantity: 3,
    imageSeed: "mug",
  },
];

let mockItems = cartItems;

jest.mock("@/components/CartContext", () => ({
  useCart: () => ({
    addItem: jest.fn(),
    totalItems: mockItems.reduce((s, i) => s + i.quantity, 0),
    items: mockItems,
    removeItem: mockRemoveItem,
    updateQuantity: mockUpdateQuantity,
    clearCart: jest.fn(),
    totalPrice: mockItems.reduce((s, i) => s + i.price * i.quantity, 0),
  }),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock("@/lib/products", () => ({
  ...jest.requireActual("@/lib/products"),
  getImageUrl: (seed: string) =>
    `https://picsum.photos/seed/${seed}/400/300`,
}));

import CartPage from "@/app/cart/page";

describe("CartPage - with items", () => {
  beforeEach(() => {
    mockItems = cartItems;
    jest.clearAllMocks();
  });

  test("renders cart items", () => {
    render(<CartPage />);
    expect(screen.getByText("Vintage Camera")).toBeInTheDocument();
    expect(screen.getByText("Ceramic Mug")).toBeInTheDocument();
  });

  test("shows cart item count", () => {
    render(<CartPage />);
    const items = screen.getAllByTestId("cart-item");
    expect(items).toHaveLength(2);
  });

  test("shows total price in order summary", () => {
    render(<CartPage />);
    // $129 + $28*3 = $213
    expect(screen.getByText("$213.00")).toBeInTheDocument();
  });

  test("calls removeItem when Remove is clicked", () => {
    render(<CartPage />);
    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[0]);
    expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveItem).toHaveBeenCalledWith("vintage-camera");
  });

  test("calls updateQuantity when + button is clicked", () => {
    render(<CartPage />);
    const increaseButtons = screen.getAllByLabelText("Increase quantity");
    fireEvent.click(increaseButtons[0]);
    expect(mockUpdateQuantity).toHaveBeenCalledWith("vintage-camera", 2);
  });

  test("calls updateQuantity when − button is clicked", () => {
    render(<CartPage />);
    const decreaseButtons = screen.getAllByLabelText("Decrease quantity");
    fireEvent.click(decreaseButtons[0]);
    expect(mockUpdateQuantity).toHaveBeenCalledWith("vintage-camera", 0);
  });

  test("shows proceed to checkout link", () => {
    render(<CartPage />);
    const link = screen.getByText("Proceed to Checkout");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/checkout");
  });
});

describe("CartPage - empty cart", () => {
  beforeEach(() => {
    mockItems = [];
    jest.clearAllMocks();
  });

  test("shows empty cart message", () => {
    render(<CartPage />);
    expect(screen.getByTestId("empty-cart")).toBeInTheDocument();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  test("shows browse products link", () => {
    render(<CartPage />);
    expect(screen.getByText("Browse Products")).toBeInTheDocument();
  });
});
