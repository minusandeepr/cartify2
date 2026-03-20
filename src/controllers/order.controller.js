import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";

/* =========================
   CREATE RAZORPAY ORDER
========================= */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (order.status === "Cancelled") {
  return res.status(400).json({
    message: "Cannot pay for a cancelled order",
  });
}

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
     if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: order.totalAmount * 100, // paise
      currency: "INR",
      receipt: `order_${order._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // save razorpay order id
    order.payment = {
  ...order.payment,
  razorpayOrderId: razorpayOrder.id,
};

    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create Razorpay Order Error:", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

/* =========================
   VERIFY PAYMENT
========================= */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.isPaid = true;
    order.status = "Paid";
    order.paidAt = new Date();

    await order.save();

    res.json({ message: "Payment verified successfully", order });
  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

/**
 * POST /api/orders
 * Create order from user's cart
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Get cart
    const cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "name price images"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

   /* const orderItems = cart.items.map((item) => ({
  productId: item.product._id, 
  name: item.product.name,
 image: item.product.images?.[0]?.url || "",
  price: item.product.price,
  quantity: item.quantity,
}));*/
const orderItems = cart.items.map((item) => ({
  product: item.product._id,
  name: item.product.name,
  image: item.product.images?.[0]?.url || "",
  price: item.product.price,
  quantity: item.quantity,
}));



    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 3️⃣ Create order
    const shippingAddress = req.body?.shippingAddress;

if (!shippingAddress) {
  return res.status(400).json({
    message: "Shipping address is required",
  });
}


    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
     shippingAddress,
      status: "Pending",
    });

    // 4️⃣ Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

/**
 * GET /api/orders/my
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


 /* GET /api/orders/:id */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

 /* PUT /api/orders/:id/cancel */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure user owns the order
    if (order.user.toString() !== req.user._id.toString() &&
  !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Only pending orders can be cancelled
    if (order.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};


// ADMIN: get all orders
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Admin orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

