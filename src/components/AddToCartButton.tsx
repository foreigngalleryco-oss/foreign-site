"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart-client";

type AddToCartButtonProps = {
  handle: string;
  title: string;
  subtitle: string;
  priceCents: number;
};

export function AddToCartButton({ handle, title, subtitle, priceCents }: AddToCartButtonProps) {
  const [status, setStatus] = useState<string>("");

  return (
    <div className="add-to-cart-wrap">
      <button
        onClick={() => {
          addToCart({ handle, title, subtitle, priceCents });
          setStatus("Added to cart");
          window.setTimeout(() => setStatus(""), 2000);
        }}
      >
        Add To Cart
      </button>
      <p className="status hint">{status}</p>
    </div>
  );
}
