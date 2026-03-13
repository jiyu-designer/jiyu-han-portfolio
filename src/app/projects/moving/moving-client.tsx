"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "./moving.css";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ParticleText = dynamic(() => import("./particle-text"), { ssr: false });
const OceanWaves = dynamic(() => import("./ocean-waves"), { ssr: false });
const LiquidBackground = dynamic(
  () => import("@/components/ui/liquid-background").then((m) => ({ default: m.LiquidBackground })),
  { ssr: false }
);
const FlowmapHero = dynamic(
  () => import("@/components/ui/flowmap-hero").then((m) => ({ default: m.FlowmapHero })),
  { ssr: false }
);

function MovingFlowmap() {
    return <FlowmapHero text="MOVING" />;
}

const ART_COMPONENTS: React.ComponentType[] = [ParticleText, MovingFlowmap, LiquidBackground, OceanWaves];

export default function MovingClient() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % ART_COMPONENTS.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + ART_COMPONENTS.length) % ART_COMPONENTS.length);
    };

    const CurrentArt = ART_COMPONENTS[currentIndex];

    return (
        <div className="moving-project relative overflow-hidden">
            <Link href="/" className="back-home mix-blend-difference">
                Back to Home
            </Link>

            <div className="w-full h-full">
                <CurrentArt />
            </div>

            {/* Navigation Buttons */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-50 pointer-events-none">
                <button
                    onClick={handlePrev}
                    className="nav-button pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white border border-white/20 hover:scale-110 active:scale-95"
                    aria-label="Previous Art"
                >
                    <ChevronLeft size={16} />
                </button>

                <button
                    onClick={handleNext}
                    className="nav-button pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white border border-white/20 hover:scale-110 active:scale-95"
                    aria-label="Next Art"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
