"use client";

import { Renderer, Program, Mesh, Triangle } from "ogl";
import { useEffect, useRef } from "react";

import "./Beams.css";

interface BeamsProps {
  beamCount?: number;
  speed?: number;
  brightness?: number;
  color1?: string;
  color2?: string;
  noiseIntensity?: number;
  spread?: number;
}

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseIntensity;
uniform float uBeamCount;
uniform float uSpread;

float hash(float n) { return fract(sin(n) * 43758.5453123); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i.x + i.y * 57.0);
  float b = hash(i.x + 1.0 + i.y * 57.0);
  float c = hash(i.x + (i.y + 1.0) * 57.0);
  float d = hash(i.x + 1.0 + (i.y + 1.0) * 57.0);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float beam(vec2 uv, float x, float width, float t) {
  float d = abs(uv.x - x);
  float core = smoothstep(width, 0.0, d);
  float glow = smoothstep(width * 3.0, 0.0, d) * 0.5;

  float n = noise(vec2(uv.x * 3.0 + t * 0.5, uv.y * 2.0 - t * 0.3)) * uNoiseIntensity;
  float flicker = 0.7 + 0.3 * sin(t * 2.0 + x * 10.0);

  float vertFade = smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.6, uv.y);

  return (core + glow) * flicker * vertFade * (0.8 + n * 0.2);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float t = uTime * uSpeed;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 20.0; i += 1.0) {
    if (i >= uBeamCount) break;
    float fi = i / uBeamCount;
    float x = hash(i * 13.37) * uSpread + (1.0 - uSpread) * 0.5;
    float w = 0.005 + hash(i * 7.77) * 0.015;
    float phase = hash(i * 3.33) * 6.28;

    float b = beam(uv, x + sin(t * 0.3 + phase) * 0.02, w, t + phase);

    vec3 beamColor = mix(uColor1, uColor2, fi + sin(t * 0.5 + phase) * 0.2);
    col += b * beamColor;
  }

  col *= uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`;

export default function Beams({
  beamCount = 12,
  speed = 1.0,
  brightness = 1.5,
  color1 = "#8fa7c4",
  color2 = "#a3c4bc",
  noiseIntensity = 1.0,
  spread = 0.8,
}: BeamsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    let program: Program;

    function resize() {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      if (program) {
        program.uniforms.uResolution.value = [
          gl.canvas.width,
          gl.canvas.height,
        ];
      }
    }
    window.addEventListener("resize", resize);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uSpeed: { value: speed },
        uBrightness: { value: brightness },
        uColor1: { value: hexToVec3(color1) },
        uColor2: { value: hexToVec3(color2) },
        uNoiseIntensity: { value: noiseIntensity },
        uBeamCount: { value: beamCount },
        uSpread: { value: spread },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    let animationFrameId: number;

    function update(time: number) {
      animationFrameId = requestAnimationFrame(update);
      program.uniforms.uTime.value = time * 0.001;
      renderer.render({ scene: mesh });
    }
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [speed, brightness, color1, color2, noiseIntensity, beamCount, spread]);

  return <div ref={containerRef} className="beams-container" />;
}
