import express from "express";
import {
  getMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemStatus,
} from "../controllers/menuController";

import {
  createOrder,
  getKitchenOrders,
  updateOrderStatus,
  getOrderStats,
  getTransactionHistory, // 1. Import the new function
} from "../controllers/orderController";

const router = express.Router();

// --- Public Routes ---
router.get("/menu", getMenu);
router.post("/orders", createOrder);

// --- Kitchen Routes ---
router.get("/kitchen/orders", getKitchenOrders);
router.put("/orders/:id/status", updateOrderStatus);

// --- Admin Routes ---
router.get("/stats", getOrderStats);
router.get("/transactions", getTransactionHistory); // 2. Add the Transaction History Route
router.post("/menu", addMenuItem);
router.put("/menu/:id", updateMenuItem);
router.delete("/menu/:id", deleteMenuItem);
router.patch("/menu/:id/status", toggleMenuItemStatus);

export default router;
