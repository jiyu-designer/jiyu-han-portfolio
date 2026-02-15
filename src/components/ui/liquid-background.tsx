"use client"

import { useEffect, useRef } from "react"
import InteractiveText from "@/app/projects/moving/interactive-text";

export function LiquidBackground() {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const appRef = useRef<any>(null)

    useEffect(() => {
        async function initLiquid() {
            if (!canvasRef.current) return

            try {
                // Dynamically import the library from the CDN as requested
                // using webpackIgnore to prevent build-time resolution errors
                // @ts-ignore
                const module = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.27/build/backgrounds/liquid1.min.js')
                const LiquidBackground = module.default

                if (LiquidBackground) {
                    const app = LiquidBackground(canvasRef.current)

                    // Apply user-requested settings
                    app.loadImage('/images/Moving/Moving2.jpg')
                    app.liquidPlane.material.metalness = 0.75
                    app.liquidPlane.material.roughness = 0.25
                    app.liquidPlane.uniforms.displacementScale.value = 5
                    app.setRain(false)

                    appRef.current = app
                }
            } catch (error) {
                console.error("Failed to load LiquidBackground:", error)
            }
        }

        initLiquid()

        return () => {
            // Cleanup if the library supports it
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-0 h-full w-full m-0 p-0"
            style={{
                fontFamily: '"Montserrat", serif'
            }}
        >
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-auto"
                style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="pointer-events-auto">
                    <InteractiveText />
                </div>
            </div>
        </div>
    )
}
