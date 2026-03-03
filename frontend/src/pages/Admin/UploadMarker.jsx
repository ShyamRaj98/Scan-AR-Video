import { useState } from "react";
import axios from "../../api/axios";

export default function UploadMarker() {
  const [title, setTitle] = useState("");
  const [markerImage, setMarkerImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!markerImage || !video) {
      alert("Upload both image and video");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("markerImage", markerImage);
    formData.append("video", video);

    try {
      setLoading(true);

      await axios.post("/markers", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Uploaded Successfully");
      setTitle("");
      setMarkerImage(null);
      setVideo(null);
    } catch (error) {
      alert("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-xl rounded-xl p-8">
      <h2 className="text-2xl font-bold mb-6">Upload New Marker</h2>

      <form onSubmit={submitHandler} className="space-y-4">

        <input
          type="text"
          placeholder="Marker Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-3 rounded-lg"
          required
        />

        <div>
          <label className="block mb-1 font-medium">
            Marker Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMarkerImage(e.target.files[0])}
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            AR Video (Max 50MB)
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Uploading..." : "Upload Marker"}
        </button>
      </form>
    </div>
  );
}