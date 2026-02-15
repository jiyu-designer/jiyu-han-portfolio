"use client";

import { useEffect, useRef } from "react";
import {
  Renderer,
  Vec2,
  Vec4,
  Flowmap,
  Geometry,
  Texture,
  Program,
  Mesh,
} from "ogl";

const vertex = `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

const fragment = `
  precision highp float;
  precision highp int;
  uniform sampler2D tWater;
  uniform sampler2D tFlow;
  uniform sampler2D tMask;
  uniform float uTime;
  varying vec2 vUv;
  uniform vec4 res;
  uniform vec2 img;

  void main() {
    vec3 flow = texture2D(tFlow, vUv).rgb;

    vec2 uv = .5 * gl_FragCoord.xy / res.xy;

    vec2 myUV = (uv - vec2(0.5)) * res.zw + vec2(0.5);
    myUV -= flow.xy * (0.15 * 1.2);

    vec2 myUV2 = (uv - vec2(0.5)) * res.zw + vec2(0.5);
    myUV2 -= flow.xy * (0.125 * 1.2);

    vec2 myUV3 = (uv - vec2(0.5)) * res.zw + vec2(0.5);
    myUV3 -= flow.xy * (0.10 * 1.4);

    vec3 tex = texture2D(tWater, myUV).rgb;
    vec3 tex2 = texture2D(tWater, myUV2).rgb;
    vec3 tex3 = texture2D(tWater, myUV3).rgb;
    float mask = texture2D(tMask, vUv).r;
    vec3 flowColor = vec3(tex.r, tex2.g, tex3.b);
    vec3 color = mix(vec3(0.0), flowColor, mask);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const IMG_SIZE: [number, number] = [2048, 1638];
const IMG_SRC = "https://robindelaporte.fr/codepen/bg3.jpg";

interface FlowmapHeroProps {
  text?: string;
}

export function FlowmapHero({ text = "JIYU HAN" }: FlowmapHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ dpr: 2 });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    let aspect = 1;
    const mouse = new Vec2(-1);
    const velocity = new Vec2();

    const flowmap = new Flowmap(gl, {
      falloff: 0.3,
      dissipation: 0.92,
      alpha: 0.5,
    });

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    });

    const texture = new Texture(gl, {
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });
    const maskTexture = new Texture(gl, {
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });

    const img = new Image();
    img.onload = () => {
      texture.image = img;
    };
    img.crossOrigin = "Anonymous";
    img.src = IMG_SRC;

    function getAspectCover() {
      const imageAspect = IMG_SIZE[1] / IMG_SIZE[0];
      if (window.innerHeight / window.innerWidth < imageAspect) {
        return [1, window.innerHeight / window.innerWidth / imageAspect];
      }
      return [
        (window.innerWidth / window.innerHeight) * imageAspect,
        1,
      ];
    }

    const [a1Init, a2Init] = getAspectCover();

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        tWater: { value: texture },
        res: {
          value: new Vec4(
            window.innerWidth,
            window.innerHeight,
            a1Init,
            a2Init
          ),
        },
        img: { value: new Vec2(IMG_SIZE[1], IMG_SIZE[0]) },
        tFlow: flowmap.uniform,
        tMask: { value: maskTexture },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");

    function updateMaskTexture() {
      if (!maskCtx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(window.innerWidth * dpr));
      const height = Math.max(1, Math.floor(window.innerHeight * dpr));
      maskCanvas.width = width;
      maskCanvas.height = height;

      maskCtx.clearRect(0, 0, width, height);
      maskCtx.fillStyle = "#000";
      maskCtx.fillRect(0, 0, width, height);

      const fontSize = Math.min(width * 0.18, height * 0.7);
      maskCtx.fillStyle = "#fff";
      maskCtx.textAlign = "center";
      maskCtx.textBaseline = "middle";
      maskCtx.font = `900 ${fontSize}px Montserrat, sans-serif`;
      maskCtx.fillText(text.toUpperCase(), width / 2, height / 2);

      maskTexture.image = maskCanvas;
    }

    function resize() {
      gl.canvas.width = window.innerWidth * 2.0;
      gl.canvas.height = window.innerHeight * 2.0;
      gl.canvas.style.width = window.innerWidth + "px";
      gl.canvas.style.height = window.innerHeight + "px";

      const [a1, a2] = getAspectCover();
      mesh.program.uniforms.res.value = new Vec4(
        window.innerWidth,
        window.innerHeight,
        a1,
        a2
      );

      renderer.setSize(window.innerWidth, window.innerHeight);
      aspect = window.innerWidth / window.innerHeight;
      updateMaskTexture();
    }

    resize();
    window.addEventListener("resize", resize, false);

    // Mouse / touch tracking
    let lastTime = 0;
    const lastMouse = new Vec2();

    function updateMouse(e: MouseEvent | TouchEvent) {
      if ("preventDefault" in e && e.cancelable) e.preventDefault();

      let x: number, y: number;
      if ("changedTouches" in e && e.changedTouches.length) {
        x = e.changedTouches[0].pageX;
        y = e.changedTouches[0].pageY;
      } else {
        x = (e as MouseEvent).pageX;
        y = (e as MouseEvent).pageY;
      }

      mouse.set(x / gl.renderer.width, 1.0 - y / gl.renderer.height);

      if (!lastTime) {
        lastTime = performance.now();
        lastMouse.set(x, y);
      }

      const deltaX = x - lastMouse.x;
      const deltaY = y - lastMouse.y;
      lastMouse.set(x, y);

      const time = performance.now();
      const delta = Math.max(10.4, time - lastTime);
      lastTime = time;

      velocity.x = deltaX / delta;
      velocity.y = deltaY / delta;
      (velocity as Vec2 & { needsUpdate: boolean }).needsUpdate = true;
    }

    const isTouchCapable = "ontouchstart" in window;
    if (isTouchCapable) {
      container.addEventListener("touchstart", updateMouse, false);
      container.addEventListener("touchmove", updateMouse, { passive: false });
    } else {
      container.addEventListener("mousemove", updateMouse, false);
    }

    // Animation loop
    let animId: number;

    function update(t: number) {
      animId = requestAnimationFrame(update);

      const vel = velocity as Vec2 & { needsUpdate: boolean };
      if (!vel.needsUpdate) {
        mouse.set(-1);
        velocity.set(0);
      }
      vel.needsUpdate = false;

      flowmap.aspect = aspect;
      flowmap.mouse.copy(mouse);
      flowmap.velocity.lerp(
        velocity,
        velocity.len() ? 0.15 : 0.1
      );
      flowmap.update();

      program.uniforms.uTime.value = t * 0.01;
      renderer.render({ scene: mesh });
    }

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      if (isTouchCapable) {
        container.removeEventListener("touchstart", updateMouse);
        container.removeEventListener("touchmove", updateMouse);
      } else {
        container.removeEventListener("mousemove", updateMouse);
      }
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [text]);

  return (
    <div ref={containerRef} className="flowmap-container" />
  );
}
