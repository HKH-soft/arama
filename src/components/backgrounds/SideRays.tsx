"use client";

import { useRef, useEffect, useState } from "react";
import { Renderer, Program, Triangle, Mesh } from "ogl";

interface SideRaysProps {
  speed?: number;
  rayColor1?: string;
  rayColor2?: string;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255,
      ]
    : [1, 1, 1];
};

const SideRays = ({
  speed = 1.0,
  rayColor1 = "#ffaa6e",
  rayColor2 = "#96c8ff",
  className = "",
}: SideRaysProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<Record<string, { value: number | number[] }> | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const cleanupFunctionRef = useRef<(() => void) | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    if (cleanupFunctionRef.current) {
      cleanupFunctionRef.current();
      cleanupFunctionRef.current = null;
    }

    const initializeWebGL = async () => {
      if (!containerRef.current) return;

      await new Promise<void>((resolve) => setTimeout(resolve, 10));

      if (!containerRef.current) return;

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true,
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";

      while (containerRef.current!.firstChild) {
        containerRef.current!.removeChild(containerRef.current!.firstChild);
      }
      containerRef.current!.appendChild(gl.canvas);

      const vert = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      const frag = `precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0) *
    clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);
  vec2 rayRefDir1 = normalize(vec2(1.0, 1.0));
  vec2 rayRefDir2 = normalize(vec2(1.0, 0.241));

  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, coord, 36.2214, 21.11349, iSpeed);
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, coord, 22.3991, 18.0234, iSpeed * 0.2);

  vec4 color = rays1 * 0.2 + rays2 * 0.7;

  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
  float brightness = 0.4 / (distanceToLight * distanceToLight);
  color.rgb *= brightness;
  color.a = max(color.r, max(color.g, color.b));

  gl_FragColor = color;
}`;

      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] as number[] },
        iSpeed: { value: speed },
        iRayColor1: { value: hexToRgb(rayColor1) as number[] },
        iRayColor2: { value: hexToRgb(rayColor2) as number[] },
      };
      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: vert,
        fragment: frag,
        uniforms,
      });
      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const updateSize = () => {
        if (!containerRef.current || !renderer) return;
        renderer.dpr = Math.min(window.devicePixelRatio, 2);
        const { clientWidth: w, clientHeight: h } = containerRef.current;
        renderer.setSize(w, h);
        uniforms.iResolution.value = [w * renderer.dpr, h * renderer.dpr];
      };

      const loop = (t: number) => {
        if (
          !rendererRef.current ||
          !uniformsRef.current ||
          !meshRef.current
        )
          return;
        uniforms.iTime.value = t * 0.001;
        try {
          renderer.render({ scene: mesh });
          animationIdRef.current = requestAnimationFrame(loop);
        } catch (e) {
          return;
        }
      };

      window.addEventListener("resize", updateSize);
      updateSize();
      animationIdRef.current = requestAnimationFrame(loop);

      cleanupFunctionRef.current = () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
        window.removeEventListener("resize", updateSize);
        if (renderer) {
          try {
            const loseCtx = renderer.gl.getExtension("WEBGL_lose_context");
            if (loseCtx) loseCtx.loseContext();
            const canvas = renderer.gl.canvas;
            if (canvas && canvas.parentNode)
              canvas.parentNode.removeChild(canvas);
          } catch (e) {}
        }
        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
      };
    };

    initializeWebGL();

    return () => {
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
    };
  }, [isVisible, speed, rayColor1, rayColor2]);

  useEffect(() => {
    if (!uniformsRef.current) return;
    uniformsRef.current.iSpeed.value = speed;
    uniformsRef.current.iRayColor1.value = hexToRgb(rayColor1);
    uniformsRef.current.iRayColor2.value = hexToRgb(rayColor2);
  }, [speed, rayColor1, rayColor2]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden pointer-events-none ${className}`.trim()}
    />
  );
};

export default SideRays;
