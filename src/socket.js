import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Order from "./models/order.model.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;

    // 🔐 Verify JWT
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
      } catch {
        socket.userId = null;
      }
    } else {
      socket.userId = null;
    }

    console.log("Socket connected:", socket.userId || "Guest");

    socket.emit("bot-message", "Hi 👋 How can I help you?");

    socket.on("user-message", async (msg) => {
      try {
        const text = msg.toLowerCase();

        // 👋 Greetings
        if (text.includes("hi") || text.includes("hello")) {
          socket.emit("bot-message", "Hello 👋 How can I help you?");
          return;
        }

        // 🧾 Create account
        if (text.includes("create") && text.includes("account")) {
          socket.emit(
            "bot-message",
            "🧾 You can create an account from the Register page."
          );
          return;
        }

        // 📦 Last order
        if (text.includes("last order")) {
          if (!socket.userId) {
            socket.emit(
              "bot-message",
              "🔒 Please log in to view your orders."
            );
            return;
          }

          const order = await Order.findOne({ user: socket.userId })
            .sort({ createdAt: -1 });

          if (!order) {
            socket.emit("bot-message", "📦 You have no orders yet.");
          } else {
            socket.emit(
              "bot-message",
              `🧾 Your last order total is ₹${order.totalAmount} (${order.status})`
            );
          }
          return;
        }

        // 📊 Total orders
        if (
          text.includes("total orders") ||
          text.includes("my total orders") ||
          text.includes("orders count") ||
          text === "my orders"
        ) {
          if (!socket.userId) {
            socket.emit(
              "bot-message",
              "🔒 Please log in to view your orders."
            );
            return;
          }

          const count = await Order.countDocuments({
            user: socket.userId,
          });

          socket.emit(
            "bot-message",
            `📊 You have placed ${count} orders so far.`
          );
          return;
        }
// 🟢 Pending / ✅ Delivered / ❌ Cancelled orders
if (
  text.includes("pending orders") ||
  text.includes("delivered orders") ||
  text.includes("cancelled orders")
) {
  if (!socket.userId) {
    socket.emit(
      "bot-message",
      "🔒 Please log in to view your order details."
    );
    return;
  }

  let count = 0;
  let emoji = "";

  // 🟢 PENDING = anything NOT delivered or cancelled
  if (text.includes("pending")) {
    count = await Order.countDocuments({
      user: socket.userId,
      status: { $nin: ["Delivered", "Cancelled"] },
    });
    emoji = "🟢";
    socket.emit(
      "bot-message",
      `${emoji} You have ${count} pending orders.`
    );
    return;
  }

  // ✅ DELIVERED
  if (text.includes("delivered")) {
    count = await Order.countDocuments({
      user: socket.userId,
      status: { $regex: /^delivered$/i },
    });
    emoji = "✅";
    socket.emit(
      "bot-message",
      `${emoji} You have ${count} delivered orders.`
    );
    return;
  }

  // ❌ CANCELLED
  if (text.includes("cancelled")) {
    count = await Order.countDocuments({
      user: socket.userId,
      status: { $regex: /^cancelled$/i },
    });
    emoji = "❌";
    socket.emit(
      "bot-message",
      `${emoji} You have ${count} cancelled orders.`
    );
    return;
  }
}


        // ❓ Fallback
        socket.emit("bot-message", "❓ I didn’t understand that.");
      } catch (err) {
        console.error("Chatbot error:", err);
        socket.emit(
          "bot-message",
          "⚠️ Something went wrong. Please try again."
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
