"use client";

import "./beyond-with-humanity.css";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import Image from "next/image";

const springConfig = { stiffness: 120, damping: 30, mass: 0.5 };
const BATCH_SIZE = 6;

function LazyVideo({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {visible ? (
        <video src={src} autoPlay muted loop playsInline />
      ) : (
        <div style={{ aspectRatio: "3/4" }} />
      )}
    </div>
  );
}

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

  const [loadCount, setLoadCount] = useState(BATCH_SIZE);

  const handleScroll = useCallback(() => {
    if (loadCount >= images.length) return;
    const scrollBottom = window.innerHeight + window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    if (scrollBottom >= docHeight - 800) {
      setLoadCount((prev) => Math.min(prev + BATCH_SIZE, images.length));
    }
  }, [loadCount, images.length]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const visible = images.slice(0, loadCount);

  return (
    <motion.div ref={ref} className={`dd-col ${className ?? ""}`} style={{ y }}>
      {visible.map((src, i) => (
        <div key={src} className="dd-item">
          {src.endsWith(".mp4") ? (
            <LazyVideo src={src} />
          ) : (
            <Image
              src={src}
              alt={`Beyond with Humanity artwork ${i + 1}`}
              width={600}
              height={800}
              sizes="(max-width: 768px) 33vw, 33vw"
              className="w-full h-auto"
              loading={i < 3 ? "eager" : "lazy"}
              placeholder="empty"
            />
          )}
        </div>
      ))}
    </motion.div>
  );
}

export default function BeyondWithHumanityClient({
  colLeft,
  colCenter,
  colRight,
}: {
  colLeft: string[];
  colCenter: string[];
  colRight: string[];
}) {
  return (
    <div className="beyond-with-humanity">
      <Link href="/" className="back-home">
        Back to Home
      </Link>

      <div className="dd-gallery">
        <ParallaxColumn images={colLeft} speed={-80} className="dd-col--left" />
        <ParallaxColumn images={colCenter} speed={-200} className="dd-col--center" />
        <ParallaxColumn images={colRight} speed={-120} className="dd-col--right" />
      </div>
    </div>
  );
}
