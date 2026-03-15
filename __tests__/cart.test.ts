// CartContext pure logic tests — test state transitions directly

import type { CartItem } from "@/components/CartContext"

// Pure helpers extracted for testing
function addItem(items: CartItem[], newItem: Omit<CartItem, "quantity">): CartItem[] {
  const existing = items.find((i) => i.productId === newItem.productId)
  if (existing) {
    return items.map((i) =>
      i.productId === newItem.productId ? { ...i, quantity: i.quantity + 1 } : i
    )
  }
  return [...items, { ...newItem, quantity: 1 }]
}

function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((i) => i.productId !== productId)
}

function updateQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeItem(items, productId)
  return items.map((i) => (i.productId === productId ? { ...i, quantity } : i))
}

function totalPrice(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

function totalItems(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}

const mockItem = (id: string, price: number): Omit<CartItem, "quantity"> => ({
  productId: id,
  name: `Product ${id}`,
  price,
  imageSeed: id,
})

describe("cart logic", () => {
  it("addItem adds a new item with quantity 1", () => {
    const result = addItem([], mockItem("a", 10))
    expect(result).toHaveLength(1)
    expect(result[0].quantity).toBe(1)
  })

  it("addItem increments quantity for existing item", () => {
    let items: CartItem[] = []
    items = addItem(items, mockItem("a", 10))
    items = addItem(items, mockItem("a", 10))
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
  })

  it("addItem adds different items separately", () => {
    let items: CartItem[] = []
    items = addItem(items, mockItem("a", 10))
    items = addItem(items, mockItem("b", 20))
    expect(items).toHaveLength(2)
  })

  it("removeItem removes correct item", () => {
    let items: CartItem[] = []
    items = addItem(items, mockItem("a", 10))
    items = addItem(items, mockItem("b", 20))
    items = removeItem(items, "a")
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe("b")
  })

  it("updateQuantity updates correctly", () => {
    let items = addItem([], mockItem("a", 10))
    items = updateQuantity(items, "a", 5)
    expect(items[0].quantity).toBe(5)
  })

  it("updateQuantity removes item when quantity is 0", () => {
    let items = addItem([], mockItem("a", 10))
    items = updateQuantity(items, "a", 0)
    expect(items).toHaveLength(0)
  })

  it("totalPrice calculates correctly", () => {
    let items: CartItem[] = []
    items = addItem(items, mockItem("a", 10))
    items = addItem(items, mockItem("b", 20))
    items = updateQuantity(items, "a", 3)
    // 10×3 + 20×1 = 50
    expect(totalPrice(items)).toBe(50)
  })

  it("totalItems counts all quantities", () => {
    let items: CartItem[] = []
    items = addItem(items, mockItem("a", 10))
    items = addItem(items, mockItem("b", 20))
    items = updateQuantity(items, "a", 3)
    expect(totalItems(items)).toBe(4) // 3+1
  })

  it("totalPrice is 0 for empty cart", () => {
    expect(totalPrice([])).toBe(0)
  })
})
