"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function SphereAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const clock = new THREE.Clock();

        /* -----------------------------
           1. 텍스트 텍스처 생성
        --------------------------------*/
        function generateTextTexture(text = "JIYU HAN") { // Used Jiyu Han as requested previously
            const size = 1024;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext("2d");
            if (!ctx) return null;

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, size, size);

            ctx.fillStyle = "white";
            ctx.font = "bold 120px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 4; x++) {
                    ctx.fillText(text, size / 4 * x + size / 8, size / 8 * y + size / 16);
                }
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            return texture;
        }

        /* -----------------------------
           2. 쉐이더
        --------------------------------*/
        const vertexShader = `
        varying vec2 vUv;
        uniform float uTime;

        void main() {
          vUv = uv;

          vec3 pos = position;

          // 약간의 파형 왜곡
          pos += normal * sin(uTime + position.y * 5.0) * 0.05;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
        `;

        const fragmentShader = `
        uniform sampler2D uTexture;
        uniform float uTime;
        varying vec2 vUv;

        float random(float x){
          return fract(sin(x)*43758.5453123);
        }

        void main() {

          vec2 uv = vUv;

          // 반복 배수
          uv *= 6.0;

          // 슬라이스 글리치
          float slice = step(0.5, random(floor(uv.y * 20.0) + floor(uTime * 8.0)));
          uv.x += slice * 0.08;

          vec4 color = texture2D(uTexture, fract(uv));

          gl_FragColor = color;
        }
        `;

        /* -----------------------------
           3. 구면 생성
        --------------------------------*/
        const geometry = new THREE.SphereGeometry(2, 128, 128);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uTexture: { value: generateTextTexture("JIYU HAN") }
            },
            vertexShader,
            fragmentShader
        });

        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        /* -----------------------------
           4. 애니메이션
        --------------------------------*/
        let animationId: number;
        function animate() {
            animationId = requestAnimationFrame(animate);

            const t = clock.getElapsedTime();

            material.uniforms.uTime.value = t;

            sphere.rotation.y += 0.003;
            sphere.rotation.x += 0.001;

            renderer.render(scene, camera);
        }

        animate();

        /* -----------------------------
           5. 반응형
        --------------------------------*/
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 bg-black pointer-events-none"
        />
    );
}
