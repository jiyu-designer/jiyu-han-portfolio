"use client";

import "./nostalgia.css";
import Link from "next/link";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate as fmAnimate,
} from "framer-motion";

const carouselImages = [
  "/images/Nostalgia/Nostalgia1.png",
  "/images/Nostalgia/Nostalgia2.png",
  "/images/Nostalgia/Nostalgia3.png",
  "/images/Nostalgia/Nostalgia4.png",
];

/* Extended: [last, ...all, first] for seamless infinite loop */
const extendedImages = [
  carouselImages[carouselImages.length - 1],
  ...carouselImages,
  carouselImages[0],
];

const hotspots = [
  { x: 30, y: 25, name: "Nostalgia Ear (2)", price: "$149" },
  { x: 55, y: 55, name: "Nostalgia Phone (2a)", price: "$349" },
  { x: 75, y: 35, name: "Nostalgia CMF Watch", price: "$69" },
];

const SLIDE_VW = 70;

function vwToPx(vw: number) {
  if (typeof window === "undefined") return 0;
  return (vw / 100) * window.innerWidth;
}

export default function NostalgiaPage() {
  const trackIndexRef = useRef(1); // 1 = first real slide
  const isAnimating = useRef(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isCarouselLocked = useRef(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* MotionValue — start at 0, set correct position on mount */
  const trackX = useMotionValue(0);
  const [realIndex, setRealIndex] = useState(0);

  useEffect(() => {
    trackX.set(-vwToPx(SLIDE_VW));
  }, [trackX]);

  /* Product showcase hover state */
  const showcaseImgRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<
    (typeof hotspots)[number] | null
  >(null);

  const handleShowcaseMove = useCallback((e: React.MouseEvent) => {
    const el = showcaseImgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    const nearest = hotspots.find(
      (h) => Math.hypot(h.x - x, h.y - y) < 12
    );
    setActiveHotspot(nearest ?? null);
  }, []);

  const handleShowcaseLeave = useCallback(() => {
    setCursor(null);
    setActiveHotspot(null);
  }, []);

  /* Recalculate trackX on window resize */
  useEffect(() => {
    const onResize = () => {
      trackX.set(-vwToPx(SLIDE_VW * trackIndexRef.current));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [trackX]);

  const goToSlide = useCallback(
    (dir: number) => {
      if (isAnimating.current) return false;
      isAnimating.current = true;

      const nextIndex = trackIndexRef.current + dir;
      trackIndexRef.current = nextIndex;
      const targetPx = -vwToPx(SLIDE_VW * nextIndex);

      fmAnimate(trackX, targetPx, {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
        onComplete: () => {
          /* If on a clone, instantly jump to the real position */
          if (nextIndex === 0) {
            trackIndexRef.current = carouselImages.length;
            trackX.set(-vwToPx(SLIDE_VW * carouselImages.length));
          } else if (nextIndex === extendedImages.length - 1) {
            trackIndexRef.current = 1;
            trackX.set(-vwToPx(SLIDE_VW));
          }
          /* Update indicator */
          const ri = trackIndexRef.current - 1;
          setRealIndex(ri);
          isAnimating.current = false;
        },
      });

      return true;
    },
    [trackX]
  );

  /* Global wheel listener */
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 20) return;

      const rect = carousel.getBoundingClientRect();
      const carouselVisible =
        rect.top <= window.innerHeight * 0.15 &&
        rect.bottom >= window.innerHeight * 0.85;

      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const scrollingDown = e.deltaY > 0;

      if (!isCarouselLocked.current) {
        if (carouselVisible && scrollingDown) {
          if (enterTimer.current) return;
          enterTimer.current = setTimeout(() => {
            isCarouselLocked.current = true;
            enterTimer.current = null;
          }, 150);
          return;
        }
        if (!isCarouselLocked.current) return;
      }

      e.preventDefault();
      goToSlide(scrollingDown ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (enterTimer.current) clearTimeout(enterTimer.current);
    };
  }, [goToSlide]);

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
          <img
            src="/images/Nostalgia/Nostalgia10.png"
            alt="Nostalgia products"
          />
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
          {hotspots.map((h) => (
            <span
              key={h.name}
              className={`nostalgia-showcase__dot${activeHotspot?.name === h.name ? " nostalgia-showcase__dot--active" : ""}`}
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            />
          ))}
        </div>
        <div className="nostalgia-showcase__info-wrapper">
          <AnimatePresence mode="wait">
            {activeHotspot && (
              <motion.div
                key={activeHotspot.name}
                className="nostalgia-showcase__info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <p className="nostalgia-showcase__name">{activeHotspot.name}</p>
                <p className="nostalgia-showcase__price">{activeHotspot.price}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Carousel — infinite loop */}
      <section ref={carouselRef} className="nostalgia-carousel">
        <motion.div className="nostalgia-carousel__track" style={{ x: trackX }}>
          {extendedImages.map((src, i) => (
            <div key={`slide-${i}`} className="nostalgia-carousel__slide">
              <img
                src={src}
                alt={`Nostalgia artwork ${((i - 1 + carouselImages.length) % carouselImages.length) + 1}`}
              />
            </div>
          ))}
        </motion.div>

        <div className="nostalgia-carousel__indicators">
          {carouselImages.map((_, i) => (
            <span
              key={i}
              className={`nostalgia-carousel__dot${i === realIndex ? " nostalgia-carousel__dot--active" : ""}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
