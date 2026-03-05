import { useEffect, useState, useRef } from "react";
import axios from "../api/axios";

export default function ARCamera() {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [targetFound, setTargetFound] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const sceneRef = useRef(null);
  const videoRefs = useRef({});
  const userInteracted = useRef(false);
  const activeTargetIndex = useRef(null);

  // Fetch markers
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

  // Check camera permission
  useEffect(() => {
    const checkCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
        setCameraPermission(true);
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        setCameraPermission(false);
        setLoading(false);
      }
    };
    checkCamera();
  }, []);

  // Handle user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      userInteracted.current = true;
      // Try to play any pending videos
      if (targetFound && activeTargetIndex.current !== null) {
        const video = videoRefs.current[`video-${activeTargetIndex.current}`];
        if (video) {
          playVideo(video);
        }
      }
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, [targetFound]);

  // Play video function
  const playVideo = async (videoElement) => {
    if (!videoElement) return;

    try {
      videoElement.currentTime = 0;

      if (userInteracted.current) {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setVideoPlaying(true);
              console.log("Video started playing");
            })
            .catch((err) => {
              console.log("Video play error:", err);
              setVideoPlaying(false);
            });
        }
      } else {
        console.log("Waiting for user interaction");
        setCurrentVideo(videoElement);
      }
    } catch (err) {
      console.log("Video play error:", err);
      setCurrentVideo(videoElement);
    }
  };

  // Pause video
  const pauseVideo = (videoElement) => {
    if (!videoElement) return;
    videoElement.pause();
    setVideoPlaying(false);
  };

  // Initialize videos
  useEffect(() => {
    if (markers.length > 0) {
      markers.forEach((_, index) => {
        const videoId = `video-${index}`;
        const videoEl = document.getElementById(videoId);
        if (videoEl) {
          videoRefs.current[videoId] = videoEl;

          videoEl.addEventListener("loadeddata", () => {
            console.log(`Video ${index} loaded`);
          });

          videoEl.addEventListener("error", (e) => {
            console.log(`Video ${index} error:`, e);
          });
        }
      });
    }
  }, [markers]);

  // Disable touch zoom
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventGesture = (e) => {
      e.preventDefault();
    };

    document.addEventListener("touchmove", preventZoom, { passive: false });
    document.addEventListener("gesturestart", preventGesture);
    document.addEventListener("gesturechange", preventGesture);
    document.addEventListener("gestureend", preventGesture);
    document.addEventListener(
      "wheel",
      (e) => {
        if (e.ctrlKey) {
          e.preventDefault();
        }
      },
      { passive: false },
    );

    document.addEventListener("keydown", (e) => {
      if (
        e.ctrlKey &&
        (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "_")
      ) {
        e.preventDefault();
      }
    });

    return () => {
      document.removeEventListener("touchmove", preventZoom);
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
    };
  }, []);

  // Camera + Target Events - FIXED VERSION
  useEffect(() => {
    const sceneEl = sceneRef.current;
    if (!sceneEl) return;

    const handleReady = () => {
      setCameraReady(true);
      setLoading(false);

      const video = document.querySelector("video");
      if (video) {
        video.style.objectFit = "cover";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.position = "fixed";
        video.style.top = "0";
        video.style.left = "0";
        video.style.zIndex = "1";
      }
    };

    const handleFound = (event) => {
      // Safely get target index from event
      let targetIndex = null;

      // Check different possible event structures
      if (event && event.detail) {
        targetIndex = event.detail.targetIndex;
      } else if (
        event &&
        typeof event === "object" &&
        event.targetIndex !== undefined
      ) {
        targetIndex = event.targetIndex;
      } else if (
        event &&
        event.srcElement &&
        event.srcElement.targetIndex !== undefined
      ) {
        targetIndex = event.srcElement.targetIndex;
      }

      // If we have a valid target index
      if (targetIndex !== null && targetIndex !== undefined) {
        console.log("Target found:", targetIndex);
        setTargetFound(true);
        activeTargetIndex.current = targetIndex;

        const video = videoRefs.current[`video-${targetIndex}`];
        if (video) {
          console.log("Attempting to play video for target:", targetIndex);
          playVideo(video);
        }
      } else {
        console.log("Target found but no index available", event);
        setTargetFound(true);
      }
    };

    const handleLost = (event) => {
      // Safely get target index from event
      let targetIndex = null;

      // Check different possible event structures
      if (event && event.detail) {
        targetIndex = event.detail.targetIndex;
      } else if (
        event &&
        typeof event === "object" &&
        event.targetIndex !== undefined
      ) {
        targetIndex = event.targetIndex;
      } else if (
        event &&
        event.srcElement &&
        event.srcElement.targetIndex !== undefined
      ) {
        targetIndex = event.srcElement.targetIndex;
      }

      console.log("Target lost, index:", targetIndex);
      setTargetFound(false);
      setVideoPlaying(false);

      // Pause video for the specific target
      if (targetIndex !== null && targetIndex !== undefined) {
        const video = videoRefs.current[`video-${targetIndex}`];
        if (video) {
          pauseVideo(video);
        }
      } else {
        // If no specific index, pause all videos
        Object.values(videoRefs.current).forEach((video) => {
          if (video) pauseVideo(video);
        });
      }

      activeTargetIndex.current = null;
    };

    // Add event listeners with proper error handling
    try {
      sceneEl.addEventListener("renderstart", handleReady);
      sceneEl.addEventListener("targetFound", handleFound);
      sceneEl.addEventListener("targetLost", handleLost);
    } catch (err) {
      console.log("Error adding event listeners:", err);
    }

    return () => {
      try {
        sceneEl.removeEventListener("renderstart", handleReady);
        sceneEl.removeEventListener("targetFound", handleFound);
        sceneEl.removeEventListener("targetLost", handleLost);
      } catch (err) {
        console.log("Error removing event listeners:", err);
      }
    };
  }, [markers]);

  // Camera permission denied
  if (cameraPermission === false) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4 z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Camera Access Required
          </h2>
          <p className="text-gray-300 mb-6">
            Please allow camera access to scan AR markers and view videos.
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
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* A-Frame Scene */}
      <a-scene
        ref={sceneRef}
        mindar-image="imageTargetSrc: /targets/targets.mind; autoStart: true; filterMinCF: 0.0001; filterBeta: 0.001;"
        color-space="sRGB"
        embedded
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        loading-screen="enabled: false"
        renderer="colorManagement: true; antialias: true; precision: high;"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 10,
          touchAction: "none",
        }}
      >
        {/* Assets */}
        <a-assets>
          {markers.map((marker, index) => (
            <video
              key={marker._id}
              id={`video-${index}`}
              src={marker.videoUrl}
              preload="auto"
              loop
              muted={false}
              playsInline
              webkit-playsinline="true"
              crossOrigin="anonymous"
              style={{ display: "none" }}
            />
          ))}
        </a-assets>

        {/* Markers with videos */}
        {markers.map((marker, index) => (
          <a-entity
            key={marker._id}
            mindar-image-target={`targetIndex: ${index}`}
          >
            <a-video
              src={`#video-${index}`}
              width={window.innerWidth < 768 ? "1.2" : "1.8"}
              height={window.innerWidth < 768 ? "0.8" : "1.2"}
              position="0 0 0"
              rotation="0 0 0"
              material="transparent: true; opacity: 1; side: double;"
              autoplay={false}
            />
          </a-entity>
        ))}

        {/* Camera */}
        <a-camera
          position="0 0 0"
          look-controls="enabled: false"
          wasd-controls="enabled: false"
          cursor="visible: false"
        />
      </a-scene>

      {/* Loading Screen */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
          <div className="text-center px-4">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-purple-400/20 rounded-full animate-ping"></div>
            </div>

            <h2 className="text-xl md:text-2xl font-semibold tracking-wide">
              Preparing AR Experience
            </h2>
            <p className="text-sm md:text-base text-gray-400 mt-3 max-w-xs mx-auto">
              {cameraPermission === null
                ? "Requesting camera access..."
                : "Loading markers and videos..."}
            </p>

            <div className="w-48 md:w-64 h-1 bg-gray-800 rounded-full mt-6 mx-auto overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      {/* Scan Instruction Overlay */}
      {!targetFound && cameraReady && !loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            <div
              className="relative 
                        w-[280px] sm:w-[320px] md:w-[400px]
                        h-[280px] sm:h-[320px] md:h-[400px]
                        border-2 border-white/30 
                        rounded-2xl sm:rounded-3xl
                        shadow-2xl
                        flex items-center justify-center
                        backdrop-blur-sm"
            >
              <div className="absolute w-1 h-1 bg-purple-500/50 rounded-full" />

              <div
                className="absolute left-0 w-full h-[2px] 
                            bg-gradient-to-r from-transparent via-purple-500 to-transparent
                            animate-scan"
              />

              <div className="absolute top-0 left-0 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-t-2 sm:border-t-4 border-l-2 sm:border-l-4 border-purple-500 rounded-tl-lg sm:rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-t-2 sm:border-t-4 border-r-2 sm:border-r-4 border-purple-500 rounded-tr-lg sm:rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-b-2 sm:border-b-4 border-l-2 sm:border-l-4 border-purple-500 rounded-bl-lg sm:rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 border-b-2 sm:border-b-4 border-r-2 sm:border-r-4 border-purple-500 rounded-br-lg sm:rounded-br-xl" />
            </div>

            <div className="absolute bottom-[15%] left-0 right-0 text-center">
              <p className="text-white/90 text-xs sm:text-sm md:text-base font-medium px-4">
                Align image inside the frame
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Target Found Feedback */}
      {targetFound && (
        <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-full px-4">
          <div className="max-w-xs sm:max-w-sm mx-auto">
            <div className="bg-green-500/90 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 animate-bounce">
              <span className="text-lg sm:text-xl">🎯</span>
              <span className="font-medium">Image Detected!</span>
              <span className="text-lg sm:text-xl">✨</span>
            </div>

            {currentVideo && (
              <div className="mt-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white/90 text-xs sm:text-sm text-center">
                {videoPlaying
                  ? "▶️ Playing video..."
                  : userInteracted.current
                    ? "⏸️ Video paused"
                    : "👆 Tap screen to play video"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Interaction Prompt */}
      {!userInteracted.current && cameraReady && !loading && !targetFound && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-purple-600/90 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm shadow-lg animate-pulse">
            👆 Tap screen to enable video sound
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="fixed top-4 left-4 z-50 
                   bg-black/50 backdrop-blur-md 
                   text-white px-3 py-2 sm:px-4 sm:py-3 
                   rounded-full text-sm sm:text-base 
                   hover:bg-black/70 transition-all
                   flex items-center gap-1 sm:gap-2
                   border border-white/20
                   focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-label="Go back"
      >
        <span className="text-lg sm:text-xl">←</span>
        <span className="hidden xs:inline">Back</span>
      </button>

      {/* Camera Status */}
      {cameraReady && !loading && (
        <div
          className="fixed bottom-4 right-4 z-50 
                        bg-black/50 backdrop-blur-md 
                        text-white px-3 py-1.5 sm:px-4 sm:py-2 
                        rounded-full text-xs sm:text-sm
                        border border-green-500/50
                        flex items-center gap-2"
        >
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
