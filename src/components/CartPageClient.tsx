"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatUsd } from "@/lib/products";
import {
  CART_UPDATED_EVENT,
  CartItem,
  getCartCount,
  getCartSubtotal,
  readCart,
  removeFromCart,
  updateQuantity
} from "@/lib/cart-client";

export function CartPageClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const refresh = () => setItems(readCart());

    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);

  if (!items.length) {
    return (
      <section className="container page-shell cart-shell">
        <h1>Cart</h1>
        <p>Your cart is empty.</p>
        <Link href="/collections/all" className="text-link">
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="container page-shell cart-shell">
      <h1>Cart ({getCartCount(items)} items)</h1>
      <div className="cart-list">
        {items.map((item) => (
          <article key={item.handle} className="cart-row">
            <div>
              <h2>{item.title}</h2>
              <p>{item.subtitle}</p>
              <p>{formatUsd(item.priceCents)}</p>
            </div>
            <div className="qty-group">
              <button onClick={() => updateQuantity(item.handle, item.quantity - 1)} className="secondary">
                -
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.handle, item.quantity + 1)} className="secondary">
                +
              </button>
            </div>
            <button onClick={() => removeFromCart(item.handle)} className="secondary">
              Remove
            </button>
          </article>
        ))}
      </div>
      <div className="cart-summary">
        <p>Subtotal</p>
        <strong>{formatUsd(subtotal)}</strong>
      </div>
      <button>Proceed To Checkout</button>
      <p className="status hint">All sales final.</p>
    </section>
  );
}
