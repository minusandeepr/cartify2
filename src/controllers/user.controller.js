// src/controllers/user.controller.js
import User from "../models/user.model.js";
import path from "path";

/**
 * GET /api/users/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/users/me
 */
/*export const updateMe = async (req, res) => {
  try {
    // Accept name from either "name" or "username"
    const nameInput = req.body.name ?? req.body.username ?? "";
    const username = String(nameInput).trim();

    if (!username) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updates = { username };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("updateMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};*/
export const updateMe = async (req, res) => {
  try {
    const updates = {};

    if (req.body.name || req.body.username) {
      updates.username = String(req.body.name || req.body.username).trim();
    }

    if (req.body.shippingAddress) {
      updates.shippingAddress = req.body.shippingAddress;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("updateMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


/**
 * PUT /api/users/me/avatar
 */
export const updateMyAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No avatar file uploaded" });
    }

    const filename = req.file.filename || req.file.path?.split(path.sep).pop();
    const avatarUrl = `/uploads/${filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("updateMyAvatar error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------- ADMIN CONTROLLERS ---------- */

export const listUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json({ users });
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("getUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // security: block raw password change

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return res.status(400).json({
        message: "Cannot delete the last admin",
      });
    }
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
};
