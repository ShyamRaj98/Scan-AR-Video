import { useEffect, useState, useRef } from "react";
import axios from "../api/axios";

export default function ScanPage() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [targetFound, setTargetFound] = useState(false);
  const sceneRef = useRef(null);

  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    try {
      const { data } = await axios.get("/markers");
      setMarkers(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Camera + Target Events
  useEffect(() => {
    const sceneEl = sceneRef.current;
    if (!sceneEl) return;

    const handleReady = () => setCameraReady(true);
    const handleFound = (e) => {
      setTargetFound(true);
      const video = document.querySelector(`#video-${e.detail.targetIndex}`);
      video?.play();
    };
    const handleLost = (e) => {
      setTargetFound(false);
      const video = document.querySelector(`#video-${e.detail.targetIndex}`);
      video?.pause();
    };

    sceneEl.addEventListener("renderstart", handleReady);
    sceneEl.addEventListener("targetFound", handleFound);
    sceneEl.addEventListener("targetLost", handleLost);

    return () => {
      sceneEl.removeEventListener("renderstart", handleReady);
      sceneEl.removeEventListener("targetFound", handleFound);
      sceneEl.removeEventListener("targetLost", handleLost);
    };
  }, [markers]);

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden">

      {/* 🔥 Premium Loading Screen */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold tracking-wide">
              Preparing AR Experience
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Please allow camera access
            </p>
          </div>
        </div>
      )}

      {/* 🎯 Scan Instruction */}
      {!targetFound && cameraReady && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="relative w-72 h-72 border-2 border-white/40 rounded-2xl">

            {/* Moving Scan Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 animate-scan"></div>

            <p className="absolute -bottom-12 w-full text-center text-white text-sm">
              Align image inside frame
            </p>
          </div>
        </div>
      )}

      {/* ✅ Target Found Feedback */}
      {targetFound && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-500/80 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm shadow-lg">
            Image Detected ✔ Playing Video
          </div>
        </div>
      )}

      <a-scene
        ref={sceneRef}
        mindar-image="imageTargetSrc: /targets/targets.mind; autoStart: true;"
        color-space="sRGB"
        embedded
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: true"
      >
        <a-assets>
          {markers.map((marker, index) => (
            <video
              key={marker._id}
              id={`video-${index}`}
              src={marker.videoUrl}
              preload="metadata"
              loop
              muted
              playsInline
              crossOrigin="anonymous"
            />
          ))}
        </a-assets>

        {markers.map((marker, index) => (
          <a-entity
            key={marker._id}
            mindar-image-target={`targetIndex: ${index}`}
          >
            <a-video
              src={`#video-${index}`}
              width="1"
              height="0.6"
              position="0 0 0"
            />
          </a-entity>
        ))}

        <a-camera position="0 0 0" look-controls="enabled: false" />
      </a-scene>
    </div>
  );
}