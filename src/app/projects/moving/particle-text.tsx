
"use client";

import React, { useRef, useEffect } from "react";

export default function ParticleText() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        let particles: Particle[] = [];
        let isMobile = false;
        let animationFrameId: number;
        const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
        let mouse = { x: -1000, y: -1000, radius: isMobileViewport ? 220 : 150 };

        // Handle Resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        // Handle pointer (mouse + touch)
        const updatePointer = (clientX: number, clientY: number) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = clientX - rect.left;
            mouse.y = clientY - rect.top;
        };
        const handlePointerMove = (e: PointerEvent) => {
            updatePointer(e.clientX, e.clientY);
        };
        const handlePointerDown = (e: PointerEvent) => {
            updatePointer(e.clientX, e.clientY);
        };

        const handlePointerLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        }

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            baseX: number;
            baseY: number;
            size: number;
            density: number;
            color: string;
            friction: number;
            ease: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.vx = 0;
                this.vy = 0;
                this.baseX = x;
                this.baseY = y;
                this.size = isMobile ? 1.4 : 2;
                this.density = (Math.random() * 3) + 2;
                this.color = "white";
                this.friction = 0.9;
                this.ease = 0.035;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                // 1. Calculate interactions with Mouse
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let maxDistance = mouse.radius;

                // Repulsion
                if (distance > 0.001 && distance < maxDistance) {
                    // Smoother falloff near edge and less abrupt force on close contact
                    const force = Math.pow((maxDistance - distance) / maxDistance, 1.35);
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const repulsion = isMobile ? 0.55 : 0.75;

                    this.vx -= forceDirectionX * force * this.density * repulsion;
                    this.vy -= forceDirectionY * force * this.density * repulsion;
                }

                // 2. Spring back to original position
                // The particle wants to go to baseX, baseY
                let homeDx = this.baseX - this.x;
                let homeDy = this.baseY - this.y;

                // Hooke's Law: F = -k * x
                this.vx += homeDx * this.ease;
                this.vy += homeDy * this.ease;

                // 3. Apply Friction (Damping)
                this.vx *= this.friction;
                this.vy *= this.friction;

                // 3.5 Clamp speed to avoid sudden spikes
                const maxSpeed = isMobile ? 5 : 6;
                this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));
                this.vy = Math.max(-maxSpeed, Math.min(maxSpeed, this.vy));

                // 4. Update Position
                this.x += this.vx;
                this.y += this.vy;
            }
        }

        function init() {
            particles = [];
            if (!ctx || !canvas) return;

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            isMobile = window.matchMedia("(max-width: 768px)").matches;

            // Draw text to get pixel data
            ctx.fillStyle = "white";

            // Calculate font size to be 80% of screen width
            let fontSize = 100; // Start with a guess
            ctx.font = `900 ${fontSize}px Montserrat`;
            const text = "MOVING";
            const measurements = ctx.measureText(text);
            const targetWidth = isMobile ? canvas.height * 0.7 : canvas.width * 0.8;

            // Simple proportion: targetFontSize / currentFontSize = targetWidth / currentWidth
            fontSize = (targetWidth / measurements.width) * fontSize;

            // Cap the font size reasonably if needed, but aim for 80% width primarily
            ctx.font = `900 ${fontSize}px Montserrat`;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            if (isMobile) {
                ctx.rotate(Math.PI / 2);
            }
            ctx.fillText(text, 0, 0);
            ctx.restore();

            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const step = isMobile ? 2 : 4;
            for (let y = 0, y2 = textCoordinates.height; y < y2; y += step) {
                for (let x = 0, x2 = textCoordinates.width; x < x2; x += step) {
                    if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                        particles.push(new Particle(x, y));
                    }
                }
            }
        }

        function animate() {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].draw();
                particles[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        }

        init();
        animate();

        window.addEventListener("resize", handleResize);
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("pointerup", handlePointerLeave);
        window.addEventListener("pointercancel", handlePointerLeave);
        window.addEventListener("pointerleave", handlePointerLeave);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("pointerup", handlePointerLeave);
            window.removeEventListener("pointercancel", handlePointerLeave);
            window.removeEventListener("pointerleave", handlePointerLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                display: "block",
                width: "100%",
                height: "100vh",
                background: "black",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 1,
                touchAction: "none",
            }}
        />
    );
}
