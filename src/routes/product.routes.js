// src/routes/product.routes.js
import { Router } from "express";
import  upload   from "../middleware/upload.js";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  
} from "../controllers/product.controller.js";
import protect  from "../middleware/auth.middleware.js";
import isAdmin  from "../middleware/isAdmin.middleware.js";



const router = Router();

router.get("/", listProducts);       // GET all products
router.get("/", async (req, res) => {
  const search = req.query.search || "";

  const products = await Product.find({
    $or: [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ]
  });

  res.json({ products });
});



router.get("/:id", getProduct);      // GET single product
//router.post("/", createProduct);     // POST new product
router.put("/:id", updateProduct);   // UPDATE product
router.delete("/:id", deleteProduct); // DELETE product

router.post(
  "/",
  protect,
  isAdmin,
  upload.single("image"),
  createProduct
);

router.post(
  "/products",
  protect,
  isAdmin,
  upload.single("image"),
   uploadProductImage 
);



export default router;
