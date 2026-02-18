"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

export default function OceanWaves() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // --- 초기 설정 ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.domElement.style.touchAction = "none";
        container.appendChild(renderer.domElement);

        // 포인터 좌표 추적 (마우스 + 터치)
        const targetMouse = new THREE.Vector2(0, 0);
        const smoothedMouse = new THREE.Vector2(0, 0);
        let lastInteraction = performance.now();
        const updatePointer = (clientX: number, clientY: number) => {
            const rect = container.getBoundingClientRect();
            const x = (clientX - rect.left) / rect.width;
            const y = (clientY - rect.top) / rect.height;
            targetMouse.x = x * 2 - 1;
            targetMouse.y = -(y * 2 - 1);
            lastInteraction = performance.now();
        };
        const handlePointerMove = (e: PointerEvent) => {
            updatePointer(e.clientX, e.clientY);
        };
        const handlePointerLeave = () => {
            targetMouse.set(0, 0);
        };
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerdown", handlePointerMove);
        window.addEventListener("pointerleave", handlePointerLeave);
        window.addEventListener("pointercancel", handlePointerLeave);

        // --- 포인트 클라우드 지오메트리 (뒤쪽이 끊기지 않도록 크게) ---
        const geometry = new THREE.PlaneGeometry(50, 50, 250, 250);

        // --- 포인트 클라우드 쉐이더 매테리얼 ---
        const pointsMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0.0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uInteraction: { value: 0.0 },
                uColor: { value: new THREE.Color("#00d4ff") },
                uPixelRatio: { value: renderer.getPixelRatio() },
            },
            vertexShader: `
                uniform float uTime;
                uniform vec2 uMouse;
                uniform float uInteraction;
                uniform float uPixelRatio;
                varying float vElevation;
                varying float vDepth;
                varying float vEdgeFade;

                void main() {
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

                    // 가장자리 페이드 (uv 기반, 모든 방향에서 부드럽게 사라짐)
                    vec2 uvPos = uv;
                    float edgeFade = smoothstep(0.0, 0.08, uvPos.x) * smoothstep(1.0, 0.92, uvPos.x)
                                   * smoothstep(0.0, 0.08, uvPos.y) * smoothstep(1.0, 0.92, uvPos.y);
                    vEdgeFade = edgeFade;

                    // 여러 파동의 조합
                    float elevation = sin(modelPosition.x * 0.5 + uTime * 1.5) * 0.4;
                    elevation += sin(modelPosition.z * 0.8 + uTime * 1.0) * 0.3;
                    elevation += sin((modelPosition.x + modelPosition.z) * 0.3 + uTime * 0.8) * 0.2;

                    // 마우스 인터랙션: 물방울형 리플 대신 넓은 스웰 + 완만한 파도 전파
                    vec2 mousePos = uMouse * 11.0;
                    float dist = distance(modelPosition.xz, mousePos);
                    float influenceFalloff = exp(-dist * 0.18);

                    // 마우스 주변의 로컬 영역만 확실히 솟는 스웰
                    float localSwell = smoothstep(6.2, 0.0, dist);
                    float mouseInfluence = (influenceFalloff * 0.7 + localSwell * 1.75) * uInteraction;

                    // 고주파 원형 리플 대신 저주파 파도열(장파) 느낌
                    float longWave = sin(dist * 0.92 - uTime * 1.2) * localSwell * 0.08 * uInteraction;

                    // 진행 방향성이 있는 보조 물결로 실제 파도 느낌 강화
                    vec2 dir = normalize(modelPosition.xz - mousePos + vec2(0.0001));
                    float directionalWave = sin(dot(dir, vec2(0.7, 1.0)) * 2.0 - uTime * 0.9)
                                          * influenceFalloff * 0.045 * uInteraction;

                    elevation += mouseInfluence + longWave + directionalWave;

                    modelPosition.y += elevation;
                    vElevation = elevation;

                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    gl_Position = projectedPosition;

                    // 깊이에 따라 포인트 크기 조절 (가까울수록 크게, 멀수록 작게 → 3D 느낌)
                    vDepth = -viewPosition.z;
                    float sizeBase = 2.5;
                    sizeBase += mouseInfluence * 0.5;
                    gl_PointSize = sizeBase * uPixelRatio * (8.0 / vDepth);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vElevation;
                varying float vDepth;
                varying float vEdgeFade;

                void main() {
                    // 가장자리 밖 포인트는 완전히 제거
                    if (vEdgeFade < 0.01) discard;

                    // 원형 포인트 마스크
                    float dist = distance(gl_PointCoord, vec2(0.5));
                    if (dist > 0.5) discard;

                    // 부드러운 엣지
                    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

                    // 높이에 따른 색상 변화 (깊은 곳은 어둡게, 높은 곳은 밝게)
                    float depthMix = (vElevation + 0.5) * 0.6;
                    vec3 finalColor = mix(vec3(0.01, 0.05, 0.15), uColor, depthMix);

                    // 깊이에 따른 밝기 감쇠 (먼 포인트는 더 어둡게 → 깊이감)
                    float depthFade = smoothstep(25.0, 5.0, vDepth);
                    finalColor *= (0.4 + 0.6 * depthFade);

                    // 높은 파도 꼭대기에 글로우 효과
                    float glow = smoothstep(0.5, 1.5, vElevation) * 0.3;
                    finalColor += vec3(0.1, 0.3, 0.4) * glow;

                    // 가장자리 페이드 적용
                    gl_FragColor = vec4(finalColor, alpha * 0.9 * vEdgeFade);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const points = new THREE.Points(geometry, pointsMaterial);
        points.rotation.x = -Math.PI * 0.45;
        points.position.y = 2;
        scene.add(points);

        camera.position.set(0, 5, 12);

        // --- 애니메이션 루프 ---
        const clock = new THREE.Clock();
        let animationId: number;

        function animate() {
            const elapsedTime = clock.getElapsedTime();
            const idleTime = (performance.now() - lastInteraction) / 1000;
            const interaction = Math.max(0.0, 1.0 - idleTime / 1.2);

            // 유니폼 업데이트
            pointsMaterial.uniforms.uTime.value = elapsedTime;
            pointsMaterial.uniforms.uInteraction.value = interaction;

            // 마우스 위치 부드럽게 따라가기 (Lerp)
            smoothedMouse.lerp(targetMouse, 0.075);
            pointsMaterial.uniforms.uMouse.value.copy(smoothedMouse);

            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        }

        // 리사이즈
        const handleResize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener("resize", handleResize);

        animate();

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerdown", handlePointerMove);
            window.removeEventListener("pointerleave", handlePointerLeave);
            window.removeEventListener("pointercancel", handlePointerLeave);
            window.removeEventListener("resize", handleResize);
            geometry.dispose();
            pointsMaterial.dispose();
            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                inset: 0,
                background: "#000",
            }}
        />
    );
}
