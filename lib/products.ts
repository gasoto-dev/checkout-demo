export interface Product {
  id: string;
  name: string;
  price: number; // in dollars
  description: string;
  imageSeed: string;
}

export const products: Product[] = [
  {
    id: "vintage-camera",
    name: "Vintage Camera",
    price: 129,
    description: "A beautifully restored vintage film camera. Perfect for photography enthusiasts who appreciate classic craftsmanship.",
    imageSeed: "camera",
  },
  {
    id: "leather-journal",
    name: "Leather Journal",
    price: 45,
    description: "Handcrafted genuine leather journal with 200 pages of premium acid-free paper. Ideal for writing, sketching, or journaling.",
    imageSeed: "journal",
  },
  {
    id: "ceramic-mug",
    name: "Ceramic Mug",
    price: 28,
    description: "Artisan-crafted ceramic mug with a comfortable handle and 12oz capacity. Microwave and dishwasher safe.",
    imageSeed: "mug",
  },
  {
    id: "silk-scarf",
    name: "Silk Scarf",
    price: 89,
    description: "Luxurious 100% pure silk scarf with an elegant floral pattern. Lightweight and perfect for all seasons.",
    imageSeed: "scarf",
  },
  {
    id: "wooden-chess-set",
    name: "Wooden Chess Set",
    price: 149,
    description: "Hand-carved wooden chess set with weighted pieces and a folding storage board. A timeless game for all ages.",
    imageSeed: "chess",
  },
  {
    id: "vintage-lamp",
    name: "Vintage Lamp",
    price: 95,
    description: "Art deco-inspired table lamp with a warm Edison bulb. Adds a touch of vintage elegance to any room.",
    imageSeed: "lamp",
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function priceToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function getImageUrl(imageSeed: string): string {
  return `https://picsum.photos/seed/${imageSeed}/400/300`;
}
