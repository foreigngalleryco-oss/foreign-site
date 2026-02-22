export type Product = {
  handle: string;
  title: string;
  subtitle: string;
  priceCents: number;
  description: string;
  details: string[];
  artClass: string;
  badge?: string;
};

const products: Product[] = [
  {
    handle: "thermal-shell-jacket",
    title: "Thermal Shell Jacket",
    subtitle: "Structured Outer Layer",
    priceCents: 24800,
    description: "Water-resistant shell jacket with a clean fit.",
    details: ["Limited run", "Unisex fit", "Ships in 2-4 days"],
    artClass: "art-shell"
  },
  {
    handle: "studio-pleat-pant",
    title: "Studio Pleat Pant",
    subtitle: "Tailored Utility",
    priceCents: 18400,
    description: "Relaxed tapered pants with utility details.",
    details: ["Midweight stretch twill", "Machine wash cold", "Final sale"],
    artClass: "art-pleat"
  }
];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductByHandle(handle: string): Product | undefined {
  return products.find((product) => product.handle === handle);
}

export function formatUsd(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(priceCents / 100);
}
