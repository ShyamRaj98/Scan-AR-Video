import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ARCamera() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    try {
      const { data } = await api.get("/markers");
      setMarkers(data);
    } catch (error) {
      console.error("Failed to fetch markers");
    }
  };

  return (
    <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden"
    }}
  >
    <a-scene
      embedded
      vr-mode-ui="enabled: false"
      renderer="precision: mediump; antialias: true;"
      arjs="
        sourceType: webcam;
        debugUIEnabled: false;
      "
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0
      }}
    >
      <a-entity camera></a-entity>

      {markers.map((marker) => (
        <a-marker
          key={marker._id}
          type="pattern"
          url={`${import.meta.env.VITE_API_URL.replace(
            "/api",
            ""
          )}/${marker.patternFile}`}
          smooth="true"
          smoothCount="10"
          smoothTolerance="0.01"
          smoothThreshold="5"
        >
          <a-video
            src={`${import.meta.env.VITE_API_URL.replace(
              "/api",
              ""
            )}/${marker.videoUrl}`}
            width="2"
            height="1.2"
            position="0 0 0"
            rotation="-90 0 0"
            autoplay
            muted
            playsinline
            loop
          ></a-video>
        </a-marker>
      ))}
    </a-scene>
  </div>
  );
}