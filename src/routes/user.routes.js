// src/routes/user.routes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import protect from "../middleware/auth.middleware.js";
import requireRole from "../middleware/role.middleware.js";
import {
  getMe,
  updateMe,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMyAvatar,
} from "../controllers/user.controller.js";

const router = express.Router();

// Multer setup for avatar uploads 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.use(protect);

// USER SELF ROUTE
router.get("/me", getMe);
router.put("/me", updateMe);

router.put("/me/avatar", upload.single("avatar"), updateMyAvatar);

// ADMIN ROUTES
router.use(requireRole("admin"));

router.get("/", listUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
