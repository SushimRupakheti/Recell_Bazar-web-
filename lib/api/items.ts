// API Layer
// Call api from backend

import axios from "./axios";
import { API } from "./endpoints";

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
  finalPrice?: string;
  basePrice?: string;
};

/* =========================
   Create Item
========================= */

export const createItem = async (itemData: ItemPayload) => {
  try {
    const response = await axios.post(
      API.ITEMS.CREATE,
      itemData
    );
    return response.data;
  } catch (err: Error | any) {
    throw new Error(
      err.response?.data?.message ||
      err.message ||
      "Create item failed"
    );
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
