import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Zap, Copy, Check, Crown } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Header from "@/components/Header";
import PremiumFooter from "@/components/PremiumFooter";
import { getReferralLeaderboard, getSweepLeaderboard, getActiveSeason, type ReferralLeaderboardEntry, type SweepLeaderboardEntry, type Season } from "@/lib/supabase";
import { useReferral } from "@/hooks/useReferral";

const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];
const RANK_BG = ["bg-yellow-400/10", "bg-gray-300/10", "bg-amber-600/10"];
const formatWallet = (addr: string) => addr.slice(0, 4) + "..." + addr.slice(-4);

const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
  if (rank === 2) return <Crown className="w-4 h-4 text-gray-300" />;
  if (rank === 3) return <Crown className="w-4 h-4 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
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

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="orb w-[600px] h-[600px] bg-primary/10 top-1/3 -right-60 animate-float" />
      <div className="orb w-[500px] h-[500px] bg-secondary/10 bottom-0 -left-40 animate-float" style={{ animationDelay: "3s" }} />
      <Header />
      <div className="container mx-auto max-w-3xl px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <h1 className="text-3xl font-extrabold">Leaderboard</h1>
          </div>
          {activeSeason && (
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">{activeSeason.name}</span>
            </div>
          )}
        </motion.div>
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
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("referral")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border ${tab === "referral" ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/20 border-border text-muted-foreground hover:text-foreground"}`}>
            <Users className="w-4 h-4" />Referral
          </button>
          <button onClick={() => setTab("sweep")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border ${tab === "sweep" ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/20 border-border text-muted-foreground hover:text-foreground"}`}>
            <Zap className="w-4 h-4" />Sweep
          </button>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass rounded-2xl overflow-hidden border border-border/50">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <div className="w-8">Rank</div>
            <div className="flex-1">Wallet</div>
            {tab === "referral" ? (
              <><div className="w-20 text-right">Referrals</div></>
            ) : (
              <><div className="w-20 text-right">Accounts</div><div className="w-24 text-right">SOL</div></>
            )}
          </div>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse border-b border-border last:border-0">
                <div className="w-8 h-4 bg-muted rounded" /><div className="flex-1 h-4 bg-muted rounded" /><div className="w-20 h-4 bg-muted rounded" /><div className="w-24 h-4 bg-muted rounded" />
              </div>
            ))
          ) : tab === "referral" ? (
            referralBoard.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground text-sm">No referrals yet. Be the first! 🚀</div>
            ) : (
              referralBoard.map((entry, i) => (
                <motion.div key={entry.referrer_code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={`flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0 ${entry.rank <= 3 ? RANK_BG[entry.rank - 1] : "hover:bg-muted/20"} ${entry.wallet_address === publicKey?.toBase58() ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                  <div className="w-8 flex justify-center"><RankBadge rank={entry.rank} /></div>
                  <div className="flex-1">
                    <p className={`text-sm font-mono font-medium ${entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : ""}`}>
                      {entry.wallet_address ? formatWallet(entry.wallet_address) : entry.referrer_code}
                      {entry.wallet_address === publicKey?.toBase58() && <span className="ml-2 text-xs text-primary">(you)</span>}
                    </p>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold">{entry.referral_count}</div>
                </motion.div>
              ))
            )
          ) : (
            sweepBoard.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground text-sm">No sweeps yet. Start sweeping! 🧹</div>
            ) : (
              sweepBoard.map((entry, i) => (
                <motion.div key={entry.wallet_address} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={`flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0 ${entry.rank <= 3 ? RANK_BG[entry.rank - 1] : "hover:bg-muted/20"} ${entry.wallet_address === publicKey?.toBase58() ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                  <div className="w-8 flex justify-center"><RankBadge rank={entry.rank} /></div>
                  <div className="flex-1">
                    <p className={`text-sm font-mono font-medium ${entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : ""}`}>
                      {formatWallet(entry.wallet_address)}
                      {entry.wallet_address === publicKey?.toBase58() && <span className="ml-2 text-xs text-primary">(you)</span>}
                    </p>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold">{entry.total_accounts_swept}</div>
                  <div className="w-24 text-right text-sm">{Number(entry.total_sol_reclaimed).toFixed(4)} SOL</div>
                </motion.div>
              ))
            )
          )}
        </motion.div>
      </div>
      <PremiumFooter />
    </div>
  );
};

export default Leaderboard;
