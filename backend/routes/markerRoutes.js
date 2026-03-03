import express from "express";
import { createMarker, getMarkers, deleteMarker } from "../controllers/markerController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Upload marker (Admin only)
router.post(
  "/",
  protect,
  upload.fields([
    { name: "markerImage", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  createMarker
);

// Get all markers (public)
router.get("/", getMarkers);

// Delete marker
router.delete("/:id", protect, deleteMarker);

export default router;