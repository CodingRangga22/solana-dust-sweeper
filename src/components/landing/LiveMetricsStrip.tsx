import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, RefreshCw } from "lucide-react";
import { isDevnet } from "@/config/env";
import { fetchDevnetMetrics, type DevnetMetrics } from "@/lib/metrics";

const LiveMetricsStrip = () => {
  const [metrics, setMetrics] = useState<DevnetMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await fetchDevnetMetrics();
    setMetrics(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!isDevnet) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 px-4"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="glass rounded-2xl px-6 py-5 border border-amber-500/15">
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90">
                Devnet Statistics
              </span>
              {loading && (
                <RefreshCw className="w-3 h-3 text-muted-foreground animate-spin" />
              )}
            </div>
            <div className="flex gap-4 sm:gap-12">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Test SOL Reclaimed
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={metrics?.totalSolReclaimed}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-primary font-bold tabular-nums text-lg"
                  >
                    {loading || !metrics
                      ? "—"
                      : metrics.totalSolReclaimed.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) + " SOL"}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Wallets Tested
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={metrics?.totalWalletsTested}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-foreground font-bold tabular-nums text-lg"
                  >
                    {loading || !metrics ? "—" : metrics.totalWalletsTested.toLocaleString()}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Accounts Closed
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={metrics?.totalAccountsClosed}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-foreground font-bold tabular-nums text-lg"
                  >
                    {loading || !metrics ? "—" : metrics.totalAccountsClosed.toLocaleString()}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default LiveMetricsStrip;
