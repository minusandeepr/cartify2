// src/routes/order.routes.js
import express from "express";
import  protect  from "../middleware/auth.middleware.js";
import  isAdmin   from "../middleware/isAdmin.middleware.js";

import { createOrder,
   getMyOrders,
   getOrderById,
   getAllOrdersAdmin,
   cancelOrder,
   } from "../controllers/order.controller.js";

const router = express.Router();

// create new order (protected)
router.post("/", protect, createOrder);

// get orders for current user (protected)
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);



export default router;
