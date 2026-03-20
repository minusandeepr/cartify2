// src/routes/order.routes.js
import express from "express";
import  protect  from "../middleware/auth.middleware.js";
import  isAdmin   from "../middleware/isAdmin.middleware.js";
//import authMiddleware from "../middleware/auth.middleware.js";


import { createOrder,
   getMyOrders,
   getOrderById,
   getAllOrdersAdmin,
   cancelOrder,
   createRazorpayOrder,
  verifyRazorpayPayment,
   } from "../controllers/order.controller.js";

const router = express.Router();

// create new order (protected)
router.post("/", protect, createOrder);

// get orders for current user (protected)
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);
// Razorpay
router.post(
  "/create-razorpay-order",
  protect,
  createRazorpayOrder
);

router.post(
  "/verify-razorpay-payment",
  protect,
  verifyRazorpayPayment
);





export default router;
