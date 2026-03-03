import { useEffect, useState } from "react";
import axios from "../../api/axios";

export default function Dashboard() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    const { data } = await axios.get("/markers");
    setMarkers(data);
  };

  const deleteHandler = async (id) => {
    await axios.delete(`/markers/${id}`);
    fetchMarkers();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">All Markers</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {markers.map((marker) => (
          <div key={marker._id} className="bg-white shadow-md rounded-xl p-4">
            <img
              src={marker.markerImage}
              alt=""
              className="w-full h-40 object-cover rounded-lg mb-3"
            />

            <h3 className="font-semibold">{marker.title}</h3>

            <button
              onClick={() => deleteHandler(marker._id)}
              className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
