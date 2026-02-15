
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
        let animationFrameId: number;
        let mouse = { x: -1000, y: -1000, radius: 150 }; // Increased radius

        // Handle Resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        // Handle Mouse
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
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
                this.size = 2;
                this.density = (Math.random() * 10) + 2; // Reduced density for lower mass feel
                this.color = "white";
                this.friction = 0.95; // Friction to slow down
                this.ease = 0.05; // Spring strength
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
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;

                // Repulsion
                if (distance < maxDistance) {
                    // Normalize force: closer = stronger
                    const force = (maxDistance - distance) / maxDistance;
                    // Push away
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;

                    this.vx -= directionX;
                    this.vy -= directionY;
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

            // Draw text to get pixel data
            ctx.fillStyle = "white";

            // Calculate font size to be 80% of screen width
            let fontSize = 100; // Start with a guess
            ctx.font = `900 ${fontSize}px Montserrat`;
            const text = "MOVING";
            const measurements = ctx.measureText(text);
            const targetWidth = canvas.width * 0.8;

            // Simple proportion: targetFontSize / currentFontSize = targetWidth / currentWidth
            fontSize = (targetWidth / measurements.width) * fontSize;

            // Cap the font size reasonably if needed, but aim for 80% width primarily
            ctx.font = `900 ${fontSize}px Montserrat`;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const step = 4;
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
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseout", handleMouseLeave);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseout", handleMouseLeave);
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
            }}
        />
    );
}
