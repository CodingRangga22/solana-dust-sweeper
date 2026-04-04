import { useEffect, useState } from "react";
import ArsweepLogo from "@/components/ArsweepLogo";

const SIZE = 480;
const CX = SIZE / 2;
const CY = SIZE / 2;

const RINGS = [68, 108, 152, 192, 224];

const DOTS = [
  { r: 108, speed: 1.1, offset: 0,   opacity: 0.40, size: 5 },
  { r: 108, speed: 1.1, offset: 180, opacity: 0.22, size: 4 },
  { r: 152, speed: -0.7, offset: 60,  opacity: 0.35, size: 5 },
  { r: 152, speed: -0.7, offset: 240, opacity: 0.18, size: 3 },
  { r: 192, speed: 0.45, offset: 130, opacity: 0.28, size: 5 },
  { r: 224, speed: -0.28,offset: 80,  opacity: 0.15, size: 4 },
];

const TICK_COUNT = 32;
const TICK_R = 152;

const LABELS: { text: string; x: number; y: number }[] = [
  { text: "Non-Custodial", x: CX + 148, y: CY - 178 },
  { text: "On-Chain",      x: CX - 208, y: CY + 155 },
  { text: "Open Source",   x: CX + 120, y: CY + 185 },
];

export default function HeroDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  // angle in degrees, increasing every 50ms
  const deg = tick * 1;

  // pulsing effect: slow sine wave on the innermost ring
  const pulseR = 44 + Math.sin(tick * 0.06) * 6;

  return (
    <div
      className="select-none"
      style={{ position: "relative", width: SIZE, height: SIZE }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
      >
        {/* Static rings */}
        {RINGS.map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke={`rgba(255,255,255,${i % 2 === 0 ? 0.04 : 0.06})`}
            strokeWidth="1"
          />
        ))}

        {/* Pulsing inner ring */}
        <circle
          cx={CX}
          cy={CY}
          r={pulseR}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />

        {/* Tick marks rotating on ring 3 */}
        {Array.from({ length: TICK_COUNT }).map((_, i) => {
          const a =
            (i / TICK_COUNT) * Math.PI * 2 +
            ((deg * 0.25 * Math.PI) / 180);
          const cos = Math.cos(a);
          const sin = Math.sin(a);
          const x1 = CX + (TICK_R - 6) * cos;
          const y1 = CY + (TICK_R - 6) * sin;
          const x2 = CX + (TICK_R + 6) * cos;
          const y2 = CY + (TICK_R + 6) * sin;
          return (
            <line
              key={`tick-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Orbiting dots */}
        {DOTS.map((dot, i) => {
          const a = ((deg * dot.speed + dot.offset) * Math.PI) / 180;
          const x = CX + dot.r * Math.cos(a);
          const y = CY + dot.r * Math.sin(a);
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r={dot.size / 2}
              fill={`rgba(255,255,255,${dot.opacity})`}
            />
          );
        })}

        {/* Floating labels */}
        {LABELS.map((label, i) => {
          const w = label.text.length * 7.5 + 24;
          const h = 26;
          return (
            <g key={`label-${i}`}>
              <rect
                x={label.x - w / 2}
                y={label.y - h / 2}
                width={w}
                height={h}
                rx="6"
                fill="rgba(11,15,20,0.85)"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
              <text
                x={label.x}
                y={label.y + 4.5}
                textAnchor="middle"
                fontFamily="'IBM Plex Mono', monospace"
                fontSize="10"
                fill="rgba(255,255,255,0.30)"
                letterSpacing="0.06em"
              >
                {label.text}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Center: ArsweepLogo */}
      <div
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          top: CY - 50,
          left: CX - 50,
          background: "rgba(11,15,20,0.95)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 32px rgba(0,0,0,0.6)",
        }}
      >
        <ArsweepLogo className="w-14 h-14" />
      </div>
    </div>
  );
}
