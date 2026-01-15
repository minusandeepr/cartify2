// src/routes/product.routes.js
import { Router } from "express";
import  upload   from "../middleware/upload.js";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  
} from "../controllers/product.controller.js";
import protect  from "../middleware/auth.middleware.js";
import isAdmin  from "../middleware/isAdmin.middleware.js";



const router = Router();

router.get("/", listProducts);       // GET all products
router.get("/:id", getProduct);      // GET single product
router.post("/", createProduct);     // POST new product
router.put("/:id", updateProduct);   // UPDATE product
router.delete("/:id", deleteProduct); // DELETE product


//router.post("/:id/image", upload.single("image"), uploadProductImage);
router.post(
  "/products",
  protect,
  isAdmin,
  upload.single("image"),
  createProduct
);


export default router;
