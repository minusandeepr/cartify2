
import mongoose from 'mongoose';

const AdminActionSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, 
  targetType: { type: String }, 
  targetId: { type: String }, 
  metadata: { type: mongoose.Schema.Types.Mixed }, 
  ip: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AdminAction', AdminActionSchema);
