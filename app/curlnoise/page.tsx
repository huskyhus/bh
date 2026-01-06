"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { curlNoise } from "@/app/curlnoise/noise";

const COUNT = 1000;
const NOISE_SCALE = 0.1;
const FLOW_STRENGTH = 0.1;
const DAMPING = 0.9999;
const TIME_SCALE = 0.4;

export default function Page() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1020);

    const camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(12, 12, 12);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      velocities[i * 3 + 0] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.07,
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let time = 0;
    let last = performance.now();

    function animate(now: number) {
      const deltaTime = (now - last) * 0.001;
      last = now;

      time += deltaTime * TIME_SCALE;

      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;

        const px = positions[ix];
        const py = positions[ix + 1];
        const pz = positions[ix + 2];

        const curl = curlNoise(
          px * NOISE_SCALE,
          py * NOISE_SCALE,
          pz * NOISE_SCALE,
          time
        );

        velocities[ix] += curl.x * FLOW_STRENGTH;
        velocities[ix + 1] += curl.y * FLOW_STRENGTH;
        velocities[ix + 2] += curl.z * FLOW_STRENGTH;

        velocities[ix] *= DAMPING;
        velocities[ix + 1] *= DAMPING;
        velocities[ix + 2] *= DAMPING;

        positions[ix] += velocities[ix];
        positions[ix + 1] += velocities[ix + 1];
        positions[ix + 2] += velocities[ix + 2];

        positions[ix] %= 20;
        positions[ix + 1] %= 20;
        positions[ix + 2] %= 20;
      }

      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
      }}
    />
  );
}
