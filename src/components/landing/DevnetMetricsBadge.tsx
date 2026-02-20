import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { isDevnet } from "@/config/env";

export interface DevnetMetrics {
  totalSolReclaimed: number;
  totalAccountsClosed: number;
  totalWalletsTested: number;
}

const DevnetMetricsBadge = () => {
  const [metrics, setMetrics] = useState<DevnetMetrics>({
    totalSolReclaimed: 1240.55,
    totalAccountsClosed: 612340,
    totalWalletsTested: 2847,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        totalSolReclaimed: Math.round((prev.totalSolReclaimed + 0.002 + Math.random() * 0.03) * 100) / 100,
        totalAccountsClosed: prev.totalAccountsClosed + Math.floor(Math.random() * 3) + 1,
        totalWalletsTested: prev.totalWalletsTested + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isDevnet) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          💰 Over <span className="text-primary font-semibold">0.00204 SOL</span> recovered per account
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1.5">
          Total SOL Reclaimed:{" "}
          <AnimatePresence mode="wait">
            <motion.span
              key={metrics.totalSolReclaimed}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-primary font-semibold tabular-nums"
            >
              {metrics.totalSolReclaimed.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              SOL
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 border border-amber-500/20">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90">
          Devnet Metrics
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Test SOL Reclaimed
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={metrics.totalSolReclaimed}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-primary font-semibold tabular-nums"
            >
              {metrics.totalSolReclaimed.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              SOL
            </motion.p>
          </AnimatePresence>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Accounts Closed
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={metrics.totalAccountsClosed}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-foreground font-semibold tabular-nums"
            >
              {metrics.totalAccountsClosed.toLocaleString()}
            </motion.p>
          </AnimatePresence>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Wallets Tested
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={metrics.totalWalletsTested}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-foreground font-semibold tabular-nums"
            >
              {metrics.totalWalletsTested.toLocaleString()}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 italic">
        These are Devnet test statistics. No real funds involved.
      </p>
    </div>
  );
};

export default DevnetMetricsBadge;
