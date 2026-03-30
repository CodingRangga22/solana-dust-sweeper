import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, RotateCcw, CheckCircle2 } from "lucide-react";

interface HeroProps {
  scanning?: boolean;
  scanned?: boolean;
  onScan?: () => void;
  onRescan?: () => void;
  sweeping?: boolean;
  accountsFound?: number;
}

const Hero = ({ scanning = false, scanned = false, onScan, onRescan, sweeping = false, accountsFound = 0 }: HeroProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleScan = () => {
    if (pathname !== "/app") { navigate("/app"); return; }
    if (onScan) onScan();
  };

  const handleRescan = () => {
    if (onRescan) onRescan();
  };

  return (
    <section className="relative pt-20 sm:pt-32 pb-16 px-4 text-center overflow-hidden">
      <div className="orb w-[400px] h-[400px] bg-primary/20 -top-40 -left-40 animate-pulse-glow" />
      <div className="orb w-[300px] h-[300px] bg-secondary/20 -top-20 right-0 animate-pulse-glow" style={{ animationDelay: "2s" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-2xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm text-muted-foreground mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Solana Wallet Cleaner
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          Clean your wallet,{" "}
          <span className="gradient-text">reclaim your SOL</span>.
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
          Find dust tokens and empty accounts. Close them and get your rent deposits back instantly.
        </p>

        {scanning ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Scanning wallet…</p>
            <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-bg"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : scanned ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {accountsFound > 0
                ? `Found ${accountsFound} sweepable account${accountsFound > 1 ? "s" : ""}`
                : "Scan complete — no sweepable accounts found"}
            </div>
            <motion.button
              whileHover={!sweeping ? { scale: 1.03 } : undefined}
              whileTap={!sweeping ? { scale: 0.97 } : undefined}
              onClick={handleRescan}
              disabled={sweeping}
              className="flex items-center gap-2 px-5 py-2 rounded-xl glass border border-border text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Rescan Wallet
            </motion.button>
            {accountsFound === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-3 mt-2"
              >
                <p className="text-xs text-muted-foreground">Your wallet is clean! Share it with your friends 🧹</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Just cleaned my Solana wallet with @Arsweep_AI — 0 dust accounts found! 🧹✨\n\nReclaim your locked SOL for free:\nhttps://arsweep.fun")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-black border border-white/10 text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4l11.733 16h4.267l-11.733-16zm0 16l6.768-6.768M20 4l-6.768 6.768"/></svg>
                    Share on X
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    href="/app?tab=referral"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold glass border border-primary/30 text-primary hover:border-primary/60 transition-all duration-200"
                  >
                    <Sparkles className="w-4 h-4" />
                    Invite Friends & Earn
                  </motion.a>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.button
            whileHover={!sweeping ? { scale: 1.03 } : undefined}
            whileTap={!sweeping ? { scale: 0.97 } : undefined}
            onClick={handleScan}
            disabled={sweeping}
            className="gradient-bg gradient-bg-hover px-8 py-3.5 rounded-2xl text-primary-foreground font-semibold text-base transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Scanning
          </motion.button>
        )}
      </motion.div>
    </section>
  );
};

export default Hero;
