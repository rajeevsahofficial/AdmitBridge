"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

const COPPER = "#C56A32";
const COPPER_LIGHT = "#E08A52";
const ease = [0.21, 0.47, 0.32, 0.98] as const;

const HUB = { x: 180, y: 104 };
const NODES = [
  { x: 40, y: 150 },
  { x: 320, y: 150 },
];
const AXIS_Y = 176;

const ARC = "M40 150 C96 150 108 36 180 36 C252 36 264 150 320 150";
const ROUTE_L = "M40 150 C92 150 112 104 180 104";
const ROUTE_R = "M320 150 C268 150 248 104 180 104";

export default function ContactSignal() {
  const reduce = !!useReducedMotion();
  // useId contains colons, which are awkward inside url(#...)
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const ref = (name: string) => `url(#${id(name)})`;

  const draw = (delay: number, duration: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0 },
          whileInView: { pathLength: 1 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration, delay, ease },
        };

  const fadeIn = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.8, delay, ease },
        };

  return (
    <svg
      viewBox="0 0 360 200"
      className="w-full max-w-[360px] overflow-visible"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* Signal arc: bright at the crown, fading to the ends */}
        <linearGradient id={id("arc")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={COPPER} stopOpacity="0.1" />
          <stop offset="0.28" stopColor={COPPER} stopOpacity="0.75" />
          <stop offset="0.5" stopColor={COPPER_LIGHT} />
          <stop offset="0.72" stopColor={COPPER} stopOpacity="0.75" />
          <stop offset="1" stopColor={COPPER} stopOpacity="0.1" />
        </linearGradient>

        <radialGradient id={id("glow")}>
          <stop offset="0" stopColor={COPPER} stopOpacity="0.24" />
          <stop offset="0.5" stopColor={COPPER} stopOpacity="0.06" />
          <stop offset="1" stopColor={COPPER} stopOpacity="0" />
        </radialGradient>

        <radialGradient id={id("halo")}>
          <stop offset="0" stopColor={COPPER_LIGHT} stopOpacity="0.9" />
          <stop offset="1" stopColor={COPPER} stopOpacity="0" />
        </radialGradient>

        {/* Dot grid that fades toward the edges */}
        <pattern id={id("dots")} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.7" fill="white" fillOpacity="0.3" />
        </pattern>
        <radialGradient id={id("vignette")} cx="50%" cy="50%" r="55%">
          <stop offset="0" stopColor="white" />
          <stop offset="1" stopColor="black" />
        </radialGradient>
        <mask id={id("mask")}>
          <rect width="360" height="170" fill={ref("vignette")} />
        </mask>

        <filter id={id("soft")} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Dot grid */}
      <rect width="360" height="170" fill={ref("dots")} mask={ref("mask")} />

      {/* Ambient glow and rings around the hub */}
      <circle cx={HUB.x} cy={HUB.y} r="64" fill={ref("glow")} />
      {[
        [52, 0.05],
        [34, 0.08],
        [18, 0.12],
      ].map(([r, o]) => (
        <circle key={r} cx={HUB.x} cy={HUB.y} r={r} stroke="white" strokeOpacity={o} strokeWidth="0.8" />
      ))}

      {/* Routes into the hub */}
      <motion.path d={ROUTE_L} stroke="white" strokeOpacity="0.24" strokeWidth="1" {...draw(0.1, 1.1)} />
      <motion.path d={ROUTE_R} stroke="white" strokeOpacity="0.24" strokeWidth="1" {...draw(0.1, 1.1)} />

      {/* Signal arc: soft glow underneath, crisp line on top */}
      <motion.path
        d={ARC}
        stroke={COPPER}
        strokeOpacity="0.35"
        strokeWidth="6"
        filter={`url(#${id("soft")})`}
        {...fadeIn(0.6)}
      />
      <motion.path d={ARC} stroke={ref("arc")} strokeWidth="1.75" strokeLinecap="round" {...draw(0.3, 1.5)} />

      {/* Vertical guides down to the axis */}
      {[NODES[0].x, HUB.x, NODES[1].x].map((x) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1={x === HUB.x ? HUB.y + 22 : 150 + 10}
          y2={AXIS_Y}
          stroke="white"
          strokeOpacity="0.14"
          strokeDasharray="2 4"
        />
      ))}

      {/* Hub */}
      <circle cx={HUB.x} cy={HUB.y} r="14" stroke={COPPER} strokeOpacity="0.45" strokeWidth="0.9" />
      <circle cx={HUB.x} cy={HUB.y} r="8" fill="#111511" stroke={COPPER} strokeWidth="1.5" />
      <circle cx={HUB.x} cy={HUB.y} r="2.75" fill={COPPER_LIGHT} />

      {/* End nodes */}
      {NODES.map((n) => (
        <g key={n.x}>
          <circle cx={n.x} cy={n.y} r="7" stroke="white" strokeOpacity="0.22" strokeWidth="0.9" />
          <circle cx={n.x} cy={n.y} r="2.75" fill={COPPER} />
        </g>
      ))}

      {/* Moving signal (omitted entirely for reduced motion) */}
      {!reduce && (
        <g opacity="0">
          <set attributeName="opacity" to="1" begin="1.8s" fill="freeze" />
          <circle r="9" fill={ref("halo")} />
          <circle r="2.4" fill="#F6BC8E" />
          <animateMotion dur="5s" begin="1.8s" repeatCount="indefinite" rotate="0" path={ARC} />
        </g>
      )}

      {/* Axis */}
      <line x1="40" x2="320" y1={AXIS_Y} y2={AXIS_Y} stroke="white" strokeOpacity="0.2" />
      <motion.line
        x1="40"
        x2="180"
        y1={AXIS_Y}
        y2={AXIS_Y}
        stroke={COPPER}
        strokeWidth="1.5"
        {...draw(0.8, 1)}
      />
      {[40, 180, 320].map((x) => (
        <line key={x} x1={x} x2={x} y1={AXIS_Y - 4} y2={AXIS_Y + 4} stroke="white" strokeOpacity="0.4" />
      ))}

      {/* Labels */}
      {[
        { x: 40, anchor: "start" as const, text: "TELL US" },
        { x: 180, anchor: "middle" as const, text: "WE PLAN" },
        { x: 320, anchor: "end" as const, text: "WE BUILD" },
      ].map((l) => (
        <text
          key={l.text}
          x={l.x}
          y="194"
          textAnchor={l.anchor}
          className="font-mono"
          fill="white"
          fillOpacity="0.6"
          fontSize="9"
          letterSpacing="1.6"
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}