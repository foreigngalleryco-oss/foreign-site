"use client";

export const CART_STORAGE_KEY = "foreign_cart";
export const CART_UPDATED_EVENT = "foreign-cart-updated";

export type CartItem = {
  handle: string;
  title: string;
  subtitle: string;
  priceCents: number;
  quantity: number;
};

function safeParse(value: string | null): CartItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as CartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item) => item && typeof item.handle === "string" && item.quantity > 0);
  } catch {
    return [];
  }
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  return safeParse(window.localStorage.getItem(CART_STORAGE_KEY));
}

function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1): void {
  const cart = readCart();
  const existing = cart.find((row) => row.handle === item.handle);

  if (existing) {
    existing.quantity += quantity;
    writeCart(cart);
    return;
  }

  writeCart([...cart, { ...item, quantity }]);
}

export function updateQuantity(handle: string, quantity: number): void {
  const cart = readCart()
    .map((item) => (item.handle === handle ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  writeCart(cart);
}

export function removeFromCart(handle: string): void {
  const cart = readCart().filter((item) => item.handle !== handle);
  writeCart(cart);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}
