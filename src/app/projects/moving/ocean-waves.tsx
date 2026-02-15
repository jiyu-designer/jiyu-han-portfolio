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
        container.appendChild(renderer.domElement);

        // 마우스 좌표 추적
        const mouse = new THREE.Vector2(0, 0);
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("mousemove", handleMouseMove);

        // --- 포인트 클라우드 지오메트리 (뒤쪽이 끊기지 않도록 크게) ---
        const geometry = new THREE.PlaneGeometry(50, 50, 250, 250);

        // --- 포인트 클라우드 쉐이더 매테리얼 ---
        const pointsMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0.0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uColor: { value: new THREE.Color("#00d4ff") },
                uPixelRatio: { value: renderer.getPixelRatio() },
            },
            vertexShader: `
                uniform float uTime;
                uniform vec2 uMouse;
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

                    // 마우스 인터랙션: 마우스 근처에서 솟아오름
                    float dist = distance(modelPosition.xz, uMouse * 10.0);
                    float mouseInfluence = smoothstep(8.0, 0.0, dist) * 3.0;
                    // 마우스 근처에 잔물결 추가
                    float ripple = sin(dist * 3.0 - uTime * 4.0) * smoothstep(8.0, 1.0, dist) * 0.4;
                    elevation += mouseInfluence + ripple;

                    modelPosition.y += elevation;
                    vElevation = elevation;

                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    gl_Position = projectedPosition;

                    // 깊이에 따라 포인트 크기 조절 (가까울수록 크게, 멀수록 작게 → 3D 느낌)
                    vDepth = -viewPosition.z;
                    float sizeBase = 2.5;
                    sizeBase += mouseInfluence * 2.5;
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
        scene.add(points);

        camera.position.set(0, 5, 12);

        // --- 애니메이션 루프 ---
        const clock = new THREE.Clock();
        let animationId: number;

        function animate() {
            const elapsedTime = clock.getElapsedTime();

            // 유니폼 업데이트
            pointsMaterial.uniforms.uTime.value = elapsedTime;

            // 마우스 위치 부드럽게 따라가기 (Lerp)
            pointsMaterial.uniforms.uMouse.value.lerp(mouse, 0.05);

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
            window.removeEventListener("mousemove", handleMouseMove);
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
