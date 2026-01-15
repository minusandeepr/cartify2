
import Product from '../models/product.model.js';

// GET /api/products
export async function listProducts(req, res) {
  try {
    const { page = 1, limit = 20, q, category } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (category) filter.category = category;

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const items = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await Product.countDocuments(filter);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/products/:id
export async function getProduct(req, res) {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/products
export async function createProduct(req, res) {
  try {
    const payload = req.body;
    // basic payload validation
    if (!payload.name || payload.price == null) return res.status(400).json({ message: 'name and price required' });
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res) {
  try {
    const removed = await Product.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function uploadProductImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const protocol = req.protocol;
    const host = req.get("host");
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;

  
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $push: { images: { key: req.file.filename, url } },
        $set: { image: url }           
      },
      { new: true, runValidators: false }
    );

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({
      message: "Image uploaded",
      image: { key: req.file.filename, url },
      product: updated
    });

  } catch (err) {
    console.error("uploadProductImage error:", err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
}
