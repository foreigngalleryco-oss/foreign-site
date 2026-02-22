"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_UPDATED_EVENT, getCartCount, readCart } from "@/lib/cart-client";

export function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refreshCount = () => setCount(getCartCount(readCart()));

    refreshCount();
    window.addEventListener(CART_UPDATED_EVENT, refreshCount);
    window.addEventListener("storage", refreshCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refreshCount);
      window.removeEventListener("storage", refreshCount);
    };
  }, []);

  return <Link href="/cart">Cart ({count})</Link>;
}
