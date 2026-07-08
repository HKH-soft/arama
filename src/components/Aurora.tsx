"use client";

import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useEffect, useRef } from "react";

// Aurora.css inlined into globals.css to eliminate render-blocking request

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  time?: number;
}

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.3 * height;

  float midPoint = 0.06;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  auroraAlpha = auroraAlpha * auroraAlpha;

  // Use the pure ramp color with a slight brightness boost for depth.
  // We remove the dark intensity multiplication so it doesn't look muddy on white backgrounds.
  vec3 auroraColor = rampColor * (0.9 + intensity * 0.2);

  // Rely purely on the alpha channel to fade the aurora into the CSS background
  fragColor = vec4(auroraColor, auroraAlpha);
}
`;

export default function Aurora({
  colorStops = ["#5227FF", "#7cff67", "#bcb0eb"],
  amplitude = 1.0,
  blend = 0.5,
  speed = 1.0,
  time: timeProp,
}: AuroraProps) {
  const propsRef = useRef({
    colorStops,
    amplitude,
    blend,
    speed,
    time: timeProp,
  });
  propsRef.current = { colorStops, amplitude, blend, speed, time: timeProp };

  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    let animateId = 0;
    let renderer: Renderer | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gl: any = null;
    let program: Program | null = null;
    let mesh: Mesh | null = null;
    let visible = false;

    function init() {
      if (renderer || !ctn) return;
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
      });
      gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      if ("style" in gl.canvas) {
        (gl.canvas as HTMLCanvasElement).style.backgroundColor = "transparent";
      }

      const colorStopsArray = colorStops.map((hex) => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });

      program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uAmplitude: { value: amplitude },
          uColorStops: { value: colorStopsArray },
          uResolution: { value: [ctn!.offsetWidth, ctn!.offsetHeight] },
          uBlend: { value: blend },
        },
      });

      mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
      ctn.appendChild(gl.canvas);
      resize();
    }

    function resize() {
      if (!ctn || !renderer || !program) return;
      const width = ctn.offsetWidth;
      const height = ctn.offsetHeight;
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    }
    window.addEventListener("resize", resize);

    const update = (t: number) => {
      if (!visible) {
        animateId = requestAnimationFrame(update);
        return;
      }
      animateId = requestAnimationFrame(update);
      if (!gl || !program || !renderer || !mesh) return;
      const { time = t * 0.01, speed: s = 1.0 } = propsRef.current;
      program.uniforms.uTime.value = time * s * 0.1;
      program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? 1.0;
      program.uniforms.uBlend.value = propsRef.current.blend ?? blend;
      const stops = propsRef.current.colorStops ?? colorStops;
      program.uniforms.uColorStops.value = stops.map((hex: string) => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });
      renderer.render({ scene: mesh });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !renderer) {
          init();
        }
      },
      { threshold: 0 },
    );
    observer.observe(ctn);
    visible = true;
    init();
    animateId = requestAnimationFrame(update);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);
      if (ctn && gl && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude]);

  return <div ref={ctnDom} className="aurora-container" />;
}
