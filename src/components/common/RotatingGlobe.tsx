"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";

/**
 * Rotating globe: cream sphere, dark continents, copper orbit rings.
 * Canvas + d3-geo (orthographic). Land data loads lazily from world-atlas.
 *
 *   npm i d3-geo topojson-client world-atlas
 *   npm i -D @types/d3-geo @types/topojson-client
 */

const COPPER = "197,106,50";
const SPIN_DEG_PER_SEC = 7; // one full turn in ~51s
const TILT = -16; // view tilt of the globe, degrees

// [lon, lat]
const CITIES: [number, number][] = [
  [-74, 40.7], // 0 New York
  [-99.1, 19.4], // 1 Mexico City
  [-46.6, -23.5], // 2 Sao Paulo
  [-74.1, 4.7], // 3 Bogota
  [3.4, 6.5], // 4 Lagos
  [36.8, -1.3], // 5 Nairobi
  [-0.1, 51.5], // 6 London
  [31.2, 30], // 7 Cairo
  [55.3, 25.2], // 8 Dubai
  [72.9, 19.1], // 9 Mumbai
  [103.8, 1.35], // 10 Singapore
];

const LINKS: [number, number][] = [
  [0, 6], [6, 8], [8, 10], [2, 4], [0, 1], [4, 5], [9, 10], [1, 2], [3, 2], [7, 8],
];

// Orbit rings. r is in globe radii. tilt leans the plane out of the screen,
// roll turns it within the screen, and the roll drifts slowly so the rings breathe.
type Ring = {
  r: number;
  tilt: number;
  roll: number;
  drift: number;
  speed: number;
  phase: number;
  alpha: number;
  width: number;
  satellite?: boolean;
  ticks?: number;
};

const RINGS: Ring[] = [
  // Primary orbit, carries the satellite and its trail
  { r: 1.3, tilt: 74, roll: -14, drift: 3, speed: 0.25, phase: 0, alpha: 1, width: 1.7, satellite: true },
  // Inner counter-orbit
  { r: 1.18, tilt: 79, roll: 11, drift: 3, speed: 0.2, phase: 1.4, alpha: 0.7, width: 1.1 },
  // Outer graduated scale, like an instrument bezel
  { r: 1.36, tilt: 72, roll: 4, drift: 2, speed: 0.15, phase: 2.6, alpha: 0.45, width: 0.8, ticks: 120 },
];

function ringPoint(ring: Ring, roll: number, th: number, scale = 1) {
  const a = (ring.tilt * Math.PI) / 180;
  const b = (roll * Math.PI) / 180;
  const x = ring.r * scale * Math.cos(th);
  const y0 = ring.r * scale * Math.sin(th);
  const y1 = y0 * Math.cos(a);
  const z = y0 * Math.sin(a);
  return {
    x: x * Math.cos(b) - y1 * Math.sin(b),
    y: x * Math.sin(b) + y1 * Math.cos(b),
    z,
  };
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Warm copper, lifting toward a lighter tone as the ring nears the viewer
const tone = (depth: number, alpha: number) =>
  `rgba(${Math.round(197 + 40 * depth)},${Math.round(106 + 50 * depth)},${Math.round(50 + 45 * depth)},${alpha})`;

function drawRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  ring: Ring,
  t: number,
  front: boolean,
  satelliteAngle: number
) {
  const roll = ring.roll + ring.drift * Math.sin(t * ring.speed + ring.phase);
  const pt = (th: number, scale = 1) => ringPoint(ring, roll, th, scale);
  const onPass = (z: number) => (front ? z >= 0 : z < 0);
  const depthOf = (z: number) => clamp01((z / ring.r + 1) / 2); // 0 far, 1 near
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    ctx.beginPath();
    ctx.moveTo(cx + a.x * R, cy - a.y * R);
    ctx.lineTo(cx + b.x * R, cy - b.y * R);
    ctx.stroke();
  };

  // Curve: each short segment is styled by depth, so the ring thickens and
  // brightens toward the viewer and fades smoothly as it recedes.
  ctx.lineCap = "butt";
  const N = 160;
  let prev = pt(0);
  for (let i = 1; i <= N; i++) {
    const p = pt((i / N) * Math.PI * 2);
    const z = (prev.z + p.z) / 2;
    if (onPass(z)) {
      const d = depthOf(z);
      ctx.lineWidth = ring.width * (0.55 + 0.9 * d);
      ctx.strokeStyle = tone(d, ring.alpha * (0.16 + 0.84 * Math.pow(d, 1.4)));
      seg(prev, p);
    }
    prev = p;
  }

  // Graduated ticks (every tenth is longer)
  if (ring.ticks) {
    ctx.lineWidth = 0.8;
    for (let i = 0; i < ring.ticks; i++) {
      const th = (i / ring.ticks) * Math.PI * 2;
      const a = pt(th);
      if (!onPass(a.z)) continue;
      const d = depthOf(a.z);
      ctx.strokeStyle = tone(d, ring.alpha * (0.2 + 0.8 * d));
      seg(a, pt(th, i % 10 === 0 ? 1.055 : 1.028));
    }
  }

  // Satellite with a fading comet trail
  if (ring.satellite) {
    ctx.lineCap = "round";
    const TRAIL = 28;
    const STEP = 0.028;
    for (let k = 0; k < TRAIL; k++) {
      const a = pt(satelliteAngle - k * STEP);
      const b = pt(satelliteAngle - (k + 1) * STEP);
      if (!onPass((a.z + b.z) / 2)) continue;
      const f = 1 - k / TRAIL;
      ctx.lineWidth = 0.8 + 2.2 * f;
      ctx.strokeStyle = `rgba(255,176,112,${0.85 * f * f})`;
      seg(a, b);
    }

    const head = pt(satelliteAngle);
    if (onPass(head.z)) {
      const sx = cx + head.x * R;
      const sy = cy - head.y * R;
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14);
      glow.addColorStop(0, `rgba(255,190,130,${front ? 0.95 : 0.5})`);
      glow.addColorStop(1, `rgba(${COPPER},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sx, sy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = front ? "#FFE2C4" : "rgba(255,226,196,0.5)";
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default function RotatingGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let lon = -62; // start facing the Americas
    let t = 0;
    let visible = true;
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let land: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let borders: any = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.335;
      const cx = w / 2;
      const cy = h * 0.46;

      const projection = geoOrthographic()
        .translate([cx, cy])
        .scale(R)
        .clipAngle(90)
        .rotate([lon, TILT, 0]);
      const path = geoPath(projection, ctx);
      const satelliteAngle = t * 0.45;

      // Ground shadow
      const sy = cy + R * 1.1;
      ctx.save();
      ctx.translate(0, sy);
      ctx.scale(1, 0.13);
      ctx.translate(0, -sy);
      const shadow = ctx.createRadialGradient(cx, sy, 0, cx, sy, R * 1.1);
      shadow.addColorStop(0, "rgba(90,60,30,0.32)");
      shadow.addColorStop(1, "rgba(90,60,30,0)");
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(cx, sy, R * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Rings, far side
      RINGS.forEach((ring) => drawRing(ctx, cx, cy, R, ring, t, false, satelliteAngle));

      // Sphere
      const base = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R * 1.05);
      base.addColorStop(0, "#FBF8F0");
      base.addColorStop(0.55, "#EFE7D8");
      base.addColorStop(1, "#CDBFA6");
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = base;
      ctx.fill();

      // Graticule
      ctx.beginPath();
      path(geoGraticule10());
      ctx.strokeStyle = "rgba(110,90,60,0.16)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Land and borders
      if (land) {
        ctx.beginPath();
        path(land);
        ctx.fillStyle = "rgba(74,66,56,0.94)";
        ctx.fill();
      }
      if (borders) {
        ctx.beginPath();
        path(borders);
        ctx.strokeStyle = "rgba(240,232,215,0.28)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Connections
      ctx.lineCap = "round";
      ctx.strokeStyle = `rgba(${COPPER},0.4)`;
      ctx.lineWidth = 0.8;
      LINKS.forEach(([a, b]) => {
        ctx.beginPath();
        path({ type: "LineString", coordinates: [CITIES[a], CITIES[b]] });
        ctx.stroke();
      });

      // City nodes (only those on the visible hemisphere)
      const centre = projection.invert?.([cx, cy]);
      if (centre) {
        CITIES.forEach((city, i) => {
          if (geoDistance(city, centre as [number, number]) > Math.PI / 2 - 0.04) return;
          const p = projection(city);
          if (!p) return;
          const pulse = 0.65 + 0.35 * Math.sin(t * 2 + i * 1.7);
          const glow = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 9);
          glow.addColorStop(0, `rgba(255,170,100,${0.85 * pulse})`);
          glow.addColorStop(1, `rgba(${COPPER},0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#FFD2A6";
          ctx.beginPath();
          ctx.arc(p[0], p[1], 1.4, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Lighting: darken toward the lower-right limb
      ctx.save();
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.clip();
      const shade = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.35, cx, cy, R * 1.05);
      shade.addColorStop(0, "rgba(255,248,235,0)");
      shade.addColorStop(1, "rgba(70,45,20,0.34)");
      ctx.fillStyle = shade;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();

      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.strokeStyle = "rgba(140,110,70,0.25)";
      ctx.lineWidth = 0.75;
      ctx.stroke();

      // Rings, near side
      RINGS.forEach((ring) => drawRing(ctx, cx, cy, R, ring, t, true, satelliteAngle));
    };

    resize();
    draw();

    import("world-atlas/countries-110m.json").then((mod) => {
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const world: any = (mod as any).default ?? mod;
      land = feature(world, world.objects.land);
      borders = mesh(world, world.objects.countries, (a: unknown, b: unknown) => a !== b);
      draw();
    });

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    let io: IntersectionObserver | undefined;
    if (!reduce) {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(canvas);

      let last = performance.now();
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (!visible) return;
        lon += dt * SPIN_DEG_PER_SEC;
        t += dt;
        draw();
      };
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io?.disconnect();
    };
  }, [reduce]);

  return (
    <div className="relative flex w-full items-center justify-center md:pt-20">
      <div
        role="img"
        aria-label="A rotating globe encircled by orbit rings, representing technology, growth and education"
        className="relative aspect-square w-full"
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="absolute inset-0"
        >
          <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
        </motion.div>

        {/* Tagline */}
        <p className="absolute right-[2%] top-[4%] border-l border-[#111511]/70 pl-3 text-[12px] leading-[1.45] text-[#111511] sm:text-[13px]">
          One partner.
          <br />
          Three capabilities.
        </p>

        {/* Discipline labels */}
        <div className="absolute left-[1%] top-[24%] items-center gap-3 flex">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#4E4D48]">
            Technology
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#C56A32]" />
        </div>
        <div className="absolute right-[2%] top-[36%] items-center gap-3 flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C56A32]" />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#4E4D48]">
            Growth
          </span>
        </div>
        <div className="absolute right-[2%] top-[66%] items-center gap-3 flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C56A32]" />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#4E4D48]">
            Education
          </span>
        </div>
      </div>
    </div>
  );
}