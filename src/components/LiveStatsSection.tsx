import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface SweepStat {
  wallet_address: string;
  total_accounts_swept: number;
  total_sol_reclaimed: number;
  updated_at?: string;
}

interface DailyData {
  date: string;
  sol: number;
  accounts: number;
}

const M: React.CSSProperties = { fontFamily: "var(--font-mono)" };

const C = {
  fg: "hsl(var(--foreground))",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
  card: "hsl(var(--card))",
  bg: "hsl(var(--background))",
  teal: "var(--ar-teal)",
  liveDot: "#22c55e",
};

function MiniChart({ data, color = C.fg }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 0.001);
  const w = 200;
  const h = 48;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h * 0.85;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${h} ${pts} ${w},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeOpacity="0.6" strokeLinejoin="round" strokeLinecap="round" />
      {data.length > 0 && (() => {
        const last = data[data.length - 1];
        const lx = w;
        const ly = h - (last / max) * h * 0.85;
        return <circle cx={lx} cy={ly} r="3" fill={color} opacity="0.9" />;
      })()}
    </svg>
  );
}

function RecentActivity({ items }: { items: SweepStat[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {items.slice(0, 6).map((item, i) => {
        const addr = item.wallet_address;
        const short = addr.slice(0, 4) + "..." + addr.slice(-4);
        const time = item.updated_at
          ? new Date(item.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "recently";
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: i < 5 ? `1px solid ${C.border}` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: C.teal,
                boxShadow: `0 0 10px ${C.teal}`,
                animation: i === 0 ? "pulse 2s infinite" : "none",
                flexShrink: 0,
              }} />
              <span style={{ ...M, fontSize: 12, color: C.muted }}>{short}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ ...M, fontSize: 12, color: C.muted }}>
                {item.total_accounts_swept} accounts
              </span>
              <span style={{ ...M, fontSize: 12, color: C.fg, fontWeight: 600 }}>
                +{item.total_sol_reclaimed.toFixed(4)} SOL
              </span>
              <span style={{ ...M, fontSize: 10, color: C.muted }}>{time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LiveStatsSection() {
  const [stats, setStats] = useState<SweepStat[]>([]);
  const [totals, setTotals] = useState({ sol: 0, accounts: 0, wallets: 0 });
  const [chartData, setChartData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const { data } = await supabase
        .from("sweep_stats")
        .select("wallet_address, total_accounts_swept, total_sol_reclaimed, updated_at")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (data && data.length > 0) {
        setStats(data);
        const totalSol = data.reduce((a, b) => a + (b.total_sol_reclaimed || 0), 0);
        const totalAcc = data.reduce((a, b) => a + (b.total_accounts_swept || 0), 0);
        setTotals({ sol: totalSol, accounts: totalAcc, wallets: data.length });

        // Build daily chart data — last 7 days
        const days: Record<string, DailyData> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          days[key] = { date: key, sol: 0, accounts: 0 };
        }
        data.forEach(item => {
          if (!item.updated_at) return;
          const d = new Date(item.updated_at);
          const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          if (days[key]) {
            days[key].sol += item.total_sol_reclaimed || 0;
            days[key].accounts += item.total_accounts_swept || 0;
          }
        });
        setChartData(Object.values(days));
      }
    } catch (e) {
      console.error("LiveStats error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = document.getElementById('yr-activity');
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      el.style.color = entry.isIntersecting ? 'var(--ar-teal)' : C.fg;
    }, { threshold: 0.5, rootMargin: '0px 0px -80px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const solData = chartData.map(d => d.sol);
  const accData = chartData.map(d => d.accounts);
  const maxSol = Math.max(...solData, 0.001);

  return (
    <section style={{ position: "relative", zIndex: 2, padding: "80px clamp(16px, 5vw, 40px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.liveDot, boxShadow: `0 0 12px ${C.liveDot}`, display: "inline-block" }} />
            <span style={{ ...M, fontSize: 11, color: C.teal, letterSpacing: "0.12em", textTransform: "uppercase" }}>Live</span>
          </div>
          <h2 className="ar-landing-section-title" style={{ fontSize: "clamp(28px,4vw,48px)", marginBottom: 12 }}>
            Real-time <span id="yr-activity" style={{color:C.fg,transition:"color 0.6s ease"}}>Activity</span>
          </h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.6 }}>
            SOL being reclaimed across the Solana ecosystem right now.
          </p>
        </div>

        {/* Top stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 1, background: C.border, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
          {[
            { label: "Total SOL Reclaimed", value: loading ? "..." : totals.sol.toFixed(4) + " SOL" },
            { label: "Accounts Closed", value: loading ? "..." : totals.accounts.toLocaleString() },
            { label: "Wallets Cleaned", value: loading ? "..." : totals.wallets.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: "20px 16px", background: C.card, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.fg, letterSpacing: "-0.02em", marginBottom: 6 }}>{value}</div>
              <div style={{ ...M, fontSize: 11, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Activity grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>

          {/* SOL Chart */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 28px 20px", boxShadow: "var(--shadow-elevated)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ ...M, fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>SOL Reclaimed (7 days)</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: C.fg, letterSpacing: "-0.02em" }}>
                  {loading ? "..." : totals.sol.toFixed(4)}
                  <span style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginLeft: 6 }}>SOL</span>
                </div>
              </div>
            </div>

            {/* Bar chart */}
            {!loading && chartData.length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginBottom: 8 }}>
                {chartData.map((d, i) => {
                  const pct = maxSol > 0 ? (d.sol / maxSol) * 100 : 0;
                  const isLast = i === chartData.length - 1;
                  return (
                    <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: "100%", height: Math.max(pct * 0.72, 2),
                        background: isLast ? C.fg : "color-mix(in oklab, hsl(var(--foreground)) 18%, transparent)",
                        borderRadius: "3px 3px 0 0",
                        transition: "height 0.3s ease",
                        position: "relative",
                      }}>
                        {pct > 10 && (
                          <div style={{
                            position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
                            ...M, fontSize: 9, color: C.muted, whiteSpace: "nowrap",
                          }}>
                            {d.sol > 0 ? d.sol.toFixed(2) : ""}
                          </div>
                        )}
                      </div>
                      <span style={{ ...M, fontSize: 9, color: C.muted }}>{d.date.split(" ")[1]}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Line chart overlay */}
            <div style={{ marginTop: 8 }}>
              <MiniChart data={solData} color={C.teal} />
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px", boxShadow: "var(--shadow-elevated)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ ...M, fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Recent Sweeps</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.teal, display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ ...M, fontSize: 10, color: C.teal }}>LIVE</span>
              </div>
            </div>
            {loading ? (
              <div style={{ ...M, fontSize: 12, color: C.muted, textAlign: "center", padding: "20px 0" }}>Loading...</div>
            ) : stats.length === 0 ? (
              <div style={{ ...M, fontSize: 12, color: C.muted, textAlign: "center", padding: "20px 0" }}>No activity yet</div>
            ) : (
              <RecentActivity items={stats} />
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}
