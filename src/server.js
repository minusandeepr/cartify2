// src/server.js
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app.js";
import http from "http";
import { initSocket } from "./socket.js";
import adminRoutes from "./routes/admin.routes.js";

const PORT = process.env.PORT || 5000;


const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  "mongodb://127.0.0.1:27017/cartify"; 

async function start() {
  try {
    if (!MONGO_URI) {
      throw new Error("No MongoDB URI found in environment variables");
    }

    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
    const server = http.createServer(app);
    initSocket(server);

    //app.listen(PORT, () => {
     // console.log(`Server listening on port ${PORT}`);
     server.listen(PORT, () => {
      console.log(`Server + Socket running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}
app.use("/api/admin", adminRoutes);

start();


