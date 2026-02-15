"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader, Font } from "three/addons/loaders/FontLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const FONT_URLS = [
  "/fonts/super-woobly.typeface.json",
  "/fonts/montserrat-bold.typeface.json",
];
const TEXT = "JIYU HAN";
const LETTER_SIZE = 1.15;
const LETTER_DEPTH = 0.42;
const INTERACTION_RADIUS = 3.8;
const INTERACTION_FORCE = 2.2;
const RETURN_SPEED = 0.07;
const WOBBLE_STRENGTH = 0.18;

interface LetterState {
  mesh: THREE.Mesh;
  homePos: THREE.Vector3;
  currentPos: THREE.Vector3;
  velocity: THREE.Vector3;
  currentRotation: THREE.Euler;
  rotationVelocity: THREE.Vector3;
  phase: number;
}

export function Hero3DText() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // -- Scene --
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080d);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 9.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x06080d, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const envMap = pmremGenerator.fromScene(environment, 0.03).texture;
    scene.environment = envMap;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.55,
      0.65,
      0.82
    );
    composer.addPass(bloomPass);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
    fillLight.position.set(2.5, 3.2, 4.5);
    scene.add(fillLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));

    const chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf3f6ff,
      metalness: 1,
      roughness: 0.07,
      envMapIntensity: 2.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });

    // -- Letter group (for global rotation) --
    const letterGroup = new THREE.Group();
    scene.add(letterGroup);

    const letters: LetterState[] = [];
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2(-10, -10);
    const mouseWorld3D = new THREE.Vector3();

    let disposed = false;
    const letterGeometries: TextGeometry[] = [];
    const letterMaterials: THREE.MeshPhysicalMaterial[] = [];

    const loadFont = (url: string) =>
      new Promise<Font>((resolve, reject) => {
        const loader = new FontLoader();
        loader.load(
          url,
          (font) => resolve(font),
          undefined,
          (error) => reject(error)
        );
      });

    const loadFontWithFallback = async (): Promise<Font> => {
      for (const url of FONT_URLS) {
        try {
          if (url !== FONT_URLS[0]) {
            console.warn(
              `[Hero3DText] "${FONT_URLS[0]}" not found. Falling back to "${url}".`
            );
          }
          return await loadFont(url);
        } catch {
          continue;
        }
      }
      throw new Error("Failed to load text font");
    };

    const buildLetters = (font: Font) => {
      // Measure total width for centering
      let totalWidth = 0;
      const charWidths: number[] = [];

      for (const char of TEXT) {
        if (char === " ") {
          const spaceW = LETTER_SIZE * 0.4;
          charWidths.push(spaceW);
          totalWidth += spaceW;
          continue;
        }
        const tempGeo = new TextGeometry(char, {
          font,
          size: LETTER_SIZE,
          depth: LETTER_DEPTH,
          curveSegments: 20,
          bevelEnabled: true,
          bevelThickness: 0.025,
          bevelSize: 0.015,
          bevelSegments: 6,
        });
        tempGeo.computeBoundingBox();
        const w = tempGeo.boundingBox!.max.x - tempGeo.boundingBox!.min.x;
        charWidths.push(w);
        totalWidth += w;
        tempGeo.dispose();
      }

      // Add spacing between letters
      const spacing = LETTER_SIZE * 0.12;
      totalWidth += spacing * (TEXT.length - 1);

      let offsetX = -totalWidth / 2;

      for (let i = 0; i < TEXT.length; i++) {
        const char = TEXT[i];
        if (char === " ") {
          offsetX += charWidths[i] + spacing;
          continue;
        }

        const geo = new TextGeometry(char, {
          font,
          size: LETTER_SIZE,
          depth: LETTER_DEPTH,
          curveSegments: 24,
          bevelEnabled: true,
          bevelThickness: 0.04,
          bevelSize: 0.022,
          bevelOffset: 0,
          bevelSegments: 8,
        });
        geo.computeBoundingBox();
        geo.computeVertexNormals();
        letterGeometries.push(geo);

        // Center each letter vertically
        const box = geo.boundingBox!;
        const centerY = (box.max.y - box.min.y) / 2;
        geo.translate(0, -centerY, -LETTER_DEPTH / 2);

        const mat = chromeMaterial.clone();
        letterMaterials.push(mat);

        const mesh = new THREE.Mesh(geo, mat);
        const homePos = new THREE.Vector3(offsetX, 0, 0);
        mesh.position.copy(homePos);
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        letterGroup.add(mesh);

        letters.push({
          mesh,
          homePos: homePos.clone(),
          currentPos: homePos.clone(),
          velocity: new THREE.Vector3(),
          currentRotation: new THREE.Euler(0, 0, 0),
          rotationVelocity: new THREE.Vector3(),
          phase: Math.random() * Math.PI * 2,
        });

        offsetX += charWidths[i] + spacing;
      }
    };

    void loadFontWithFallback()
      .then((font) => {
        if (disposed) return;
        buildLetters(font);
      })
      .catch(() => {
        // Keep the scene alive even if the requested font is missing.
      });

    // -- Particles --
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xb0bdd3,
      size: 0.014,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(
      particleGeo,
      particleMat
    );
    scene.add(particles);

    // -- Mouse tracking --
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
    let isMouseOver = false;

    function onMouseMove(e: MouseEvent) {
      mouse.targetX = e.clientX / window.innerWidth;
      mouse.targetY = 1.0 - e.clientY / window.innerHeight;
      // NDC for raycasting
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      isMouseOver = true;
    }

    function onMouseLeave() {
      isMouseOver = false;
      mouseNDC.set(-10, -10);
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        mouse.targetX = t.clientX / window.innerWidth;
        mouse.targetY = 1.0 - t.clientY / window.innerHeight;
        mouseNDC.x = (t.clientX / window.innerWidth) * 2 - 1;
        mouseNDC.y = -(t.clientY / window.innerHeight) * 2 + 1;
        isMouseOver = true;
      }
    }

    function onTouchEnd() {
      isMouseOver = false;
      mouseNDC.set(-10, -10);
    }

    window.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // -- Resize --
    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // -- Animation --
    const clock = new THREE.Clock();
    let animId: number;
    const tmpVec = new THREE.Vector3();
    const tmpTarget = new THREE.Vector3();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Get mouse world position via raycasting to Z=0 plane
      if (isMouseOver && letters.length > 0) {
        raycaster.setFromCamera(mouseNDC, camera);
        raycaster.ray.intersectPlane(planeZ, mouseWorld3D);
      }

      // Update each letter
      for (const letter of letters) {
        if (isMouseOver) {
          // Distance from mouse to letter home position
          const dx = letter.homePos.x - mouseWorld3D.x;
          const dy = letter.homePos.y - mouseWorld3D.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < INTERACTION_RADIUS) {
            const force =
              ((INTERACTION_RADIUS - dist) / INTERACTION_RADIUS) *
              INTERACTION_FORCE;
            const angle = Math.atan2(dy, dx);
            letter.velocity.x += Math.cos(angle) * force * 0.065;
            letter.velocity.y += Math.sin(angle) * force * 0.065;
            letter.velocity.z += force * 0.05;

            letter.rotationVelocity.x += (Math.random() - 0.5) * force * 0.016;
            letter.rotationVelocity.y += (Math.random() - 0.5) * force * 0.016;
            letter.rotationVelocity.z += (Math.random() - 0.5) * force * 0.012;
          }
        }

        const wobble =
          Math.sin(elapsed * 2.2 + letter.phase) * WOBBLE_STRENGTH * 0.6;
        tmpTarget.set(
          letter.homePos.x,
          letter.homePos.y,
          letter.homePos.z + wobble
        );

        tmpVec.subVectors(tmpTarget, letter.currentPos);
        letter.velocity.add(tmpVec.multiplyScalar(RETURN_SPEED));

        // Damping
        letter.velocity.multiplyScalar(0.9);
        letter.rotationVelocity.multiplyScalar(0.88);

        letter.currentRotation.x += letter.rotationVelocity.x;
        letter.currentRotation.y += letter.rotationVelocity.y;
        letter.currentRotation.z += letter.rotationVelocity.z;
        letter.currentRotation.x *= 0.9;
        letter.currentRotation.y *= 0.9;
        letter.currentRotation.z *= 0.9;

        // Apply
        letter.currentPos.add(letter.velocity);
        letter.mesh.position.copy(letter.currentPos);
        letter.mesh.rotation.copy(letter.currentRotation);
      }

      // Global wobble + tilt
      letterGroup.rotation.y = (mouse.x - 0.5) * 0.18 + Math.sin(elapsed) * 0.02;
      letterGroup.rotation.x =
        (mouse.y - 0.5) * -0.1 + Math.cos(elapsed * 0.7) * 0.018;

      // Particle drift
      particles.rotation.y = elapsed * 0.02;
      particles.rotation.x = Math.sin(elapsed * 0.1) * 0.05;

      composer.render();
    }

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      particleGeo.dispose();
      particleMat.dispose();
      chromeMaterial.dispose();
      for (const geo of letterGeometries) geo.dispose();
      for (const mat of letterMaterials) mat.dispose();
      composer.dispose();
      pmremGenerator.dispose();
      envMap.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="hero-3d-container" />;
}
