"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { fetchCart, removeFromCartAction } from "@/lib/actions/cart-action";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import HomeCard from "@/app/components/homeCard";

type CartItem = {
  _id: string;
  cartId: string;
  productId: any;
  priceAtTime: number;
  createdAt: string;
  updatedAt: string;
};

export default function CartPageClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchCart();
    if (res.success) {
      setItems(res.data?.items ?? []);
    } else {
      setError(res.message || "Failed to load cart");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = (cartItemId: string) => {
    setRemovingId(cartItemId);
    startTransition(async () => {
      const res = await removeFromCartAction(cartItemId);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i._id !== cartItemId));
      } else {
        setError(res.message || "Failed to remove item");
      }
      setRemovingId(null);
    });
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
      </div>
    );
  }

  // ── Empty state ──
  if (!items.length) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
        <p className="text-sm text-gray-500">Browse our collection and add items to your cart.</p>
        <Link
          href="/dashboard/home"
          className="mt-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-3 font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-sm text-gray-500">{items.length} {items.length === 1 ? "item" : "items"}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((cartItem) => {
          const product = cartItem.productId;
          if (!product) return null;
          const isRemoving = removingId === cartItem._id;

          return (
            <div key={cartItem._id} className="relative">
              <HomeCard item={product} />
              {/* Remove button overlay */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(cartItem._id);
                }}
                disabled={isRemoving}
                className="absolute top-2 right-2 z-10 rounded-full bg-white/90 p-1.5 text-gray-400 shadow-sm hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                title="Remove from cart"
              >
                {isRemoving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
