import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

export default function ScanPage() {
  const containerRef = useRef(null);
  const mindarRef = useRef(null);

  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetFound, setTargetFound] = useState(false);

  // 🔥 Fetch markers
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const { data } = await axios.get("/markers");
        setMarkers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMarkers();
  }, []);

  // 🔥 Start AR
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

      // 🔥 CRITICAL: Proper WebGL sizing
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.top = "0";
      renderer.domElement.style.left = "0";

      // Camera aspect fix
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

      // 🔥 Resize Handler (Very Important)
      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      window.addEventListener("resize", handleResize);

      // 🔥 Add markers
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
        video.load();

        const texture = new THREE.VideoTexture(video);

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
          material.opacity = 1;
        };

        anchor.onTargetLost = () => {
          setTargetFound(false);
          video.pause();
          material.opacity = 0;
        };
      });

      await mindarThree.start();
      setLoading(false);

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
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* AR Container */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-50">
          Preparing Camera...
        </div>
      )}

      {/* Scan Frame */}
      {!targetFound && !loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[70vw] max-w-[320px] aspect-square border border-white/40 rounded-xl">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-purple-500 animate-scan" />
            <p className="absolute -bottom-8 w-full text-center text-white text-sm">
              Align image inside frame
            </p>
          </div>
        </div>
      )}
    </div>
  );
}