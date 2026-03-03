import axios from "./axios";
import { API } from "./endpoints";

export type CartProduct = {
  _id: string;
  phoneModel: string;
  category: string;
  finalPrice: string | number;
  basePrice: string | number;
  photos: string[];
  isSold: boolean;
  status: string;
  description: string;
};

export type CartItem = {
  _id: string;
  cartId: string;
  productId: CartProduct;
  priceAtTime: number;
  createdAt: string;
  updatedAt: string;
};

export type CartData = {
  cart: { _id: string; userId: string; createdAt: string; updatedAt: string } | null;
  items: CartItem[];
  totalPrice: number;
};

/** GET /api/cart — fetch all cart items with populated product details */
export async function getCart(): Promise<CartData> {
  const res = await axios.get(API.CART.GET);
  const data = res.data?.data ?? { cart: null, items: [], totalPrice: 0 };
  return data;
}

/** POST /api/cart/add — add a product to the cart */
export async function addToCart(productId: string) {
  const res = await axios.post(API.CART.ADD, { productId });
  return res.data;
}

/** DELETE /api/cart/remove/:cartItemId — remove a cart item */
export async function removeFromCart(cartItemId: string) {
  const res = await axios.delete(API.CART.REMOVE(cartItemId));
  return res.data;
}
