"use client";

import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import SplitType from "split-type";

export function HeroText() {
    const textRef = useRef<HTMLHeadingElement>(null);

    useLayoutEffect(() => {
        if (!textRef.current) return;

        // Split text into characters
        const text = new SplitType(textRef.current, { types: "chars" });

        // Initial state: hide characters by moving them down
        // We need a way to hide the overflow. 
        // SplitType wraps chars in .char class.
        // To get the "reveal from bottom" effect where they are clipped, 
        // we usually need the chars to be inside a wrapper that has overflow: hidden.
        // SplitType does not strictly wrap chars in a line container by default unless specified.
        // However, the user's example 2 just animates y and stagger.
        // Example 1 used overflow: hidden on container.
        // Let's try to animate y from 100% to 0%. 
        // If we want them to "appear" from invisible, we can combine with opacity or use a clip-path.
        // Or, we can just let them fly up.
        // The user said: "most basic but effective... text comes up from bottom... container overflow: hidden".
        // If I just use SplitType on a single line, I can maybe wrap the whole thing or rely on the visual effect.
        // But for the best "cut off" effect per character, each char needs a mask.
        // Let's stick to the user's Example 2 code style which implies a simple stagger from y.
        // "Text motion's flower is character by character... SplitType makes it concise."

        gsap.fromTo(
            text.chars,
            {
                y: 100,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                stagger: 0.05,
                duration: 1,
                ease: "power4.out",
                delay: 0.2,
            }
        );

        return () => {
            // Cleanup
            text.revert();
        };
    }, []);

    return (
        <div className="overflow-hidden"> {/* Container with overflow hidden to catch the slide up if desired, or just to contain */}
            <h1
                ref={textRef}
                className="font-[family-name:var(--font-montserrat)] text-6xl font-bold tracking-tighter text-white md:text-8xl"
                style={{ lineHeight: 1.1 }} // Ensure adequate line height
            >
                Jiyu Han
            </h1>
        </div>
    );
}
