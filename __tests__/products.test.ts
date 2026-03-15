import { products, getProductById, priceToCents, getImageUrl } from "@/lib/products"

describe("products", () => {
  it("has at least 6 products", () => {
    expect(products.length).toBeGreaterThanOrEqual(6)
  })

  it("every product has required fields", () => {
    for (const p of products) {
      expect(p.id).toBeTruthy()
      expect(p.name).toBeTruthy()
      expect(typeof p.price).toBe("number")
      expect(p.price).toBeGreaterThan(0)
      expect(p.description).toBeTruthy()
      expect(p.imageSeed).toBeTruthy()
    }
  })

  it("all product IDs are unique", () => {
    const ids = products.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("getProductById returns correct product", () => {
    const p = getProductById("vintage-camera")
    expect(p).toBeDefined()
    expect(p?.name).toBe("Vintage Camera")
    expect(p?.price).toBe(129)
  })

  it("getProductById returns undefined for unknown id", () => {
    expect(getProductById("not-a-product")).toBeUndefined()
  })

  it("priceToCents converts dollars to cents", () => {
    expect(priceToCents(129)).toBe(12900)
    expect(priceToCents(45)).toBe(4500)
    expect(priceToCents(28)).toBe(2800)
    expect(priceToCents(0.99)).toBe(99)
  })

  it("getImageUrl returns local image path", () => {
    const url = getImageUrl("camera")
    expect(url).toContain("camera")
  })

  it("all products have prices between $1 and $1000", () => {
    for (const p of products) {
      expect(p.price).toBeGreaterThanOrEqual(1)
      expect(p.price).toBeLessThanOrEqual(1000)
    }
  })
})
