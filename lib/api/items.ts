// API Layer
// Call api from backend

import axios from "./axios";
import { API } from "./endpoints";
import cookie from 'cookie';

/* =========================
   Types
========================= */

export type ItemPayload = {
  photos?: string[];
  category?: string;
  phoneModel?: string;
  year?: number;
  batteryHealth?: number;
  description?: string;
  deviceCondition?: string;
  chargerAvailable?: boolean;
  repairedBoard?: boolean;
  factoryUnlock?: boolean;
  liquidDamage?: boolean;
  switchOn?: boolean;
  receiveCall?: boolean;
  features1Condition?: boolean;
  features2Condition?: boolean;
  cameraCondition?: boolean;
  displayCondition?: boolean;
  displayCracked?: boolean;
  displayOriginal?: boolean;
  sellerId?: string;
  finalPrice?: number;
  basePrice?: number;
};

/* =========================
   Brand / Model helpers
   Exported so frontend can reuse lists for dropdowns
========================= */

export const phoneModels: Record<string, string[]> = {
  iPhone: ["iPhone 14", "iPhone 14 Pro", "iPhone 13"],
  Samsung: ["Galaxy S23", "Galaxy Note 20", "Galaxy A52"],
  Poco: ["Poco X5", "Poco F4", "Poco M4"],
  Huawei: ["P50", "Mate 40", "Nova 9"],
  Pixel: ["Pixel 7", "Pixel 6a"],
  Vivo: ["Vivo V27", "Vivo Y33"],
  Oppo: ["Oppo Reno8", "Oppo F21"],
};

export const phoneBasePrices: Record<string, Record<string, number>> = {
  iPhone: {
    "iPhone 14": 120000,
    "iPhone 14 Pro": 145000,
    "iPhone 13": 95000,
  },
  Samsung: {
    "Galaxy S23": 110000,
    "Galaxy Note 20": 85000,
    "Galaxy A52": 45000,
  },
  Poco: { "Poco X5": 35000, "Poco F4": 55000, "Poco M4": 30000 },
  Huawei: { "P50": 90000, "Mate 40": 95000, "Nova 9": 50000 },
  Pixel: { "Pixel 7": 105000, "Pixel 6a": 65000 },
  Vivo: { "Vivo V27": 55000, "Vivo Y33": 32000 },
  Oppo: { "Oppo Reno8": 52000, "Oppo F21": 38000 },
};

const normalizeBrand = (b?: string) => {
  if (!b) return undefined;
  const key = String(b).toLowerCase();
  if (key.includes("iphone")) return "iPhone";
  if (key.includes("samsung")) return "Samsung";
  if (key.includes("poco")) return "Poco";
  if (key.includes("huawei")) return "Huawei";
  if (key.includes("pixel")) return "Pixel";
  if (key.includes("vivo")) return "Vivo";
  if (key.includes("oppo")) return "Oppo";
  return undefined;
};

export const getBasePrice = (brand?: string, model?: string) => {
  const b = normalizeBrand(brand);
  if (!b || !model) return undefined;
  const mp = phoneBasePrices[b];
  if (!mp) return undefined;
  return mp[model];
};

/* =========================
   Create Item
========================= */

export const createItem = async (itemData: ItemPayload) => {
  try {
    // ensure basePrice is present when possible using known brand/model mapping
    const payload: ItemPayload = { ...itemData };
    if (!payload.basePrice) {
      const bp = getBasePrice(payload.category, payload.phoneModel);
      if (bp) payload.basePrice = bp;
    }

    // Ensure finalPrice exists: compute based on known rules if possible
    if (payload.finalPrice === undefined || payload.finalPrice === null) {
      const bpNum = payload.basePrice ? Number(payload.basePrice) : 0;
      const computed = computeFinalPrice(bpNum, payload as any);
      payload.finalPrice = Math.max(0, Math.round(computed));
    }

    // Use same-origin POST to our pages API proxy so cookies are forwarded
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(API.ITEMS.CREATE, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      credentials: "same-origin",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Create failed: ${res.status} ${res.statusText} - ${text.slice(0,200)}`);
    }

    const data = await res.json();

    // Debug: log finalPrice and key flags in the browser console
    try {
      // eslint-disable-next-line no-console
      console.log("createItem: payload sent", {
        basePrice: payload.basePrice,
        finalPrice: payload.finalPrice,
        liquidDamage: payload.liquidDamage,
        switchOn: payload.switchOn,
        receiveCall: payload.receiveCall,
        features1Condition: payload.features1Condition,
        features2Condition: payload.features2Condition,
        cameraCondition: payload.cameraCondition,
        displayCondition: payload.displayCondition,
        displayCracked: payload.displayCracked,
        displayOriginal: payload.displayOriginal,
        factoryUnlock: payload.factoryUnlock,
        chargerAvailable: payload.chargerAvailable,
        batteryHealth: payload.batteryHealth,
        year: payload.year,
        repairedBoard: (payload as any).repairedBoard,
      });
    } catch (e) {
      // ignore
    }

    return data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Create item failed"
    );
  }
};

/* =========================
   Server-side proxy helper
   Mirrors pages/api/items/index.ts behavior so server code can forward
   requests to the backend with cookie -> Authorization forwarding.
   Usage: call `proxyCreateItem(body, cookieHeader)` from server code.
========================= */

export const proxyCreateItem = async (body: any, cookieHeader?: string) => {
  try {
    const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';
    const target = `${BACKEND}/api/items`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      try {
        const parsed = cookie.parse(cookieHeader || '');
        const authToken = parsed.auth_token || parsed.token || undefined;
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }
      } catch (e) {
        // ignore cookie parse errors
      }
    }

    const resp = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const text = await resp.text();
    const contentType = resp.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return JSON.parse(text);
    }
    return { success: resp.ok, message: text };
  } catch (err: any) {
    return { success: false, message: err.message || 'Proxy error' };
  }
};

/* =========================
   Price Calculation Helper
   Mirrors the Flutter `PhonePriceData._calculateFinalPrice()` logic
========================= */

export const computeFinalPrice = (basePrice: number, p: Partial<ItemPayload & { batteryHealth?: number; year?: number }>) => {
  let price = basePrice || 0;

  // Major Issues
  if (p.liquidDamage) price *= 0.5;
  if (p.switchOn === false) price *= 0.6;
  if (p.receiveCall === false) price *= 0.8;

  // Feature Conditions
  if (p.features1Condition === false) price *= 0.9;
  if (p.features2Condition === false) price *= 0.9;

  // Camera + Display Conditions
  if (p.cameraCondition === false) price *= 0.85;
  if (p.displayCondition === false) price *= 0.8;

  // Display Damage
  if (p.displayCracked) price *= 0.7;
  if (p.displayOriginal === false) price *= 0.85;

  // Unlock Status
  if (p.factoryUnlock === false) price *= 0.6;

  // Charger Deduction
  if (p.chargerAvailable === false) price *= 0.95;

  // Battery Effect
  const battery = typeof p.batteryHealth === 'number' ? p.batteryHealth : 100;
  price *= (battery / 100);

  // Age Deduction (kept but defaults to no deduction if year not provided)
  const currentYear = new Date().getFullYear();
  const year = typeof p.year === 'number' ? p.year : currentYear;
  const age = currentYear - year;
  if (age > 0) {
    price *= (1 - (0.05 * age));
  }

  // Repaired Board Deduction
  if (p.repairedBoard) price *= 0.8;

  if (price < 0) price = 0;
  return price;
};

/* =========================
   Upload Photos (client helper)
   Sends multipart/form-data to pages API route that uses multer
========================= */

export type UploadResult = { success: boolean; urls: string[]; message?: string; sellerId?: string };

export const uploadPhotos = async (files: (File | Blob)[]): Promise<UploadResult> => {
  try {
    const urls: string[] = [];
    let sellerId: string | undefined;

    // Backend expects single file field named `itemPhoto` on /api/items/upload-photo
    for (const file of files) {
      const form = new FormData();
      form.append("itemPhoto", file);

      const res = await fetch("/api/items/upload-photo", {
        method: "POST",
        body: form,
        credentials: "same-origin",
      });

      if (!res.ok) {
        const text = await res.text();
        return { success: false, urls: [], message: `Upload failed: ${res.status} ${res.statusText} - ${text.slice(0,200)}` };
      }

      const data = await res.json();
      // backend returns { success: true, url: '/uploads/..' }
      if (data?.success) {
        if (data.url) urls.push(data.url);
        else if (Array.isArray(data.urls)) urls.push(...data.urls);
        // capture sellerId if backend provides it on upload
        if (!sellerId && data.sellerId) sellerId = data.sellerId;
      } else {
        const msg = data?.message || 'Upload failed';
        return { success: false, urls: [], message: msg };
      }
    }

    return { success: true, urls, sellerId };
  } catch (err: any) {
    return { success: false, urls: [], message: err?.message || "Upload failed" };
  }
};
/* =========================
   Get All Items
========================= */

export const getAllItems = async () => {
  try {
    const response = await axios.get(API.ITEMS.ALL);
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Fetch items failed"
    );
  }
};

/* =========================
   Get Item By ID
========================= */

export const getItemById = async (id: string) => {
  try {
    const response = await axios.get(API.ITEMS.BY_ID(id));
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Fetch item failed"
    );
  }
};

/* =========================
   Get Items By Seller
========================= */

export const getItemsBySeller = async (sellerId: string) => {
  try {
    const response = await axios.get(API.ITEMS.BY_SELLER(sellerId));
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Fetch seller items failed"
    );
  }
};

/* =========================
   Update Item
========================= */

export const updateItem = async (
  id: string,
  payload: Partial<ItemPayload>
) => {
  try {
    const response = await axios.put(
      API.ITEMS.UPDATE(id),
      payload
    );
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Update item failed"
    );
  }
};

/* =========================
   Delete Item
========================= */

export const deleteItem = async (id: string) => {
  try {
    const response = await axios.delete(API.ITEMS.DELETE(id));
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Delete item failed"
    );
  }
};
