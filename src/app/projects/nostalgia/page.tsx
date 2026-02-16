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

const zoomItems = [
  { src: "/images/Nostalgia/Nostalgia20.png", type: "image" as const },
  { src: "/images/Nostalgia/Nostalgia13.mp4", type: "video" as const },
  { src: "/images/Nostalgia/Nostalgia14.png", type: "image" as const },
  { src: "/images/Nostalgia/Nostalgia15.png", type: "image" as const },
];

const showcaseProducts = [
  { image: "/images/Nostalgia/Nostalgia16.png", name: "Nostalgia Ring", price: "$349" },
  { image: "/images/Nostalgia/Nostalgia17.png", name: "Nostalgia Earcurfs Set", price: "$249" },
  { image: "/images/Nostalgia/Nostalgia18.png", name: "Endless Earing", price: "$299" },
  { image: "/images/Nostalgia/Nostalgia19.png", name: "Nostalgia Neckglasses", price: "$499" },
];

const lookbookImages = Array.from(
  { length: 12 },
  (_, i) => `/images/Nostalgia/Nostalgia${i + 1}.png`
);

function ZoomGallery() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className="nostalgia-zoom__gallery">
      <div className="nostalgia-zoom__sticky">
        {zoomItems.map((item, i) => (
          <ZoomImage
            key={i}
            src={item.src}
            type={item.type}
            alt={`Nostalgia ${i + 1}`}
            index={i}
            total={zoomItems.length}
            scrollYProgress={scrollYProgress}
          />
        ))}
      </div>
    </div>
  );
}

function ZoomImage({
  src,
  type,
  alt,
  index,
  total,
  scrollYProgress,
}: {
  src: string;
  type: "image" | "video";
  alt: string;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  // Staggered timing: each image starts shrinking slightly after the previous
  const start = index * 0.12;
  const end = start + 0.4;

  const col = index % 2;
  const row = Math.floor(index / 2);

  const scale = useTransform(scrollYProgress, [start, end], [1, 0.505]);
  const x = useTransform(scrollYProgress, (latest) => {
    const t = Math.max(0, Math.min(1, (latest - start) / (end - start)));
    const vw = typeof window !== "undefined" ? window.innerWidth : 1000;
    const targetX = (col - 0.5) * 0.5 * vw;
    return t * targetX;
  });
  const y = useTransform(scrollYProgress, (latest) => {
    const t = Math.max(0, Math.min(1, (latest - start) / (end - start)));
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const targetY = (row - 0.5) * 0.5 * vh;
    return t * targetY;
  });

  const commonStyle = {
    scale,
    x,
    y,
    zIndex: total - index,
    position: "absolute" as const,
    inset: 0,
  };

  if (type === "video") {
    return (
      <motion.video
        src={src}
        className="nostalgia-zoom__img"
        autoPlay
        muted
        loop
        playsInline
        style={commonStyle}
      />
    );
  }

  return <motion.img src={src} alt={alt} className="nostalgia-zoom__img" style={commonStyle} />;
}

/* ── Precomputed card positions for each phase ── */
const TOTAL = lookbookImages.length; // 12
const CYL_RADIUS = 340;

function scatteredPos(i: number) {
  const rad = (i * 137.5 * Math.PI) / 180;
  const jitter = ((i * 97) % 100) / 100;
  const r = 250 + jitter * 360;
  return {
    x: Math.cos(rad) * r + ((i % 3) - 1) * 38,
    y: ((((i * 71) % 100) / 100) - 0.5) * 520 + (((i * 29) % 7) - 3) * 12,
    z: Math.sin(rad) * r * 0.75 + (((i * 53) % 11) - 5) * 24,
    rotY: (((i * 43) % 100) / 100 - 0.5) * 24,
    rotX: (((i * 31) % 100) / 100 - 0.5) * 14,
    rotZ: (((i * 59) % 100) / 100 - 0.5) * 16,
  };
}

function cylinderAngle(i: number) {
  return (i / TOTAL) * Math.PI * 2;
}

function gridPos(i: number) {
  const col = i % 4;
  const row = Math.floor(i / 4);
  const gap = 20;
  const cardW = 180;
  const cardH = 240;
  const totalH = 3 * cardH + 2 * gap; // 760
  return {
    x: (col - 1.5) * (cardW + gap),
    y: row * (cardH + gap) - totalH / 2 + cardH / 2,
  };
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function LookbookCard({
  src,
  index,
  scrollYProgress,
}: {
  src: string;
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const s = scatteredPos(index);
  const cAngle = cylinderAngle(index);
  const g = gridPos(index);

  const transform = useTransform(scrollYProgress, (p) => {
    let x: number, y: number, z: number, rY: number, rX: number, rZ: number;

    if (p <= 0.15) {
      /* ── Scattered ── */
      x = s.x; y = s.y; z = s.z;
      rY = s.rotY; rX = s.rotX; rZ = s.rotZ;
    } else if (p <= 0.35) {
      /* ── Scattered → Cylinder ── */
      const t = smoothstep((p - 0.15) / 0.2);
      const cX = Math.cos(cAngle) * CYL_RADIUS;
      const cZ = Math.sin(cAngle) * CYL_RADIUS;
      const faceY = 90 - (cAngle * 180) / Math.PI;
      x = lerp(s.x, cX, t);
      y = lerp(s.y, 0, t);
      z = lerp(s.z, cZ, t);
      rY = lerp(s.rotY, faceY, t);
      rX = s.rotX * (1 - t);
      rZ = s.rotZ * (1 - t);
    } else if (p <= 0.6) {
      /* ── Cylinder rotating ── */
      const rotProgress = (p - 0.35) / 0.25;
      const extra = rotProgress * Math.PI * 2;
      const cur = cAngle + extra;
      x = Math.cos(cur) * CYL_RADIUS;
      y = 0;
      z = Math.sin(cur) * CYL_RADIUS;
      rY = 90 - (cur * 180) / Math.PI;
      rX = 0; rZ = 0;
    } else if (p <= 0.8) {
      /* ── Cylinder → Grid ── */
      const t = smoothstep((p - 0.6) / 0.2);
      const endAngle = cAngle + Math.PI * 2;
      const cX = Math.cos(endAngle) * CYL_RADIUS;
      const cZ = Math.sin(endAngle) * CYL_RADIUS;
      const faceY = 90 - (endAngle * 180) / Math.PI;
      x = lerp(cX, g.x, t);
      y = lerp(0, g.y, t);
      z = cZ * (1 - t);
      rY = faceY * (1 - t);
      rX = 0; rZ = 0;
    } else {
      /* ── Grid ── */
      x = g.x; y = g.y; z = 0;
      rY = 0; rX = 0; rZ = 0;
    }

    return `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rY}deg) rotateX(${rX}deg) rotateZ(${rZ}deg)`;
  });

  return (
    <motion.div className="nostalgia-lookbook__card" style={{ transform }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`Lookbook ${index + 1}`} />
    </motion.div>
  );
}

function Lookbook360() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* Drag to rotate in scattered phase */
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY, yaw, pitch };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [yaw, pitch]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    setYaw(Math.max(-60, Math.min(60, start.yaw + (e.clientX - start.x) * 0.22)));
    setPitch(Math.max(-35, Math.min(35, start.pitch - (e.clientY - start.y) * 0.16)));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    dragStartRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  // Fade out drag rotation as scroll progresses past scattered phase
  const worldTransform = useTransform(scrollYProgress, (p) => {
    const fade = p <= 0.15 ? 1 : p <= 0.35 ? 1 - smoothstep((p - 0.15) / 0.2) : 0;
    return `rotateX(${pitch * fade}deg) rotateY(${yaw * fade}deg)`;
  });

  return (
    <section ref={ref} className="nostalgia-lookbook">
      <div
        className={`nostalgia-lookbook__sticky${isDragging ? " is-dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <motion.div className="nostalgia-lookbook__world" style={{ transform: worldTransform }}>
          {lookbookImages.map((src, i) => (
            <LookbookCard
              key={src}
              src={src}
              index={i}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default function NostalgiaPage() {
  /* BGM */
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;

    let started = false;
    const startPlayback = () => {
      if (started) return;
      started = true;
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
      cleanup();
    };
    const cleanup = () => {
      document.removeEventListener("scroll", startPlayback, true);
      document.removeEventListener("wheel", startPlayback, true);
      document.removeEventListener("touchmove", startPlayback, true);
    };

    // Try autoplay immediately
    audio.play().then(() => {
      started = true;
      setIsPlaying(true);
    }).catch(() => {
      // Blocked — wait for scroll interaction
      document.addEventListener("scroll", startPlayback, { capture: true, once: true });
      document.addEventListener("wheel", startPlayback, { capture: true, once: true });
      document.addEventListener("touchmove", startPlayback, { capture: true, once: true });
    });

    return cleanup;
  }, []);

  const toggleBgm = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  /* Product showcase carousel + hover state */
  const showcaseImgRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [isShowcaseHovered, setIsShowcaseHovered] = useState(false);
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  useEffect(() => {
    if (isShowcaseHovered) return;
    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % showcaseProducts.length);
    }, 3000);
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
      <Lookbook360 />

      {/* BGM */}
      <audio ref={audioRef} src="/music/Nostalgia-brandbgm.mp3" loop />
      <button className="nostalgia-bgm-btn" onClick={toggleBgm}>
        {isPlaying ? "Music Stop" : "Music Play"}
      </button>
    </div>
  );
}
