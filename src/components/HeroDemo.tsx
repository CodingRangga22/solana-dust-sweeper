import { useEffect, useState } from "react";
import ArsweepLogo from "@/components/ArsweepLogo";

const CX = 280;
const CY = 280;

export default function HeroDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const t = tick * 0.04;
  const sway = Math.sin(t * 0.8) * 8;
  const swayY = Math.sin(t * 1.1) * 4;
  const rotate = Math.sin(t * 0.7) * 5;

  /** Slow counter-rotating rings (deg) — “orbit” feel */
  const rotRings = tick * 0.42;
  const rotTicks = -tick * 0.68;
  const rotInner = tick * 0.28;

  const orbs = [
    { r: 180, speed: 0.3, size: 7, op: 0.28 },
    { r: 140, speed: -0.5, size: 5, op: 0.16 },
    { r: 220, speed: 0.2, size: 4, op: 0.2 },
    { r: 100, speed: 0.7, size: 6, op: 0.12 },
    { r: 260, speed: -0.25, size: 3, op: 0.09 },
    { r: 160, speed: 0.6, size: 4, op: 0.14 },
  ];

  const strokeSoft = "color-mix(in oklab, hsl(var(--foreground)) 16%, transparent)";
  const strokeRing = "color-mix(in oklab, hsl(var(--foreground)) 26%, transparent)";
  const strokeTick = "color-mix(in oklab, hsl(var(--foreground)) 38%, transparent)";

  // Orb palette: red / green / yellow (requested).
  const orbPalette = ["#ef4444", "#22c55e", "#eab308"]; // red-500, green-500, yellow-500
  const orbFill = (i: number) => orbPalette[i % orbPalette.length];
  const orbGlow = (i: number) => orbPalette[i % orbPalette.length];
  const orbSoft = (i: number) => orbPalette[i % orbPalette.length];
  const pillFill = "color-mix(in oklab, hsl(var(--background)) 78%, transparent)";
  const pillStroke = "color-mix(in oklab, hsl(var(--foreground)) 18%, transparent)";
  const pillText = "color-mix(in oklab, hsl(var(--foreground)) 50%, transparent)";

  return (
    <div className="relative mx-auto flex h-full min-h-[280px] w-full max-w-[520px] items-center justify-center overflow-visible py-2 sm:min-h-[320px] sm:py-4">
      <svg
        width="520"
        height="520"
        viewBox="0 0 560 560"
        fill="none"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(92vw,520px)] w-[min(92vw,520px)] max-h-[520px] max-w-[520px] -translate-x-1/2 -translate-y-1/2"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <g transform={`rotate(${rotRings} ${CX} ${CY})`}>
          {[260, 220, 180, 140, 100].map((r, i) => (
            <circle
              key={r}
              cx={CX}
              cy={CY}
              r={r}
              stroke={i === 2 ? strokeRing : strokeSoft}
              strokeWidth="1"
            />
          ))}
        </g>

        <g transform={`rotate(${rotTicks} ${CX} ${CY})`}>
          {Array.from({ length: 32 }).map((_, i) => {
            const a = (i / 32) * Math.PI * 2 + t * 0.15;
            return (
              <line
                key={i}
                x1={CX + Math.cos(a) * 256}
                y1={CY + Math.sin(a) * 256}
                x2={CX + Math.cos(a) * 264}
                y2={CY + Math.sin(a) * 264}
                stroke={i % 4 === 0 ? strokeTick : strokeSoft}
                strokeWidth={i % 4 === 0 ? 1.5 : 0.5}
              />
            );
          })}
        </g>

        {orbs.map((orb, i) => {
          const a = t * orb.speed + (i * Math.PI * 2) / orbs.length;
          const x = CX + Math.cos(a) * orb.r;
          const y = CY + Math.sin(a) * orb.r;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={orb.size * 2.2} fill={orbSoft(i)} opacity={Math.min(0.18, orb.op * 0.55)} />
              <circle
                cx={x}
                cy={y}
                r={orb.size}
                fill={orbFill(i)}
                opacity={Math.min(0.95, 0.55 + orb.op)}
                style={{ filter: `drop-shadow(0 0 10px ${orbGlow(i)})` }}
              />
            </g>
          );
        })}

        <g transform={`rotate(${rotInner} ${CX} ${CY})`}>
          <circle
            cx={CX}
            cy={CY}
            r={82 + Math.sin(t * 1.5) * 7}
            stroke={strokeSoft}
            strokeWidth="1"
            fill="none"
          />
        </g>

        <g transform={`rotate(${rotRings * 0.85} ${CX} ${CY})`}>
          {[
            { a: -0.35, r: 200, text: "Non-Custodial" },
            { a: Math.PI * 0.62, r: 195, text: "On-Chain" },
            { a: Math.PI * 1.28, r: 205, text: "Open Source" },
          ].map(({ a, r, text }) => {
            const x = CX + Math.cos(a) * r;
            const y = CY + Math.sin(a) * r;
            return (
              <g key={text}>
                <rect
                  x={x - 44}
                  y={y - 10}
                  width={88}
                  height={20}
                  rx={10}
                  fill={pillFill}
                  stroke={pillStroke}
                  strokeWidth="0.5"
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill={pillText}
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {text}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div
        className="relative z-10 flex h-[min(42vw,240px)] w-[min(42vw,240px)] shrink-0 items-center justify-center sm:h-60 sm:w-60"
        style={{
          transform: `translate(${sway}px, ${swayY}px) rotate(${rotate}deg)`,
          transition: "transform 0.05s linear",
        }}
      >
        <ArsweepLogo className="h-[min(36vw,96px)] w-[min(36vw,96px)] sm:h-24 sm:w-24" />
      </div>
    </div>
  );
}
