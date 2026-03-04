import Marker from "../models/Marker.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// Helper function to upload buffer to cloudinary
const uploadToCloudinary = (fileBuffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation:
          resourceType === "video"
            ? [{ quality: "auto" }, { fetch_format: "mp4" }]
            : [],
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// CREATE MARKER
export const createMarker = async (req, res) => {
  try {
    const { title } = req.body;

    const markerImageFile = req.files["markerImage"][0];
    const videoFile = req.files["video"][0];

    // Upload image
    const imageUpload = await uploadToCloudinary(
      markerImageFile.buffer,
      "ar-markers",
      "image",
    );

    // Upload video (compressed automatically)
    const videoUpload = await uploadToCloudinary(
      videoFile.buffer,
      "ar-videos",
      "video",
    );

    const marker = await Marker.create({
      title,
      markerImage: imageUpload.secure_url,
      videoUrl: videoUpload.secure_url,
      imagePublicId: imageUpload.public_id,
      videoPublicId: videoUpload.public_id,
      createdBy: req.user?._id || null,
    });

    res.status(201).json(marker);
  } catch (error) {
    console.error("FULL ERROR:", error); // 👈 Add this
    res.status(500).json({
      message: "Marker upload failed",
      error: error.message,
      stack: error.stack,
    });
  }
};

// GET MARKERS
export const getMarkers = async (req, res) => {
  try {
    const markers = await Marker.find().sort({ createdAt: -1 });
    res.json(markers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch markers" });
  }
};

// DELETE MARKER
export const deleteMarker = async (req, res) => {
  try {
    const marker = await Marker.findById(req.params.id);

    if (!marker) {
      return res.status(404).json({ message: "Marker not found" });
    }

    // Delete media from Cloudinary
    await cloudinary.uploader.destroy(marker.imagePublicId);
    await cloudinary.uploader.destroy(marker.videoPublicId, {
      resource_type: "video",
    });

    await marker.deleteOne();

    res.json({ message: "Marker deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};
