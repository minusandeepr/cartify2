import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    key: String,
    url: String
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    images: { type: [ImageSchema], default: [] },
    attributes: { type: mongoose.Schema.Types.Mixed },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Product', ProductSchema);
