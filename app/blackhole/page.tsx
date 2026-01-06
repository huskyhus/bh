"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const COUNT = 1000;
const ATTRACTOR_STRENGTH = 0.01;
const DAMPING = 0.999999;
const SPIN = 0.0;

export default function Home() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(6, 6, 6);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const blackHole = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true })
    );
    scene.add(blackHole);

    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const px = (Math.random() - 0.5) * 10;
      const py = (Math.random() - 0.5) * 1;
      const pz = (Math.random() - 0.5) * 10;
      let vx = (Math.random() - 0.5) * 0.1;
      const vy = (Math.random() - 0.5) * 0.001;
      let vz = (Math.random() - 0.5) * 0.1;

      const angular = px * vz - pz * vx;
      if (angular < 0) {
        vx = -vx;
        vz = -vz;
      }

      positions[i * 3 + 0] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      velocities[i * 3 + 0] = vx;
      velocities[i * 3 + 1] = vy;
      velocities[i * 3 + 2] = vz;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.03,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const center = new THREE.Vector3(0, 0, 0);

    const animate = () => {
      blackHole.rotation.z += 0.005;

      for (let i = 0; i < COUNT; i++) {
        const ix = i * 3;

        const px = positions[ix];
        const py = positions[ix + 1];
        const pz = positions[ix + 2];

        const dx = center.x - px;
        const dy = center.y - py;
        const dz = center.z - pz;
        const r2 = dx * dx + dy * dy + dz * dz + 0.01;
        const invr = 1 / Math.sqrt(r2);
        const invr3 = invr * invr * invr;

        velocities[ix] += dx * ATTRACTOR_STRENGTH * invr3;
        velocities[ix + 1] += dy * ATTRACTOR_STRENGTH * invr3;
        velocities[ix + 2] += dz * ATTRACTOR_STRENGTH * invr3;

        velocities[ix] *= DAMPING;
        velocities[ix + 1] *= DAMPING;
        velocities[ix + 2] *= DAMPING;

        positions[ix] += velocities[ix];
        positions[ix + 1] += velocities[ix + 1];
        positions[ix + 2] += velocities[ix + 2];
      }

      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

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
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
}
