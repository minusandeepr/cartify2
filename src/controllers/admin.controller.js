// src/controllers/admin.controller.js
import Product from "../models/product.model.js";
import AdminAction from "../models/adminAction.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";


export async function listProducts(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const createProduct = async (req, res) => {
  try {
    

    if (!req.body || !req.file) {
      return res.status(400).json({
        message: "Form data or image missing",
      });
    }

    const { name, price, category, description, stock } = req.body;

    let categoryId = category;

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(category);

    if (!isValidObjectId) {
      const Category = (await import("../models/category.model.js")).default;
      const categoryDoc = await Category.findOne({ name: category });

      if (!categoryDoc) {
        return res.status(400).json({
          message: `Category "${category}" not found. Please select a valid category.`,
        });
      }

      categoryId = categoryDoc._id;
    }

    
    const product = await Product.create({
  name,
  price,
  category: categoryId,
  description,
  stock,
  images: [
    {
      key: req.file.filename,
      url: `/uploads/${req.file.filename}`
    }
  ],
});


    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      message: "Create product failed",
      error: error.message
    });
  }
};


/* Get */
export async function getProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export async function updateProduct(req, res) {
  try {
    const updateData = { ...req.body };

    
    if (req.file) {
      updateData.images = [
        {
          key: req.file.filename,
          url: `/uploads/${req.file.filename}`
        }
      ];
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


/* Delete */
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    await AdminAction.create({
      admin: req.user.id,
      action: "delete_product",
      resourceId: product._id,
      details: { name: product.name }
    });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
/**
 * GET /api/admin/orders
 * Admin: get all orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "username email");


    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/admin/orders/:id
 */
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/admin/orders/:id/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({
      status: "Pending",
    });

    const revenueAgg = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getRevenueChart = async (req, res) => {
  try {
    const revenue = await Order.aggregate([
      {
        $match: { status: { $ne: "Cancelled" } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(
      revenue.map(item => ({
        date: item._id,
        revenue: item.total
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Failed to load revenue chart" });
  }
};

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = req.body.role;
  await user.save();

  res.json(user);
};
// PUT /api/admin/users/:id/block
export const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Prevent admin from blocking themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      message: "You cannot block yourself"
    });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    message: `User ${user.isActive ? "unblocked" : "blocked"} successfully`,
    user
  });
};


// DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};

