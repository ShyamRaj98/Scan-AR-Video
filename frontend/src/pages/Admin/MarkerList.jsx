import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function MarkerList() {
  const [markers, setMarkers] = useState([]);
  const { user } = useAuth();
  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    const { data } = await api.get("/markers");
    setMarkers(data);
  };

  const deleteMarker = async (id) => {
    await api.delete(`/markers/${id}`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });
    fetchMarkers();
  };

  return (
    <div>
      <h2>All Markers</h2>
      {markers.map((m) => (
        <div key={m._id}>
          <p>{m.title}</p>
          <button onClick={() => deleteMarker(m._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}