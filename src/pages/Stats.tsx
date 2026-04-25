import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, RefreshCw, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import PremiumFooter from "@/components/PremiumFooter";
import { getActiveSeason, getGlobalSweepTotals, type GlobalSweepTotals, getSweepLeaderboard, type Season, type SweepLeaderboardEntry } from "@/lib/supabase";
import { getGlobalRevokeTotals } from "@/lib/revokeHistory";

const short = (addr: string) => `${addr.slice(0, 4)}…${addr.slice(-4)}`;

export default function Stats() {
  const navigate = useNavigate();
  const revokeTrackingEnabled = (import.meta.env.VITE_REVOKE_USE_SUPABASE_HISTORY ?? "").toString() === "true";
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<GlobalSweepTotals>({ wallets: 0, totalAccounts: 0, totalSol: 0 });
  const [revokeApprovals, setRevokeApprovals] = useState<number | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [topSweepers, setTopSweepers] = useState<SweepLeaderboardEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const s = await getActiveSeason();
        if (cancelled) return;
        setSeason(s);

        const [global, top] = await Promise.all([
          getGlobalSweepTotals({ maxRows: 10_000 }),
          s ? getSweepLeaderboard(s.id, 10) : Promise.resolve([]),
        ]);
        const revoke = await getGlobalRevokeTotals({ maxRows: 10_000 });
        if (cancelled) return;
        setTotals(global);
        setTopSweepers(top);
        // When tracking is enabled, show 0 instead of an "enable" prompt.
        setRevokeApprovals(
          revokeTrackingEnabled ? revoke.approvalsRevoked : revoke.approvalsRevoked > 0 ? revoke.approvalsRevoked : null
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const prettySol = useMemo(() => {
    const v = totals.totalSol;
    if (v >= 1000) return `${v.toFixed(0)} SOL`;
    if (v >= 10) return `${v.toFixed(1)} SOL`;
    return `${v.toFixed(3)} SOL`;
  }, [totals.totalSol]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="orb w-[600px] h-[600px] bg-primary/10 top-1/3 -right-60 animate-float" />
      <div className="orb w-[500px] h-[500px] bg-secondary/10 bottom-0 -left-40 animate-float" style={{ animationDelay: "3s" }} />

      <Header />

      <div className="container mx-auto max-w-4xl px-4 pt-24 pb-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <button
            type="button"
            onClick={() => navigate("/app")}
            className="ar-btn-primary"
          >
            Sweep my wallet
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight">Ecosystem Proof</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Live counters from on-chain sweeps tracked in our public stats table. This is the “proof” we show judges.
          </p>
          {season ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-mono text-muted-foreground">
              Active season: <span className="text-foreground">{season.name}</span>
            </div>
          ) : null}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3 sm:grid-cols-3 mb-3">
          {[
            { label: "Wallets cleaned", value: totals.wallets.toLocaleString(), sub: "unique wallets (tracked)" },
            { label: "Accounts closed", value: totals.totalAccounts.toLocaleString(), sub: "total token accounts" },
            { label: "SOL reclaimed", value: prettySol, sub: "rent returned to users" },
          ].map((c) => (
            <div key={c.label} className="surface-premium rounded-2xl p-5 ring-1 ring-border">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-mono">{c.label}</p>
              <div className="mt-2 text-2xl font-black text-foreground">{loading ? "—" : c.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
            </div>
          ))}
        </motion.div>

        {revokeApprovals !== null ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <div className="surface-premium rounded-2xl p-5 ring-1 ring-border">
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-mono">Approvals revoked</p>
              <div className="mt-2 text-2xl font-black text-foreground">{loading ? "—" : revokeApprovals.toLocaleString()}</div>
              <p className="mt-1 text-xs text-muted-foreground">delegate approvals removed (tracked)</p>
              <div className="mt-3">
                <Link to="/revoke" className="text-sm text-primary hover:underline">Scan & revoke approvals →</Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="mb-8 surface-premium rounded-2xl p-5 ring-1 ring-border">
            <p className="text-sm font-semibold text-foreground">Want security traction too?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enable Supabase revoke history (`VITE_REVOKE_USE_SUPABASE_HISTORY=true`) to track approvals revoked globally.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-lg font-bold">Top sweepers</h2>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <div className="glass rounded-2xl overflow-hidden border border-border/50">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <div className="w-12">Rank</div>
            <div className="flex-1">Wallet</div>
            <div className="w-28 text-right">Accounts</div>
            <div className="w-28 text-right">SOL</div>
          </div>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse border-b border-border last:border-0">
                <div className="w-12 h-4 bg-muted rounded" />
                <div className="flex-1 h-4 bg-muted rounded" />
                <div className="w-28 h-4 bg-muted rounded" />
                <div className="w-28 h-4 bg-muted rounded" />
              </div>
            ))
          ) : topSweepers.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground text-sm">
              No sweeps tracked yet.
            </div>
          ) : (
            topSweepers.map((e, i) => (
              <div key={`${e.wallet_address}-${i}`} className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/20">
                <div className="w-12 font-mono text-xs text-muted-foreground">#{e.rank}</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-mono text-sm text-foreground">{short(e.wallet_address)}</p>
                </div>
                <div className="w-28 text-right font-mono text-xs text-foreground">{Number(e.total_accounts_swept).toLocaleString()}</div>
                <div className="w-28 text-right font-mono text-xs text-emerald-400">{Number(e.total_sol_reclaimed).toFixed(4)}</div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 surface-premium rounded-2xl p-5 ring-1 ring-border">
          <p className="text-sm font-semibold text-foreground mb-2">What this proves</p>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>Every sweep is a signed Solana transaction (user-controlled).</li>
            <li>We measure real rent reclaimed and accounts closed.</li>
            <li>These counters are what we’ll put in the hackathon pitch.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="https://solscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Verify on Solscan
            </a>
            <Link
              to="/docs/security"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              Read security model
            </Link>
            <Link
              to="/docs/fees"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              Fee model (auditable)
            </Link>
          </div>
        </div>
      </div>

      <PremiumFooter />
    </div>
  );
}

