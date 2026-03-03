import Marker from "../models/Marker.js";

// Create Marker
export const createMarker = async (req, res) => {
  try {
    const { title } = req.body;

    const markerImage = req.files["markerImage"][0].path;
    const videoUrl = req.files["video"][0].path;

    const marker = await Marker.create({
      title,
      markerImage,
      videoUrl,
      createdBy: req.user._id
    });

    res.status(201).json(marker);
  } catch (error) {
    res.status(500).json({ message: "Marker upload failed" });
  }
};

// Get All Markers
export const getMarkers = async (req, res) => {
  try {
    const markers = await Marker.find().sort({ createdAt: -1 });
    res.json(markers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch markers" });
  }
};

// Delete Marker
export const deleteMarker = async (req, res) => {
  try {
    const marker = await Marker.findById(req.params.id);

    if (!marker) {
      return res.status(404).json({ message: "Marker not found" });
    }

    await marker.deleteOne();

    res.json({ message: "Marker deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};