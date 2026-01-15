import express from "express";
import   protect  from "../middleware/auth.middleware.js";
import isAdmin   from "../middleware/isAdmin.middleware.js";
import adminLogger from "../middleware/adminLogger.middleware.js";
import  upload  from "../middleware/upload.js";


import {
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  getAdminStats,
  getRevenueChart,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect);

router.use(isAdmin);


router.use(adminLogger);
//router.get("/admin", protect, isAdmin, getAllOrders);

// Product management
router.get("/products", listProducts);
router.post("/products", createProduct);
router.get("/products/:id", getProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
// Orders management (ADMIN)
router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderByIdAdmin);
router.put("/orders/:id/status", updateOrderStatus);

router.post(
  "/products",
  protect,          
  isAdmin,         
  upload.single("image"), 
  createProduct
);
router.get("/dashboard", (req, res) => {
  res.json({ message: "Admin dashboard access granted" });
});
router.get("/stats", getAdminStats);
router.get("/revenue-chart", getRevenueChart);



export default router;
