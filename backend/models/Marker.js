import mongoose from "mongoose";

const markerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    markerImage: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    imagePublicId: String,
    videoPublicId: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Marker = mongoose.model("Marker", markerSchema);

export default Marker;
