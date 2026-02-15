
"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./interactive-text.module.css";

export default function InteractiveText() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const text = "MOVING";

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className={styles.container} ref={containerRef}>
            {text.split("").map((char, i) => (
                <Letter key={i} char={char} mousePos={mousePos} />
            ))}
        </div>
    );
}

function Letter({ char, mousePos }: { char: string; mousePos: { x: number; y: number } }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distW = mousePos.x - centerX;
        const distH = mousePos.y - centerY;
        const distance = Math.sqrt(distW * distW + distH * distH);

        const maxDist = 300; // Radius of influence
        const power = maxDist - distance;

        if (distance < maxDist) {
            const force = power / maxDist;
            const moveX = (distW / distance) * force * -100; // Repel force
            const moveY = (distH / distance) * force * -100;
            setPosition({ x: moveX, y: moveY });
        } else {
            setPosition({ x: 0, y: 0 });
        }
    }, [mousePos]);

    return (
        <motion.span
            ref={ref}
            className={styles.letter}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
            {char}
        </motion.span>
    );
}
