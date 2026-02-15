
"use client";

import "./moving.css";
import Link from "next/link";
import ParticleText from "./particle-text";

export default function MovingPage() {
    return (
        <div className="moving-project">
            <Link href="/" className="back-home">
                Back to Home
            </Link>
            <ParticleText />

            {/* Overlay content positioned above canvas */}
            <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'none' }}>
                <div className="moving-content">
                    {/* Content */}
                </div>
            </div>


        </div>
    );
}
