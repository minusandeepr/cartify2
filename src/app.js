import express from "express";
import cors from "cors";
import fs from "fs";
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
app.use((req, res, next) => {
  const logMsg = `${new Date().toISOString()} - ${req.method} ${req.url} - Content-Type: ${req.headers['content-type']}`;
  fs.appendFileSync('request_debug.log', logMsg + '\n');
  next();
});

app.use(express.json({
  verify: (req, res, buf) => {
    try {
      if (req.headers['content-type']?.includes('application/json')) {
        JSON.parse(buf.toString());
      }
    } catch (e) {
      const errLog = `${new Date().toISOString()} - JSON Parse Error. Raw body: ${buf.toString().slice(0, 500)}`;
      fs.appendFileSync('request_debug.log', errLog + '\n');
    }
  }
}));

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

// Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parsing Error:', err.message);
    console.error('Malformed Body Content:', req.body); // This might be empty if parsing failed
    return res.status(400).json({ message: "Malformed JSON in request body" });
  }
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

export default app;
