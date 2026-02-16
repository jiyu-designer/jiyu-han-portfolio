"use client";

import "./dive-deep.css";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

import Image from "next/image";

/* Images per column — adjust freely */
const colLeft = [
  "/images/dive-deep/artworks22.png",
  "/images/dive-deep/artworks19.png",
  "/images/dive-deep/artworks16.png",
  "/images/dive-deep/artworks13.png",
  "/images/dive-deep/artworks10.png",
  "/images/dive-deep/artworks7.png",
  "/images/dive-deep/artworks4.png",
  "/images/dive-deep/artworks1.png",
];

const colCenter = [
  "/images/dive-deep/artworks23.mp4",
  "/images/dive-deep/artworks20.png",
  "/images/dive-deep/artworks17.png",
  "/images/dive-deep/artworks14.png",
  "/images/dive-deep/artworks11.png",
  "/images/dive-deep/artworks8.png",
  "/images/dive-deep/artworks5.png",
  "/images/dive-deep/artworks2.png",
];

const colRight = [
  "/images/dive-deep/artworks21.mp4",
  "/images/dive-deep/artworks18.png",
  "/images/dive-deep/artworks15.png",
  "/images/dive-deep/artworks12.png",
  "/images/dive-deep/artworks9.png",
  "/images/dive-deep/artworks6.png",
  "/images/dive-deep/artworks3.png",


];

const springConfig = { stiffness: 120, damping: 30, mass: 0.5 };

function ParallaxColumn({
  images,
  speed,
  className,
}: {
  images: string[];
  speed: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const rawY = useTransform(scrollYProgress, [0, 1], [0, speed]);
  const y = useSpring(rawY, springConfig);

  return (
    <motion.div ref={ref} className={`dd-col ${className ?? ""}`} style={{ y }}>
      {images.map((src, i) => (
        <div key={src} className="dd-item">
          {src.endsWith(".mp4") ? (
            <video src={src} autoPlay muted loop playsInline />
          ) : (
            <Image
              src={src}
              alt={`Dive Deep artwork ${i + 1}`}
              width={600}
              height={800}
              sizes="(max-width: 768px) 33vw, 33vw"
              className="w-full h-auto"
            />
          )}
        </div>
      ))}
    </motion.div>
  );
}

export default function DiveDeepPage() {
  return (
    <div className="dive-deep">
      <Link href="/" className="back-home">
        Back to Home
      </Link>

      {/* 3-Column Parallax Gallery */}
      <div className="dd-gallery">
        <ParallaxColumn images={colLeft} speed={-80} className="dd-col--left" />
        <ParallaxColumn images={colCenter} speed={-200} className="dd-col--center" />
        <ParallaxColumn images={colRight} speed={-120} className="dd-col--right" />
      </div>
    </div>
  );
}
