import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import authRoutes from "./routes/auth.routes.js";  
import adminRoutes from "./routes/admin.routes.js"; 
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js"; 
import wishlistRoutes from "./routes/wishlist.routes.js";

const app = express();
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/products", productRoutes);   
app.use("/api/cart", cartRoutes);
// admin routes 
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);  
app.use("/uploads", express.static("uploads"));




app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;
