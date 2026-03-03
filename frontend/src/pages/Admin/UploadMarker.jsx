import { useForm } from "react-hook-form";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function UploadMarker() {
  const { register, handleSubmit } = useForm();
  const { user } = useAuth();

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("markerImage", data.markerImage[0]);
    formData.append("video", data.video[0]);

    try {
      await api.post("/markers", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      alert("Marker uploaded!");
    } catch {
      alert("Upload failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Upload Marker</h2>
      <input placeholder="Title" {...register("title")} />
      <input type="file" {...register("markerImage")} />
      <input type="file" {...register("video")} />
      <button type="submit">Upload</button>
    </form>
  );
}