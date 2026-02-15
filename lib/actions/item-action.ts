"use server";

import {
  getAllItems,
  getItemById,
  getItemsBySeller,
  updateItem,
  deleteItem,
  ItemPayload,
  getBasePrice,
  computeFinalPrice,
} from "../api/items";
import { getAuthToken } from "../cookie";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

/* =========================
   Create Item
========================= */

export const handleCreateItem = async (formData: ItemPayload) => {
  try {
    // normalize payload and fill basePrice when possible
    const payload: ItemPayload = { ...formData };
    if (!payload.basePrice) {
      const bp = getBasePrice(payload.category, payload.phoneModel);
      if (bp) payload.basePrice = bp;
    }

    // Ensure required finalPrice is present for backend validation
    if (payload.finalPrice === undefined || payload.finalPrice === null) {
      const bpNum = payload.basePrice ? Number(payload.basePrice) : 0;
      const computed = computeFinalPrice(bpNum, payload as any);
      payload.finalPrice = Math.max(0, Math.round(computed));
    }

    // Debug: server-side log of computed finalPrice and flags
    try {
      console.log("handleCreateItem: payload being sent to backend", {
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
    } catch (e) {}

    // Server-side: perform backend POST including server cookie token
    const token = await getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const resp = await fetch(`${BACKEND}/api/items`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    const contentType = resp.headers.get("content-type") || "";
    let result: any;
    if (contentType.includes("application/json")) {
      result = JSON.parse(text);
    } else {
      // unexpected non-json response
      throw new Error(`Create failed: ${resp.status} ${resp.statusText} - ${text.slice(0,200)}`);
    }

    if (resp.ok && result.success) {
      return {
        success: true,
        message: "Item created successfully",
        data: result.data,
      };
    }

    return {
      success: false,
      message: result.message || "Item creation failed",
    };

  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Item creation failed"
    };
  }
};

/* =========================
   Get All Items
========================= */

export const handleGetAllItems = async () => {
  try {
    const result = await getAllItems();

    return {
      success: true,
      data: result.data || result
    };

  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Fetch items failed"
    };
  }
};

/* =========================
   Get Item By ID
========================= */

export const handleGetItemById = async (id: string) => {
  // defensive: do not call backend with invalid id values
  if (!id || String(id) === "undefined" || String(id) === "null") {
    return {
      success: false,
      message: "Invalid item id"
    };
  }

  try {
    const result = await getItemById(id);

    return {
      success: true,
      data: result.data || result
    };

  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Fetch item failed"
    };
  }
};

/* =========================
   Get Items By Seller
========================= */

export const handleGetItemsBySeller = async (sellerId: string) => {
  try {
    const result = await getItemsBySeller(sellerId);

    return {
      success: true,
      data: result.data || result
    };

  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Fetch seller items failed"
    };
  }
};

/* =========================
   Update Item
========================= */

export const handleUpdateItem = async (
  id: string,
  payload: Partial<ItemPayload>
) => {
  try {
    const result = await updateItem(id, payload);

    if (result.success) {
      return {
        success: true,
        message: "Item updated successfully",
        data: result.data
      };
    }

    return {
      success: false,
      message: result.message || "Update failed"
    };

  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Update item failed"
    };
  }
};

/* =========================
   Delete Item
========================= */

export const handleDeleteItem = async (id: string) => {
  try {
    const result = await deleteItem(id);

    if (result.success) {
      return {
        success: true,
        message: "Item deleted successfully"
      };
    }

    return {
      success: false,
      message: result.message || "Delete failed"
    };

  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Delete item failed"
    };
  }
};
