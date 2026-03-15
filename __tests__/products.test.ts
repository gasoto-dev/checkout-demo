import { products, getProductById, priceToCents, getImageUrl } from "@/lib/products";

describe("products", () => {
  test("products array has 6 items", () => {
    expect(products).toHaveLength(6);
  });

  test("each product has required fields", () => {
    for (const product of products) {
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("description");
      expect(product).toHaveProperty("imageSeed");
      expect(typeof product.id).toBe("string");
      expect(typeof product.name).toBe("string");
      expect(typeof product.price).toBe("number");
      expect(typeof product.description).toBe("string");
      expect(typeof product.imageSeed).toBe("string");
    }
  });

  test("product IDs are unique", () => {
    const ids = products.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("all prices are positive numbers", () => {
    for (const product of products) {
      expect(product.price).toBeGreaterThan(0);
    }
  });

  test("product list contains expected products", () => {
    const names = products.map((p) => p.name);
    expect(names).toContain("Vintage Camera");
    expect(names).toContain("Leather Journal");
    expect(names).toContain("Ceramic Mug");
    expect(names).toContain("Silk Scarf");
    expect(names).toContain("Wooden Chess Set");
    expect(names).toContain("Vintage Lamp");
  });

  test("Vintage Camera costs $129", () => {
    const camera = products.find((p) => p.name === "Vintage Camera");
    expect(camera?.price).toBe(129);
  });
});

describe("priceToCents", () => {
  test("converts whole dollar amounts", () => {
    expect(priceToCents(1)).toBe(100);
    expect(priceToCents(10)).toBe(1000);
    expect(priceToCents(129)).toBe(12900);
  });

  test("converts fractional dollar amounts", () => {
    expect(priceToCents(1.99)).toBe(199);
    expect(priceToCents(9.95)).toBe(995);
  });

  test("handles zero", () => {
    expect(priceToCents(0)).toBe(0);
  });

  test("correctly converts all product prices to cents", () => {
    expect(priceToCents(129)).toBe(12900); // Vintage Camera
    expect(priceToCents(45)).toBe(4500);  // Leather Journal
    expect(priceToCents(28)).toBe(2800);  // Ceramic Mug
    expect(priceToCents(89)).toBe(8900);  // Silk Scarf
    expect(priceToCents(149)).toBe(14900); // Wooden Chess Set
    expect(priceToCents(95)).toBe(9500);  // Vintage Lamp
  });
});

describe("getProductById", () => {
  test("finds product by id", () => {
    const product = getProductById("vintage-camera");
    expect(product).toBeDefined();
    expect(product?.name).toBe("Vintage Camera");
  });

  test("returns undefined for unknown id", () => {
    expect(getProductById("nonexistent")).toBeUndefined();
  });

  test("finds all products by their IDs", () => {
    for (const product of products) {
      const found = getProductById(product.id);
      expect(found).toBe(product);
    }
  });
});

describe("getImageUrl", () => {
  test("returns picsum URL with seed", () => {
    const url = getImageUrl("camera");
    expect(url).toBe("https://picsum.photos/seed/camera/400/300");
  });

  test("URL format is correct for any seed", () => {
    const url = getImageUrl("test-seed-123");
    expect(url).toMatch(/^https:\/\/picsum\.photos\/seed\/.+\/400\/300$/);
  });
});
