"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Link from "next/link";

const HERO_LINES = [
  { text: "JIYU HAN", direction: "left" },
  { text: "SAAS DESIGN", direction: "right" },
  { text: "AI ARTWORKS", direction: "left" },
  { text: "VIBE CODING", direction: "right" },
] as const;

export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioEnabledRef = useRef(false);
  const hasPlayedRef = useRef(false);
  const buttonInMaskRef = useRef(false);
  const [maskVisible, setMaskVisible] = useState(false);
  const [buttonInMask, setButtonInMask] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);

  const unlockAudio = useCallback(async () => {
    if (audioEnabledRef.current) return;

    const Ctx = window.AudioContext;
    if (!Ctx) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new Ctx();
    }

    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    audioEnabledRef.current = true;
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLineIndex((prev) => (prev + 1) % HERO_LINES.length);
    }, 1500);
    return () => window.clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    const setSlideDistance = () => {
      const el = titleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const maxDistance = Math.max((window.innerWidth - rect.width) / 2 - 24, 0);
      const targetDistance = maxDistance * 0.7;
      el.style.setProperty("--slide-distance", `${targetDistance.toFixed(2)}px`);
    };

    setSlideDistance();
    window.addEventListener("resize", setSlideDistance);
    return () => {
      window.removeEventListener("resize", setSlideDistance);
    };
  }, [lineIndex]);

  useEffect(() => {
    if (!audioEnabledRef.current || !audioCtxRef.current) return;
    if (!hasPlayedRef.current) {
      hasPlayedRef.current = true;
      return;
    }

    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const playAnalogTick = (
      start: number,
      freq: number,
      gainValue: number,
      duration: number,
      accent = false
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const band = ctx.createBiquadFilter();
      const low = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.74, start + duration);

      band.type = "bandpass";
      band.frequency.setValueAtTime(accent ? 2400 : 1900, start);
      band.Q.setValueAtTime(2.0, start);

      low.type = "lowpass";
      low.frequency.setValueAtTime(4300, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(band);
      band.connect(low);
      low.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    };

    playAnalogTick(now, 2100, 0.046, 0.032, true);
    playAnalogTick(now + 0.118, 1650, 0.03, 0.028, false);
  }, [lineIndex]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  const updateMask = useCallback((clientX: number, clientY: number) => {
    const root = mainRef.current;
    if (!root) return;
    root.style.setProperty("--mask-x", `${clientX}px`);
    root.style.setProperty("--mask-y", `${clientY}px`);

    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const nearestX = Math.max(rect.left, Math.min(clientX, rect.right));
    const nearestY = Math.max(rect.top, Math.min(clientY, rect.bottom));
    const dx = clientX - nearestX;
    const dy = clientY - nearestY;
    const isInsideMask = dx * dx + dy * dy <= 150 * 150;
    if (buttonInMaskRef.current !== isInsideMask) {
      buttonInMaskRef.current = isInsideMask;
      setButtonInMask(isInsideMask);
    }
  }, []);

  const handleMouseEnter = (e: MouseEvent<HTMLElement>) => {
    setMaskVisible(true);
    updateMask(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    void unlockAudio();
    updateMask(e.clientX, e.clientY);
  };

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    let rafId: number | null = null;

    if (root.matches(":hover")) {
      rafId = window.requestAnimationFrame(() => {
        setMaskVisible(true);
      });
    }

    const syncHoverMove = (e: globalThis.MouseEvent) => {
      const current = mainRef.current;
      if (!current) return;
      if (!current.matches(":hover")) return;
      setMaskVisible(true);
      updateMask(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", syncHoverMove, { passive: true });
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("mousemove", syncHoverMove);
    };
  }, [updateMask]);

  const currentLine = HERO_LINES[lineIndex];

  return (
    <main
      ref={mainRef}
      className="hero-main flex h-screen w-full items-center justify-center overflow-hidden bg-black"
      data-mask-visible={maskVisible}
      onMouseEnter={handleMouseEnter}
      onMouseDown={() => void unlockAudio()}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setMaskVisible(false);
        buttonInMaskRef.current = false;
        setButtonInMask(false);
      }}
    >
      <h1
        ref={titleRef}
        key={`${lineIndex}-${currentLine.text}`}
        className={`hero-main-title hero-main-title--${currentLine.direction} text-white`}
      >
        {currentLine.text}
      </h1>
      <Link
        ref={buttonRef}
        href="/projects"
        className={`hero-projects-btn ${buttonInMask ? "hero-projects-btn--in-mask" : ""}`}
      >
        View all Projects
      </Link>
    </main>
  );
}
