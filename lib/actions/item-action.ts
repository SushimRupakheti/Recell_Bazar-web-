"use server";

import {
  createItem,
  getAllItems,
  getItemById,
  getItemsBySeller,
  updateItem,
  deleteItem,
  ItemPayload
} from "../api/items"

/* =========================
   Create Item
========================= */

export const handleCreateItem = async (formData: ItemPayload) => {
  try {
    const result = await createItem(formData);

    if (result.success) {
      return {
        success: true,
        message: "Item created successfully",
        data: result.data
      };
    }

    return {
      success: false,
      message: result.message || "Item creation failed"
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
