import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

export default function ScanPage() {
  const containerRef = useRef(null);
  const mindarRef = useRef(null);

  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [targetFound, setTargetFound] = useState(false);

  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    try {
      const { data } = await axios.get("/markers");
      setMarkers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!markers.length) return;

    let mindarThree;

    const startAR = async () => {
      mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: "/targets/targets.mind",
        uiLoading: "no",
        uiScanning: "no",
      });

      mindarRef.current = mindarThree;

      const { renderer, scene, camera } = mindarThree;

      // 🔥 Performance Optimization
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

      markers.forEach((marker, index) => {
        const anchor = mindarThree.addAnchor(index);

        const video = document.createElement("video");
        video.src = marker.videoUrl;
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.setAttribute("muted", "");
        video.setAttribute("autoplay", "");
        video.load();

        const texture = new THREE.VideoTexture(video);
        texture.encoding = THREE.sRGBEncoding;

        const geometry = new THREE.PlaneGeometry(1, 0.6);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
          toneMapped: false,
        });

        const plane = new THREE.Mesh(geometry, material);
        anchor.group.add(plane);

        anchor.onTargetFound = async () => {
          setTargetFound(true);
          await video.play();

          // Smooth fade-in
          let opacity = 0;
          const fadeIn = setInterval(() => {
            opacity += 0.05;
            material.opacity = opacity;
            if (opacity >= 1) clearInterval(fadeIn);
          }, 30);
        };

        anchor.onTargetLost = () => {
          setTargetFound(false);
          video.pause();
          material.opacity = 0;
        };
      });

      await mindarThree.start();
      setLoading(false);
      setCameraReady(true);

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    };

    startAR();

    return () => {
      if (mindarRef.current) {
        mindarRef.current.stop();
        mindarRef.current.renderer.dispose();
      }
    };
  }, [markers]);

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-transparent">
      {/* 🔥 AR Canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* 🔥 Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-semibold tracking-wide">
            Preparing AR Experience
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Allow camera access to continue
          </p>
        </div>
      )}

      {/* 🔥 Scan Guide */}
      {!targetFound && cameraReady && !loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="relative w-72 h-72 border-2 border-white/40 rounded-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 animate-pulse" />
            <p className="absolute -bottom-12 w-full text-center text-white text-sm">
              Align image inside frame
            </p>
          </div>
        </div>
      )}

      {/* 🔥 Target Found Feedback */}
      {targetFound && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-500/80 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm shadow-lg transition-all duration-300">
            Image Detected ✔
          </div>
        </div>
      )}
    </div>
  );
}
