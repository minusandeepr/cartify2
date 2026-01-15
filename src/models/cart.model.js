import mongoose from 'mongoose';


const CartItemSchema = new mongoose.Schema({
product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
quantity: { type: Number, default: 1, min: 1 },
price: { type: Number, required: true }
}, { _id: false });


const CartSchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
items: { type: [CartItemSchema], default: [] },
totalPrice: { type: Number, default: 0 }
}, { timestamps: true });



CartSchema.pre('save', function (next) {
try {
this.totalPrice = this.items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
return next();
} catch (err) {
return next(err);
}
});


export default mongoose.model('Cart', CartSchema);