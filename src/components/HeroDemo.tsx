import { useEffect, useState } from "react";
import ArsweepLogo from "@/components/ArsweepLogo";

export default function HeroDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const t = tick * 0.04;
  const sway = Math.sin(t * 0.8) * 8;
  const swayY = Math.sin(t * 1.1) * 4;
  const rotate = Math.sin(t * 0.7) * 5;

  const orbs = [
    { r: 180, speed: 0.3,   size: 7,  op: 0.28 },
    { r: 140, speed: -0.5,  size: 5,  op: 0.16 },
    { r: 220, speed: 0.2,   size: 4,  op: 0.20 },
    { r: 100, speed: 0.7,   size: 6,  op: 0.12 },
    { r: 260, speed: -0.25, size: 3,  op: 0.09 },
    { r: 160, speed: 0.6,   size: 4,  op: 0.14 },
  ];

  return (
    <div style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 0", position:"relative" }}>
      <svg width="520" height="520" viewBox="0 0 560 560" fill="none" style={{ position:"absolute" }}>
        {[260,220,180,140,100].map((r,i) => (
          <circle key={r} cx="280" cy="280" r={r}
            stroke={i===2 ? "rgba(34,211,238,0.09)" : "rgba(255,255,255,0.03)"}
            strokeWidth="1" />
        ))}
        {Array.from({length:32}).map((_,i) => {
          const a = (i/32)*Math.PI*2 + t*0.15;
          return <line key={i}
            x1={280+Math.cos(a)*256} y1={280+Math.sin(a)*256}
            x2={280+Math.cos(a)*264} y2={280+Math.sin(a)*264}
            stroke={i%4===0 ? "rgba(34,211,238,0.22)" : "rgba(255,255,255,0.04)"}
            strokeWidth={i%4===0 ? 1.5 : 0.5} />;
        })}
        {orbs.map((orb,i) => {
          const a = t*orb.speed + (i*Math.PI*2/orbs.length);
          const x = 280+Math.cos(a)*orb.r;
          const y = 280+Math.sin(a)*orb.r;
          return <g key={i}>
            <circle cx={x} cy={y} r={orb.size*2} fill={`rgba(255,255,255,${orb.op*0.08})`} />
            <circle cx={x} cy={y} r={orb.size} fill={`rgba(255,255,255,${orb.op})`} />
          </g>;
        })}
        <circle cx="280" cy="280" r={82+Math.sin(t*1.5)*7}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
        {[
          {a:-0.35, r:200, text:"Non-Custodial"},
          {a:Math.PI*0.62, r:195, text:"On-Chain"},
          {a:Math.PI*1.28, r:205, text:"Open Source"},
        ].map(({a,r,text}) => {
          const x = 280+Math.cos(a)*r;
          const y = 280+Math.sin(a)*r;
          return <g key={text}>
            <rect x={x-44} y={y-10} width={88} height={20} rx={10}
              fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <text x={x} y={y+4} textAnchor="middle" fontSize="10"
              fill="rgba(255,255,255,0.26)" fontFamily="IBM Plex Mono, monospace">{text}</text>
          </g>;
        })}
      </svg>

      {/* Logo bergoyang — translate + rotate */}
      <div style={{
        position: "relative", zIndex: 10,
        width: 240, height: 240,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `translate(${sway}px, ${swayY}px) rotate(${rotate}deg)`,
        transition: "transform 0.05s linear",
      }}>
        <ArsweepLogo className="w-24 h-24" />
      </div>
    </div>
  );
}
