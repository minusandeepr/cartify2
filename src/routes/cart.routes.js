// src/routes/cart.routes.js
import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

// GET /api/cart  -> get current user's cart
router.get("/", protect, getCart);

// POST /api/cart  -> add a product to cart
router.post("/", protect, addToCart);

// PATCH /api/cart/:productId  -> change quantity
router.patch("/:productId", protect, updateCartItem); 
// DELETE /api/cart/:productId  -> remove one item
router.delete("/:productId", protect, removeCartItem);

// DELETE /api/cart  -> clear cart
router.delete("/", protect, clearCart);

export default router;
