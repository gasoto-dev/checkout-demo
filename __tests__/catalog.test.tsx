/**
 * Component smoke tests for the product catalog page
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { products } from "@/lib/products";

// Mock CartContext
const mockAddItem = jest.fn();
jest.mock("@/components/CartContext", () => ({
  useCart: () => ({
    addItem: mockAddItem,
    totalItems: 0,
    items: [],
    removeItem: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn(),
    totalPrice: 0,
  }),
  CartProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

import CatalogPage from "@/app/page";

describe("CatalogPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders page heading", () => {
    render(<CatalogPage />);
    expect(screen.getByText("Our Products")).toBeInTheDocument();
  });

  test("renders all 6 products", () => {
    render(<CatalogPage />);
    const cards = screen.getAllByTestId("product-card");
    expect(cards).toHaveLength(products.length);
    expect(cards).toHaveLength(6);
  });

  test("renders each product name", () => {
    render(<CatalogPage />);
    expect(screen.getByText("Vintage Camera")).toBeInTheDocument();
    expect(screen.getByText("Leather Journal")).toBeInTheDocument();
    expect(screen.getByText("Ceramic Mug")).toBeInTheDocument();
    expect(screen.getByText("Silk Scarf")).toBeInTheDocument();
    expect(screen.getByText("Wooden Chess Set")).toBeInTheDocument();
    expect(screen.getByText("Vintage Lamp")).toBeInTheDocument();
  });

  test("renders product prices", () => {
    render(<CatalogPage />);
    expect(screen.getByText("$129")).toBeInTheDocument();
    expect(screen.getByText("$45")).toBeInTheDocument();
    expect(screen.getByText("$28")).toBeInTheDocument();
  });

  test("renders Add to Cart buttons", () => {
    render(<CatalogPage />);
    const buttons = screen.getAllByText("Add to Cart");
    expect(buttons).toHaveLength(products.length);
  });

  test("calls addItem when Add to Cart is clicked", () => {
    render(<CatalogPage />);
    const buttons = screen.getAllByText("Add to Cart");
    fireEvent.click(buttons[0]);
    expect(mockAddItem).toHaveBeenCalledTimes(1);
    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: expect.any(String),
        name: expect.any(String),
        price: expect.any(Number),
      })
    );
  });
});
