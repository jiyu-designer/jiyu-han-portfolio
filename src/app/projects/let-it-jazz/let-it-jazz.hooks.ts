"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import type { PlaylistItem } from "@/lib/youtube";

// YouTube IFrame API types
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTPlayerOptions {
  height: string;
  width: string;
  videoId: string;
  playerVars: Record<string, unknown>;
  events: {
    onReady?: () => void;
    onStateChange?: (event: { data: number }) => void;
  };
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

function extractColors(imgUrl: string): Promise<[number, number, number][]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve([]);
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      // Sample pixels from different regions to get varied colors
      const regions = [
        { x: 0, y: 0, w: size / 2, h: size / 2 },           // top-left
        { x: size / 2, y: 0, w: size / 2, h: size / 2 },     // top-right
        { x: 0, y: size / 2, w: size / 2, h: size / 2 },     // bottom-left
        { x: size / 2, y: size / 2, w: size / 2, h: size / 2 }, // bottom-right
        { x: size / 4, y: size / 4, w: size / 2, h: size / 2 }, // center
      ];

      const colors: [number, number, number][] = regions.map((region) => {
        let r = 0, g = 0, b = 0, count = 0;
        for (let py = Math.floor(region.y); py < Math.floor(region.y + region.h); py++) {
          for (let px = Math.floor(region.x); px < Math.floor(region.x + region.w); px++) {
            const i = (py * size + px) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
      });

      resolve(colors);
    };
    img.onerror = () => resolve([]);
    img.src = imgUrl;
  });
}

export function useLetItJazz(tracks: PlaylistItem[]) {
  const playerRef = useRef<YTPlayer | null>(null);
  const progressRef = useRef<HTMLInputElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const animFrameRef = useRef<number>(0);
  const initialSlide = Math.min(3, Math.max(0, tracks.length - 1));
  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const pendingPlayRef = useRef(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const wheelAccumRef = useRef(0);
  const wheelLockRef = useRef(false);
  const applySlideDepth = useCallback((swiper: SwiperType, activeIndex: number) => {
    Array.from(swiper.slides).forEach((slideEl, index) => {
      const distance = Math.abs(index - activeIndex);
      slideEl.style.setProperty("--card-distance", String(distance));
    });
  }, []);

  // Extract colors from current track thumbnail and update gradient
  useEffect(() => {
    const track = tracks[currentIndex];
    if (!track?.thumbnail) return;

    const container = document.querySelector<HTMLElement>(".letitjazz");
    if (!container) return;
    containerRef.current = container;

    extractColors(track.thumbnail).then((colors) => {
      if (colors.length < 5) return;
      colors.forEach((c, i) => {
        container.style.setProperty(`--color${i + 1}`, `${c[0]}, ${c[1]}, ${c[2]}`);
      });
      // Derive background colors from the dominant (first) color, darkened
      const [r, g, b] = colors[0];
      container.style.setProperty("--color-bg1", `rgb(${Math.round(r * 0.1)}, ${Math.round(g * 0.1)}, ${Math.round(b * 0.1)})`);
      container.style.setProperty("--color-bg2", `rgb(${Math.round(r * 0.15)}, ${Math.round(g * 0.15)}, ${Math.round(b * 0.15)})`);
      // Interactive color from center region
      const center = colors[4];
      container.style.setProperty("--color-interactive", `${center[0]}, ${center[1]}, ${center[2]}`);
    });
  }, [currentIndex, tracks]);

  // Interactive gradient bubble follows mouse
  useEffect(() => {
    const interBubble = document.querySelector<HTMLElement>(".interactive");
    if (!interBubble) return;

    let curX = 0;
    let curY = 0;
    let tgX = 0;
    let tgY = 0;
    let frameId: number;

    const move = () => {
      curX += (tgX - curX) / 20;
      curY += (tgY - curY) / 20;
      interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
      frameId = requestAnimationFrame(move);
    };

    const onMouseMove = (event: MouseEvent) => {
      tgX = event.clientX;
      tgY = event.clientY;
    };

    window.addEventListener("mousemove", onMouseMove);
    frameId = requestAnimationFrame(move);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) {
      setPlayerReady(true);
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      setPlayerReady(true);
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  }, []);

  // Initialize YT Player once API is ready
  useEffect(() => {
    if (!playerReady || !window.YT || tracks.length === 0) return;
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player("yt-player", {
      height: "0",
      width: "0",
      videoId: tracks[initialSlide]?.videoId ?? "",
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: () => {
          try {
            playerRef.current?.playVideo();
            setIsPlaying(true);
          } catch {
            pendingPlayRef.current = true;
          }
          if (pendingPlayRef.current) {
            pendingPlayRef.current = false;
            playerRef.current?.playVideo();
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.ENDED) {
            const nextIdx = (currentIndex + 1) % tracks.length;
            setCurrentIndex(nextIdx);
            swiperRef.current?.slideTo(nextIdx);
            playerRef.current?.loadVideoById(tracks[nextIdx].videoId);
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          }
        },
      },
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerReady, tracks.length]);

  // Update progress bar
  useEffect(() => {
    const progress = progressRef.current;
    const player = playerRef.current;

    const updateProgress = () => {
      if (player && progress) {
        try {
          const current = player.getCurrentTime();
          const duration = player.getDuration();
          if (duration > 0) {
            progress.max = String(duration);
            progress.value = String(current);
          }
        } catch {
          // player not ready yet
        }
      }
      animFrameRef.current = requestAnimationFrame(updateProgress);
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [playerReady]);

  const playPause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (player.getPlayerState() === 1) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } catch {
      // player not ready
    }
  }, []);

  const goToTrack = useCallback(
    (index: number) => {
      if (tracks.length === 0) return;
      setCurrentIndex(index);
      const player = playerRef.current;
      if (player) {
        try {
          player.loadVideoById(tracks[index].videoId);
          setIsPlaying(true);
        } catch {
          pendingPlayRef.current = true;
        }
      }
    },
    [tracks]
  );

  const next = useCallback(() => {
    if (tracks.length === 0) return;
    const nextIdx = (currentIndex + 1) % tracks.length;
    goToTrack(nextIdx);
    swiperRef.current?.slideTo(nextIdx);
  }, [currentIndex, tracks.length, goToTrack]);

  const prev = useCallback(() => {
    if (tracks.length === 0) return;
    const prevIdx = (currentIndex - 1 + tracks.length) % tracks.length;
    goToTrack(prevIdx);
    swiperRef.current?.slideTo(prevIdx);
  }, [currentIndex, tracks.length, goToTrack]);

  useEffect(() => {
    if (tracks.length <= 1) return;
    const container = containerRef.current ?? document.querySelector<HTMLElement>(".letitjazz");
    if (!container) return;
    containerRef.current = container;

    let unlockTimer = 0;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (wheelLockRef.current) return;

      wheelAccumRef.current += event.deltaY;
      const threshold = 50;
      if (Math.abs(wheelAccumRef.current) < threshold) return;

      const direction = Math.sign(wheelAccumRef.current);
      wheelAccumRef.current = 0;
      wheelLockRef.current = true;

      if (direction > 0) {
        next();
      } else {
        prev();
      }

      window.clearTimeout(unlockTimer);
      unlockTimer = window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 420);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      window.clearTimeout(unlockTimer);
    };
  }, [next, prev, tracks.length]);

  const onSlideChange = useCallback(
    (swiper: SwiperType) => {
      applySlideDepth(swiper, swiper.activeIndex);
      goToTrack(swiper.activeIndex);
    },
    [applySlideDepth, goToTrack]
  );

  const onSwiperInit = useCallback((swiper: SwiperType) => {
    swiperRef.current = swiper;
    applySlideDepth(swiper, swiper.activeIndex);
  }, [applySlideDepth]);

  const onProgressInput = useCallback(() => {
    const player = playerRef.current;
    const progress = progressRef.current;
    if (player && progress) {
      player.seekTo(Number(progress.value), true);
    }
  }, []);

  const onDirectionalSlideClick = useCallback(
    (clickedIndex: number) => {
      if (clickedIndex < 0 || clickedIndex >= tracks.length) return;
      const active = swiperRef.current?.activeIndex ?? currentIndex;
      if (clickedIndex < active) {
        prev();
      } else if (clickedIndex > active) {
        next();
      }
    },
    [currentIndex, next, prev, tracks.length]
  );

  return {
    progressRef,
    currentIndex,
    isPlaying,
    playPause,
    next,
    prev,
    onSlideChange,
    onSwiperInit,
    onProgressInput,
    onDirectionalSlideClick,
    currentTrack: tracks[currentIndex] ?? null,
  };
}
