import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

export default function ScanPage() {
  const containerRef = useRef(null);
  const mindarRef = useRef(null);
  const videoRef = useRef(null);

  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [targetFound, setTargetFound] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);

  // 🔥 Fetch Markers
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

  // 🔥 Check Camera Permission
  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        setCameraPermission(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        setCameraPermission(false);
        setLoading(false);
      }
    };
    checkCameraPermission();
  }, []);

  // 🔥 Start AR
  useEffect(() => {
    if (!markers.length || !cameraPermission) return;

    let mindarThree;

    const startAR = async () => {
      try {
        mindarThree = new MindARThree({
          container: containerRef.current,
          imageTargetSrc: "/targets/targets.mind",
          uiLoading: "no",
          uiScanning: "no",
          uiError: "no",
          maxTrack: 1,
          filterMinCF: 0.001,
          filterBeta: 0.001,
        });

        mindarRef.current = mindarThree;

        const { renderer, scene, camera } = mindarThree;

        // 🔥 Fix camera video positioning
        const video = document.querySelector('video');
        if (video) {
          videoRef.current = video;
          video.style.objectFit = 'cover';
          video.style.width = '100%';
          video.style.height = '100%';
          video.style.position = 'absolute';
          video.style.top = '0';
          video.style.left = '0';
          video.style.right = '0';
          video.style.bottom = '0';
          video.style.transform = 'scaleX(-1)'; // Mirror for selfie view if needed
        }

        // Set camera properties
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();

        // Performance Optimization
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        markers.forEach((marker, index) => {
          const anchor = mindarThree.addAnchor(index);

          const videoElement = document.createElement("video");
          videoElement.src = marker.videoUrl;
          videoElement.crossOrigin = "anonymous";
          videoElement.loop = true;
          videoElement.muted = true;
          videoElement.playsInline = true;
          videoElement.autoplay = true;
          videoElement.preload = "auto";

          videoElement.setAttribute("playsinline", "");
          videoElement.setAttribute("webkit-playsinline", "");
          videoElement.setAttribute("muted", "");
          videoElement.setAttribute("autoplay", "");
          videoElement.setAttribute("preload", "auto");
          videoElement.load();

          const texture = new THREE.VideoTexture(videoElement);
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.format = THREE.RGBAFormat;

          // Responsive video plane size
          const isMobile = window.innerWidth < 768;
          const planeWidth = isMobile ? 0.9 : 1.2;
          const planeHeight = isMobile ? 0.6 : 0.8;

          const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
          });

          const plane = new THREE.Mesh(geometry, material);
          plane.position.set(0, 0, 0);
          anchor.group.add(plane);

          anchor.onTargetFound = async () => {
            setTargetFound(true);
            try {
              videoElement.currentTime = 0;
              await videoElement.play();
              
              // Smooth Fade In
              let opacity = 0;
              const fade = setInterval(() => {
                opacity += 0.05;
                material.opacity = Math.min(opacity, 1);
                if (opacity >= 1) clearInterval(fade);
              }, 30);
            } catch (e) {
              console.log("Video play error:", e);
            }
          };

          anchor.onTargetLost = () => {
            setTargetFound(false);
            videoElement.pause();
            material.opacity = 0;
          };
        });

        await mindarThree.start();
        
        // 🔥 Force video element to center
        setTimeout(() => {
          const videoElement = document.querySelector('video');
          if (videoElement) {
            videoElement.style.position = 'absolute';
            videoElement.style.top = '50%';
            videoElement.style.left = '50%';
            videoElement.style.transform = 'translate(-50%, -50%) scaleX(-1)';
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'cover';
            videoElement.style.minWidth = '100%';
            videoElement.style.minHeight = '100%';
          }
        }, 100);

        setLoading(false);
        setCameraReady(true);

        renderer.setAnimationLoop(() => {
          camera.updateMatrixWorld();
          renderer.render(scene, camera);
        });

      } catch (error) {
        console.error("AR start error:", error);
        setLoading(false);
      }
    };

    startAR();

    return () => {
      if (mindarRef.current) {
        mindarRef.current.stop();
        if (mindarRef.current.renderer) {
          mindarRef.current.renderer.dispose();
        }
      }
    };
  }, [markers, cameraPermission]);

  // 🔥 Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (mindarRef.current) {
        const { renderer, camera } = mindarRef.current;
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }

      // Re-center video
      const videoElement = document.querySelector('video');
      if (videoElement) {
        videoElement.style.position = 'absolute';
        videoElement.style.top = '50%';
        videoElement.style.left = '50%';
        videoElement.style.transform = 'translate(-50%, -50%) scaleX(-1)';
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Camera Permission Denied
  if (cameraPermission === false) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-2xl font-bold text-white mb-4">Camera Access Required</h2>
          <p className="text-gray-300 mb-6">
            Please allow camera access to use AR features.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-transparent">
      {/* AR Canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading Screen */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
          <div className="relative">
            <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
            <div className="absolute inset-0 w-16 h-16 md:w-20 md:h-20 border-4 border-purple-500/30 rounded-full animate-ping" />
          </div>
          
          <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-center">
            Preparing AR Experience
          </h2>
          
          <p className="text-sm md:text-base text-gray-400 mt-3 text-center max-w-xs">
            {cameraPermission === null 
              ? "Requesting camera access..."
              : "Loading markers and videos..."}
          </p>
        </div>
      )}

      {/* 🔥 Scan Guide Overlay - Perfectly Centered */}
      {!targetFound && cameraReady && !loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Scanning Frame */}
            <div
              className="relative 
                        w-[280px] sm:w-[320px] md:w-[400px]
                        h-[280px] sm:h-[320px] md:h-[400px]
                        border-2 border-white/30 
                        rounded-2xl sm:rounded-3xl
                        shadow-2xl
                        flex items-center justify-center"
            >
              {/* Center Guide Dot (Hidden) */}
              <div className="absolute w-1 h-1 bg-purple-500/50 rounded-full" />
              
              {/* Animated Scan Line */}
              <div
                className="absolute left-0 w-full h-[2px] 
                            bg-gradient-to-r from-transparent via-purple-500 to-transparent
                            animate-scan"
              />

              {/* Corner Decorations */}
              <div className="absolute top-0 left-0 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-purple-500 rounded-tl-lg sm:rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-purple-500 rounded-tr-lg sm:rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-purple-500 rounded-bl-lg sm:rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-purple-500 rounded-br-lg sm:rounded-br-xl" />
            </div>

            {/* Instruction Text */}
            <div className="absolute bottom-[15%] left-0 right-0 text-center">
              <p className="text-white/90 text-xs sm:text-sm md:text-base font-medium px-4">
                Align image inside the frame
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Target Found Notification */}
      {targetFound && (
        <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-full px-4">
          <div className="max-w-xs sm:max-w-sm mx-auto">
            <div className="bg-green-500/90 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 animate-bounce">
              <span className="text-lg sm:text-xl">🎯</span>
              <span className="font-medium">Image Detected!</span>
              <span className="text-lg sm:text-xl">✨</span>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 z-50 
                   bg-black/50 backdrop-blur-md 
                   text-white px-3 py-2 sm:px-4 sm:py-3 
                   rounded-full text-sm sm:text-base 
                   hover:bg-black/70 transition-all
                   flex items-center gap-1 sm:gap-2
                   border border-white/20"
      >
        <span className="text-lg sm:text-xl">←</span>
        <span className="hidden xs:inline">Back</span>
      </button>

      {/* Camera Status */}
      {cameraReady && !loading && (
        <div className="absolute bottom-4 right-4 z-50 
                        bg-black/50 backdrop-blur-md 
                        text-white px-3 py-1.5 sm:px-4 sm:py-2 
                        rounded-full text-xs sm:text-sm
                        border border-green-500/50
                        flex items-center gap-2">
          <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-green-500"></span>
          </span>
          <span className="hidden xs:inline">Camera Ready</span>
        </div>
      )}
    </div>
  );
}