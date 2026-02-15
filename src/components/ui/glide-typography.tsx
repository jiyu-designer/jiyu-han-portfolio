"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function GlideTypography() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = window.innerWidth;
        const height = 200; // Fixed height for the text band

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            width / -2, width / 2,
            height / 2, height / -2,
            0.1, 1000
        );
        camera.position.z = 10;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Create Text Texture
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const fontSize = 120;
        const text = "JIYU HAN";

        // Measure text for proper sizing
        if (ctx) {
            ctx.font = `bold ${fontSize}px Montserrat, Arial, sans-serif`;
            const metrics = ctx.measureText(text);
            canvas.width = metrics.width + 100;
            canvas.height = fontSize * 1.5;

            ctx.font = `bold ${fontSize}px Montserrat, Arial, sans-serif`;
            ctx.fillStyle = "white";
            ctx.textBaseline = "middle";
            ctx.fillText(text, 50, canvas.height / 2);
        }

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });

        const planeGeometry = new THREE.PlaneGeometry(canvas.width, canvas.height);
        const plane = new THREE.Mesh(planeGeometry, material);
        scene.add(plane);

        // Glide logic
        let animationId: number;
        let xPos = width / 2 + canvas.width / 2;

        function animate() {
            animationId = requestAnimationFrame(animate);

            xPos -= 2; // Speed

            // Loop around
            if (xPos < -(width / 2 + canvas.width / 2)) {
                xPos = width / 2 + canvas.width / 2;
            }

            plane.position.x = xPos;
            renderer.render(scene, camera);
        }

        animate();

        const handleResize = () => {
            const newWidth = window.innerWidth;
            renderer.setSize(newWidth, height);
            camera.left = newWidth / -2;
            camera.right = newWidth / 2;
            camera.updateProjectionMatrix();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationId);
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute top-1/2 left-0 w-full pointer-events-none z-20"
            style={{ height: '200px', transform: 'translateY(-50%)' }}
        />
    );
}
