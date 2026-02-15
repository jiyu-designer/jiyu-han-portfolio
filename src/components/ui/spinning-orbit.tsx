"use client";

import React from "react";
import styles from "./spinning-orbit.module.scss";

export function SpinningOrbit({ children }: { children?: React.ReactNode }) {
    // Generate 45 divs for the animation
    const circles = Array.from({ length: 45 }, (_, i) => (
        <div key={i} className={styles.c}></div>
    ));

    return (
        <div className={styles.container}>
            <div className={styles.b}>
                {circles}
            </div>

            {children && (
                <div className="absolute z-10 w-full flex justify-center" style={{ bottom: '15%' }}>
                    {children}
                </div>
            )}
        </div>
    );
}
