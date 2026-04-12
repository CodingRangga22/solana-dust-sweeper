import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, Layers, Wallet, ArrowUpRight, ExternalLink, Clock } from "lucide-react";
import { type SweepRecord } from "@/lib/sweepHistory";

interface AnalyticsPanelProps {
  records: SweepRecord[];
  /** When true, omit the “Recent sweeps” list (e.g. use alongside `SweepHistory`). */
  hideRecentList?: boolean;
}

const formatSOL = (val: number) =>
  val < 0.0001 ? "<0.0001 SOL" : `${val.toFixed(4)} SOL`;

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const formatRelative = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f1117] border border-white/10 rounded-xl px-3 py-2.5 text-xs shadow-2xl">
      <p className="text-white/40 mb-1.5 font-mono">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold text-emerald-400">
          {formatSOL(p.value)}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({
  icon, label, value, sub, color, delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 flex flex-col gap-2"
  >
    {/* Glow accent */}
    <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 ${color}`} />
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color} bg-current/10`}>
      <span className="text-white w-3.5 h-3.5">{icon}</span>
    </div>
    <div>
      <p className="text-[11px] text-white/40 uppercase tracking-widest font-medium">{label}</p>
      <p className="text-xl font-extrabold text-white mt-0.5 font-mono tracking-tight">{value}</p>
      {sub && <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>}
    </div>
  </motion.div>
);

const AnalyticsPanel = ({ records, hideRecentList = false }: AnalyticsPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalSOL = useMemo(() => records.reduce((a, r) => a + r.totalSolReclaimed, 0), [records]);
  const totalAccounts = useMemo(() => records.reduce((a, r) => a + r.accountsClosed, 0), [records]);
  const totalSweeps = records.length;
  const avgPerSweep = totalSweeps > 0 ? totalSOL / totalSweeps : 0;

  const lineData = useMemo(() => {
    let cumulative = 0;
    return [...records].reverse().map((r) => {
      cumulative += r.totalSolReclaimed;
      return {
        date: formatDate(r.timestamp),
        SOL: parseFloat(cumulative.toFixed(6)),
      };
    });
  }, [records]);

  // Empty state
  if (records.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {/* Empty stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Wallet className="w-3.5 h-3.5" />, label: "Total SOL", value: "0.0000", color: "bg-emerald-500" },
            { icon: <Layers className="w-3.5 h-3.5" />, label: "Accounts", value: "0", color: "bg-violet-500" },
            { icon: <TrendingUp className="w-3.5 h-3.5" />, label: "Sweeps", value: "0", color: "bg-sky-500" },
            { icon: <ArrowUpRight className="w-3.5 h-3.5" />, label: "Avg / Sweep", value: "—", color: "bg-amber-500" },
          ].map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.08} />
          ))}
        </div>

        {/* Empty chart */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 flex flex-col items-center justify-center min-h-[180px] gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white/20" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/30">No data yet</p>
            <p className="text-xs text-white/20 mt-1">Your sweep history will appear here</p>
          </div>
        </div>

        {/* Empty history */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Recent Sweeps</p>
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-white/5" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-white/5 rounded" />
                  <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
                <div className="h-3 w-14 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ── Stat cards 2x2 ── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Wallet className="w-3.5 h-3.5" />}
          label="Total SOL"
          value={totalSOL.toFixed(4)}
          sub="lifetime reclaimed"
          color="bg-emerald-500"
          delay={0}
        />
        <StatCard
          icon={<Layers className="w-3.5 h-3.5" />}
          label="Accounts"
          value={totalAccounts.toString()}
          sub="total closed"
          color="bg-violet-500"
          delay={0.08}
        />
        <StatCard
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          label="Sweeps"
          value={totalSweeps.toString()}
          sub="total sessions"
          color="bg-sky-500"
          delay={0.16}
        />
        <StatCard
          icon={<ArrowUpRight className="w-3.5 h-3.5" />}
          label="Avg / Sweep"
          value={avgPerSweep.toFixed(4)}
          sub="SOL per session"
          color="bg-amber-500"
          delay={0.24}
        />
      </div>

      {/* ── SOL chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">SOL Reclaimed</p>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
            +{totalSOL.toFixed(4)} SOL
          </span>
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={lineData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="solGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="SOL"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#solGrad)"
              dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#10b981", stroke: "rgba(16,185,129,0.3)", strokeWidth: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {!hideRecentList && (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
      >
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-4">
          Recent Sweeps
        </p>

        {/* Fade-out scroll container */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
          >
            {records.map((r, i) => (
              <motion.div
                key={r.signature ?? r.timestamp}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.38 + i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors group"
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-white/80">
                      {r.accountsClosed} account{r.accountsClosed > 1 ? "s" : ""} closed
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-white/20" />
                    <p className="text-[10px] text-white/30 font-mono">
                      {formatRelative(r.timestamp)} · {formatTime(r.timestamp)}
                    </p>
                  </div>
                </div>

                {/* SOL amount + link */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="text-xs font-extrabold text-emerald-400 font-mono">
                    +{r.totalSolReclaimed.toFixed(4)}
                  </p>
                  <p className="text-[9px] text-white/20">SOL</p>
                </div>

                {r.signature && (
                  <a
                    href={`https://solscan.io/tx/${r.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/70"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          {/* Fade-out bottom mask */}
          {records.length > 4 && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none rounded-b-xl" />
          )}
        </div>
      </motion.div>
      )}
    </div>
  );
};

export default AnalyticsPanel;