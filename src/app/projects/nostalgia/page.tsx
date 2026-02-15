"use client";

import "./nostalgia.css";
import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  MotionValue,
} from "framer-motion";

const zoomImages = [
  "/images/Nostalgia/Nostalgia1.png",
  "/images/Nostalgia/Nostalgia13.png",
  "/images/Nostalgia/Nostalgia14.png",
  "/images/Nostalgia/Nostalgia15.png",
];

const showcaseProducts = [
  { image: "/images/Nostalgia/Nostalgia16.png", name: "Nostalgia Ring", price: "$349" },
  { image: "/images/Nostalgia/Nostalgia17.png", name: "Nostalgia Earcurfs Set", price: "$249" },
  { image: "/images/Nostalgia/Nostalgia18.png", name: "Endless Earing", price: "$299" },
  { image: "/images/Nostalgia/Nostalgia19.png", name: "Nostalgia Neckglasses", price: "$499" },
];

function ZoomGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className="nostalgia-zoom__gallery">
      <div className="nostalgia-zoom__sticky">
        {zoomImages.map((src, i) => (
          <ZoomImage
            key={i}
            src={src}
            alt={`Nostalgia ${i + 1}`}
            index={i}
            total={zoomImages.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
}

function ZoomImage({
  src,
  alt,
  index,
  total,
  scrollYProgress,
}: {
  src: string;
  alt: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Staggered timing: each image starts shrinking slightly after the previous
  const start = index * 0.12;
  const end = start + 0.4;

  const scale = useTransform(scrollYProgress, [start, end], [1, 0.25]);
  const opacity = useTransform(scrollYProgress, [start, end, end + 0.05], [1, 1, 1]);
  const x = useTransform(scrollYProgress, (latest) => {
    const t = Math.max(0, Math.min(1, (latest - start) / (end - start)));
    const vw = typeof window !== "undefined" ? window.innerWidth : 1000;
    const targetX = (index - (total - 1) / 2) * 0.25 * vw;
    return t * targetX;
  });

  return (
    <motion.img
      src={src}
      alt={alt}
      className="nostalgia-zoom__img"
      style={{
        scale,
        x,
        opacity,
        zIndex: total - index,
        position: "absolute",
        inset: 0,
      }}
    />
  );
}

export default function NostalgiaPage() {
  /* Product showcase carousel + hover state */
  const showcaseImgRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [isShowcaseHovered, setIsShowcaseHovered] = useState(false);
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  useEffect(() => {
    if (isShowcaseHovered) return;
    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % showcaseProducts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isShowcaseHovered]);

  const handleShowcaseMove = useCallback((e: React.MouseEvent) => {
    const el = showcaseImgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsShowcaseHovered(true);
  }, []);

  const handleShowcaseLeave = useCallback(() => {
    setCursor(null);
    setIsShowcaseHovered(false);
  }, []);

  return (
    <div className="nostalgia">
      <Link href="/" className="back-home">
        Back to Home
      </Link>

      {/* Hero Video */}
      <section className="nostalgia-hero">
        <video
          className="nostalgia-hero__video"
          src="/images/Nostalgia/Nostalgia-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="nostalgia-hero__overlay">
          <h1 className="nostalgia-hero__title">Nostalgia</h1>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="nostalgia-showcase">
        <div
          ref={showcaseImgRef}
          className="nostalgia-showcase__image"
          onMouseMove={handleShowcaseMove}
          onMouseLeave={handleShowcaseLeave}
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={showcaseIndex}
              src={showcaseProducts[showcaseIndex].image}
              alt={showcaseProducts[showcaseIndex].name}
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AnimatePresence>
          {cursor && (
            <motion.div
              className="nostalgia-showcase__circle"
              style={{ left: cursor.x, top: cursor.y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
        <div className="nostalgia-showcase__info-wrapper">
          <AnimatePresence mode="wait">
            {isShowcaseHovered && (
              <motion.div
                key={showcaseIndex}
                className="nostalgia-showcase__info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <p className="nostalgia-showcase__name">{showcaseProducts[showcaseIndex].name}</p>
                <p className="nostalgia-showcase__price">{showcaseProducts[showcaseIndex].price}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Zoom Scroll Gallery */}
      <ZoomGallery />

      {/* Lookbook Section */}
      <section className="nostalgia-lookbook">
        <div className="nostalgia-lookbook__grid">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="nostalgia-lookbook__item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/Nostalgia/Nostalgia${i + 1}.png`}
                alt={`Lookbook ${i + 1}`}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
