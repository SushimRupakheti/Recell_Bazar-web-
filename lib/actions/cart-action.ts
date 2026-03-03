"use server";

import { getAuthToken } from "../cookie";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

function authHeaders(token: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* =========================
   Get Cart
========================= */
export async function fetchCart() {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const res = await fetch(`${BACKEND}/api/cart`, {
      method: "GET",
      headers: authHeaders(token),
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) return { success: false, message: json.message || "Failed to fetch cart" };
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, message: err.message || "Network error" };
  }
}

/* =========================
   Add to Cart
========================= */
export async function addToCartAction(productId: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const res = await fetch(`${BACKEND}/api/cart/add`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ productId }),
    });
    const json = await res.json();

    if (res.status === 409) {
      return { success: false, message: json.message || "Product already in cart", alreadyInCart: true };
    }

    if (!res.ok) return { success: false, message: json.message || "Failed to add to cart" };
    return { success: true, data: json.data, message: json.message };
  } catch (err: any) {
    return { success: false, message: err.message || "Network error" };
  }
}

/* =========================
   Remove from Cart
========================= */
export async function removeFromCartAction(cartItemId: string) {
  const token = await getAuthToken();
  if (!token) return { success: false, message: "Not authenticated" };

  try {
    const res = await fetch(`${BACKEND}/api/cart/remove/${cartItemId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, message: json.message || "Failed to remove item" };
    return { success: true, message: json.message };
  } catch (err: any) {
    return { success: false, message: err.message || "Network error" };
  }
}
