
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";


const formatCartResponse = (cart) => {
  if (!cart) return { items: [], totalPrice: 0 };

  const items = cart.items.map((item) => {
    const product = item.product;

    // product may NOT be populated
    if (!product || !product._id) {
      return {
        productId: item.product,
        name: "Product unavailable",
        price: item.price || 0,
        quantity: item.quantity,
        image: "",
        subtotal: (item.price || 0) * item.quantity,
      };
    }

    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image:
        product.images?.length > 0
          ? product.images[0].url
          : "",
      subtotal: product.price * item.quantity,
    };
  });

  const totalPrice = items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  return { items, totalPrice };
};

/*GET CART */
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images"
    );

    if (!cart) {
      return res.json({ items: [], totalPrice: 0 });
    }

    return res.json(formatCartResponse(cart));
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Failed to load cart" });
  }
};


/*ADD TO CART  */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity, price: product.price }],
      });
    } else {
      const idx = cart.items.findIndex(
        (i) => i.product.toString() === productId
      );

      if (idx >= 0) {
        cart.items[idx].quantity += quantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
        });
      }
    }

    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images"
    );

    return res.json(formatCartResponse(populated));
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

/* UPDATE CART ITEM */
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const idx = cart.items.findIndex(
      (i) => i.product.toString() === productId
    );

    if (idx === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images"
    );

    return res.json(formatCartResponse(populated));
  } catch (err) {
    console.error("updateCartItem error:", err);
    res.status(500).json({ message: "Failed to update cart" });
  }
};

/* REMOVE ITEM */
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );

    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images"
    );

    return res.json(formatCartResponse(populated));
  } catch (err) {
    console.error("removeCartItem error:", err);
    res.status(500).json({ message: "Failed to remove item" });
  }
};

/* CLEAR CART */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.json({ items: [], totalPrice: 0 });
  } catch (err) {
    console.error("clearCart error:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
