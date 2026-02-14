"use client";

import "./let-it-jazz.css";
import { useLetItJazz } from "./let-it-jazz.hooks";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import Script from "next/script";
import Link from "next/link";
import type { PlaylistItem } from "@/lib/youtube";

function BackwardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" width="16" height="16">
      <path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 240V96c0-17.7-14.3-32-32-32S0 78.3 0 96V416c0 17.7 14.3 32 32 32s32-14.3 32-32V272l11.5 8.6 192 160z" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" width="16" height="16">
      <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 240V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V272l-11.5 8.6-192 160z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" width="18" height="18">
      <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.8 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" width="18" height="18">
      <path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z" />
    </svg>
  );
}

interface Props {
  tracks: PlaylistItem[];
}

export default function LetItJazzClient({ tracks }: Props) {
  const {
    progressRef,
    isPlaying,
    playPause,
    next,
    prev,
    onSlideChange,
    onSwiperInit,
    onProgressInput,
    currentTrack,
  } = useLetItJazz(tracks);

  return (
    <div className="letitjazz">
      <Link href="/" className="back-home">Back to Home</Link>
      <Script
        src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
        type="module"
      />

      <div className="gradient-bg">
        <svg className="svgBlur">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div className="gradients-container">
          <div className="g1" />
          <div className="g2" />
          <div className="g3" />
          <div className="g4" />
          <div className="g5" />
          <div className="interactive" />
        </div>
      </div>

      <div className="album-cover">
        <Swiper
          modules={[EffectCoverflow]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          initialSlide={Math.min(3, tracks.length - 1)}
          spaceBetween={40}
          coverflowEffect={{
            rotate: 25,
            stretch: 0,
            depth: 50,
            modifier: 1,
            slideShadows: false,
          }}
          onSwiper={onSwiperInit}
          onSlideChange={onSlideChange}
        >
          {tracks.map((track) => (
            <SwiperSlide key={track.videoId}>
              <img src={track.thumbnail} alt={track.title} />
              <div className="overlay">
                <a href={track.url} target="_blank" rel="noopener noreferrer">
                  {/* @ts-expect-error ion-icon is a web component */}
                  <ion-icon name="logo-youtube"></ion-icon>
                </a>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="music-player">
        <h1>{currentTrack?.title ?? "No Track"}</h1>
        <p>{currentTrack?.channelTitle ?? ""}</p>

        <div id="yt-player" style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />

        <input
          type="range"
          defaultValue="0"
          ref={progressRef}
          id="progress"
          onInput={onProgressInput}
        />

        <div className="controls">
          <button type="button" onClick={prev}>
            <BackwardIcon />
          </button>
          <button type="button" className="play-pause-btn" onClick={playPause}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" onClick={next}>
            <ForwardIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
