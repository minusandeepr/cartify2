import Category from '../models/category.model.js';


export async function listCategories(req, res) {
const items = await Category.find().sort({ name: 1 });
res.json(items);
}


export async function getCategory(req, res) {
const c = await Category.findById(req.params.id);
if (!c) return res.status(404).json({ message: 'Category not found' });
res.json(c);
}


export async function createCategory(req, res) {
const { name, description } = req.body;
if (!name) return res.status(400).json({ message: 'name required' });
const existing = await Category.findOne({ name });
if (existing) return res.status(400).json({ message: 'Category exists' });
const cat = await Category.create({ name, description });
res.status(201).json(cat);
}


export async function updateCategory(req, res) {
const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
if (!updated) return res.status(404).json({ message: 'Category not found' });
res.json(updated);
}


export async function deleteCategory(req, res) {
await Category.findByIdAndDelete(req.params.id);
res.json({ success: true });
}