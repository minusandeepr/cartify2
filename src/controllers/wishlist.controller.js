import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";

/**
 * GET /api/wishlist
 */
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
      "name price images"
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    res.json(wishlist);
  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

/**
 * POST /api/wishlist/:productId
 */
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      const exists = wishlist.products.includes(productId);

      if (exists) {
        wishlist.products.pull(productId);
      } else {
        wishlist.products.push(productId);
      }

      await wishlist.save();
    }

    const populated = await Wishlist.findById(wishlist._id).populate(
      "products",
      "name price images"
    );

    res.json(populated);
  } catch (err) {
    console.error("Toggle wishlist error:", err);
    res.status(500).json({ message: "Wishlist update failed" });
  }
};

/**
 * DELETE /api/wishlist/:productId
 */
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products.pull(productId);
    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id).populate(
      "products",
      "name price images"
    );

    res.json(populated);
  } catch (err) {
    console.error("Remove wishlist error:", err);
    res.status(500).json({ message: "Remove failed" });
  }
};
