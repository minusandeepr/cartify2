// seedCategories.js - Seed initial categories
import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./src/models/category.model.js";

dotenv.config();

const categories = [
    { name: "Electronics" },
    { name: "Clothing" },
    { name: "Books" },
    { name: "Home & Kitchen" },
    { name: "Sports & Outdoors" },
    { name: "Toys & Games" },
    { name: "Health & Beauty" },
    { name: "Automotive" },
    { name: "Jewelry" },
    { name: "Food & Beverages" },
];

async function seedCategories() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");

        // Clear existing categories
        await Category.deleteMany({});
        console.log("Cleared existing categories");

        // Insert new categories
        const result = await Category.insertMany(categories);
        console.log(`✅ Successfully seeded ${result.length} categories`);

        result.forEach((cat) => {
            console.log(`  - ${cat.name} (ID: ${cat._id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
}

seedCategories();
