import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Zap, Copy, Check, Crown, Sparkles } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Header from "@/components/Header";
import PremiumFooter from "@/components/PremiumFooter";
import { getReferralLeaderboard, getSweepLeaderboard, getActiveSeason, type ReferralLeaderboardEntry, type SweepLeaderboardEntry, type Season } from "@/lib/supabase";
import { useReferral } from "@/hooks/useReferral";

const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];
const RANK_BG = ["bg-yellow-400/10", "bg-gray-300/10", "bg-amber-600/10"];
const formatWallet = (addr: string) => addr.slice(0, 4) + "..." + addr.slice(-4);

const PodiumCard = ({ rank, entry, isReferral }: { rank: number; entry: any; isReferral: boolean }) => {
  const colors = {
    1: { bg: "from-yellow-400/20 to-yellow-600/5", border: "border-yellow-400/40", text: "text-yellow-400", crown: "text-yellow-400", height: "h-32" },
    2: { bg: "from-gray-300/20 to-gray-400/5", border: "border-gray-300/40", text: "text-gray-300", crown: "text-gray-300", height: "h-24" },
    3: { bg: "from-amber-600/20 to-amber-700/5", border: "border-amber-600/40", text: "text-amber-500", crown: "text-amber-500", height: "h-20" },
  }[rank] ?? { bg: "", border: "", text: "", crown: "", height: "" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`flex flex-col items-center gap-2 ${rank === 1 ? "order-first sm:order-none -mt-4" : ""}`}
    >
      <Crown className={`w-5 h-5 ${colors.crown}`} />
      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center text-lg font-bold ${colors.text}`}>
        {entry ? formatWallet(entry.wallet_address ?? entry.referrer_code ?? "").slice(0, 2).toUpperCase() : "?"}
      </div>
      <p className={`text-xs font-mono font-semibold ${colors.text}`}>
        {entry ? formatWallet(entry.wallet_address ?? entry.referrer_code ?? "") : "---"}
      </p>
      <div className={`w-full bg-gradient-to-t ${colors.bg} border ${colors.border} rounded-t-xl ${colors.height} flex flex-col items-center justify-end pb-3 px-2 min-w-[80px]`}>
        <span className={`text-xl font-black ${colors.text}`}>#{rank}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">
          {entry ? (isReferral ? `${entry.referral_count} refs` : `${Number(entry.total_sol_reclaimed).toFixed(3)} SOL`) : "---"}
        </span>
      </div>
    </motion.div>
  );
};

const Leaderboard = () => {
  const { publicKey } = useWallet();
  const { user, getReferralLink } = useReferral(publicKey?.toBase58() ?? null);
  const [tab, setTab] = useState<"referral" | "sweep">("referral");
  const [referralBoard, setReferralBoard] = useState<ReferralLeaderboardEntry[]>([]);
  const [sweepBoard, setSweepBoard] = useState<SweepLeaderboardEntry[]>([]);
  const [activeSeason, setActiveSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const s = await getActiveSeason();
      setActiveSeason(s);
      if (s) {
        const [ref, sweep] = await Promise.all([getReferralLeaderboard(s.id), getSweepLeaderboard(s.id)]);
        setReferralBoard(ref);
        setSweepBoard(sweep);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleCopyLink = () => {
    const link = getReferralLink();
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const board = tab === "referral" ? referralBoard : sweepBoard;
  const top3 = board.slice(0, 3);
  const rest = board.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="orb w-[600px] h-[600px] bg-primary/10 top-1/3 -right-60 animate-float" />
      <div className="orb w-[500px] h-[500px] bg-secondary/10 bottom-0 -left-40 animate-float" style={{ animationDelay: "3s" }} />
      <Header />
      <div className="container mx-auto max-w-3xl px-4 pt-24 pb-12">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <h1 className="text-3xl font-extrabold">Leaderboard</h1>
          </div>
          {activeSeason && (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">{activeSeason.name}</span>
          )}
        </motion.div>

        {/* Prize Pool */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative glass rounded-2xl p-5 mb-6 border border-primary/20 overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-purple-500/5 pointer-events-none" />
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Season Prize Pool</p>
          </div>
          <p className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
            1,000,000<span className="text-2xl"> $SWEEP</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 animate-pulse">
              Coming Soon
            </span>
            <span className="text-xs text-muted-foreground">Token not yet launched</span>
          </div>
          {/* Reward tiers */}
          <div className="flex flex-wrap justify-center gap-2 text-xs mt-4">
              {[{ label: "#1", reward: "300,000" }, { label: "#2", reward: "200,000" }, { label: "#3", reward: "100,000" }, { label: "#4-10", reward: "30,000" }, { label: "#11-50", reward: "10,000" }, { label: "#51-100", reward: "5,000" }, { label: "#101+", reward: "1,000" }].map((r) => (
              <div key={r.label} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/40 border border-border/40 opacity-80">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="text-emerald-400 font-bold">{r.reward} $SWEEP</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Referral Link */}
        {publicKey && user && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-4 mb-6 border border-primary/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold mb-0.5">Your Referral Link</p>
                <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">{getReferralLink()}</p>
              </div>
              <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-sm font-semibold transition-all shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Code: <span className="font-mono font-bold text-primary">{user.referral_code}</span>
              {user.referred_by && <span className="ml-3">Referred by: <span className="font-mono">{user.referred_by}</span></span>}
            </p>
          </motion.div>
        )}
        {!publicKey && (
          <div className="glass rounded-2xl p-6 mb-6 border border-border/50 text-center">
            <p className="text-sm text-muted-foreground mb-3">Connect wallet to get your referral link</p>
            <WalletMultiButton className="!bg-primary !text-primary-foreground !rounded-xl !px-6 !py-2 !text-sm !font-semibold" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab("referral")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border ${tab === "referral" ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/20 border-border text-muted-foreground hover:text-foreground"}`}>
            <Users className="w-4 h-4" />Referral
          </button>
          <button onClick={() => setTab("sweep")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border ${tab === "sweep" ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/20 border-border text-muted-foreground hover:text-foreground"}`}>
            <Zap className="w-4 h-4" />Sweep
          </button>
        </div>

        {/* Podium Top 3 */}
        {!loading && board.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex items-end justify-center gap-4 mb-8 px-4"
          >
            {podiumOrder.map((entry, i) => {
              const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
              return <PodiumCard key={rank} rank={rank} entry={entry} isReferral={tab === "referral"} />;
            })}
          </motion.div>
        )}

        {/* Ranking List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass rounded-2xl overflow-hidden border border-border/50">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <div className="w-8">Rank</div>
            <div className="flex-1">Wallet</div>
            {tab === "referral" ? (
              <div className="w-20 text-right">Referrals</div>
            ) : (
              <><div className="w-20 text-right">Accounts</div><div className="w-24 text-right">$SWEEP</div></>
            )}
          </div>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse border-b border-border last:border-0">
                <div className="w-8 h-4 bg-muted rounded" /><div className="flex-1 h-4 bg-muted rounded" /><div className="w-20 h-4 bg-muted rounded" />
              </div>
            ))
          ) : rest.length === 0 && board.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground text-sm">
              {tab === "referral" ? "No referrals yet. Be the first! 🚀" : "No sweeps yet. Start sweeping! 🧹"}
            </div>
          ) : (
            (board.length <= 3 ? board : rest).map((entry: any, i) => {
              const rank = board.length <= 3 ? entry.rank : i + 4;
              return (
                <motion.div key={entry.wallet_address ?? entry.referrer_code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/20 ${(entry.wallet_address === publicKey?.toBase58()) ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                >
                  <div className="w-8 flex justify-center">
                    <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-mono font-medium">
                      {entry.wallet_address ? formatWallet(entry.wallet_address) : entry.referrer_code}
                      {entry.wallet_address === publicKey?.toBase58() && <span className="ml-2 text-xs text-primary">(you)</span>}
                    </p>
                  </div>
                  {tab === "referral" ? (
                    <div className="w-20 text-right text-sm font-semibold">{entry.referral_count}</div>
                  ) : (
                    <>
                      <div className="w-20 text-right text-sm font-semibold">{entry.total_accounts_swept}</div>
                      <div className="w-24 text-right text-xs font-bold text-emerald-400">
  {entry.rank === 1 ? "300,000" : entry.rank === 2 ? "200,000" : entry.rank === 3 ? "100,000" : entry.rank <= 10 ? "30,000" : entry.rank <= 50 ? "10,000" : entry.rank <= 100 ? "5,000" : "1,000"}$SWEEP
</div>
                    </>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
      <PremiumFooter />
    </div>
  );
};

export default Leaderboard;