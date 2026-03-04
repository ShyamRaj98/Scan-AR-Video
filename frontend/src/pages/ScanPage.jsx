import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import * as THREE from "three";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

export default function ScanPage() {
  const containerRef = useRef(null);
  const mindarRef = useRef(null);
  const [markers, setMarkers] = useState([]);

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
      });

      mindarRef.current = mindarThree;

      const { renderer, scene, camera } = mindarThree;

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

        const texture = new THREE.VideoTexture(video);

        const geometry = new THREE.PlaneGeometry(1, 0.6);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
        });

        const plane = new THREE.Mesh(geometry, material);
        anchor.group.add(plane);

        anchor.onTargetFound = () => {
          video.play();
        };

        anchor.onTargetLost = () => {
          video.pause();
        };
      });

      await mindarThree.start();

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
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
}