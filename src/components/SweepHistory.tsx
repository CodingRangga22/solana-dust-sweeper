import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ExternalLink, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { clearSweepHistory, formatSweepDate, type SweepRecord } from "@/lib/sweepHistory";
import { EXPLORER_TX_URL } from "@/config/env";

interface SweepHistoryProps {
  walletAddress: string;
  initialRecords: SweepRecord[];
  onClear: () => void;
}

const SweepHistory = ({ walletAddress, initialRecords, onClear }: SweepHistoryProps) => {
  const [records, setRecords] = useState<SweepRecord[]>(initialRecords);
  const [expanded, setExpanded] = useState(false);

  const handleClear = () => {
    clearSweepHistory(walletAddress);
    setRecords([]);
    onClear();
  };

  if (records.length === 0) return null;

  const totalSol = records.reduce((sum, r) => sum + r.totalSolReclaimed, 0);
  const totalAccounts = records.reduce((sum, r) => sum + r.accountsClosed, 0);
  const visible = expanded ? records : records.slice(0, 3);

  return (
    <section className="px-4 pb-8">
      <div className="container mx-auto max-w-3xl">
        <div className="glass rounded-2xl overflow-hidden border border-border/50">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Sweep History</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {records.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {totalAccounts} accounts · {totalSol.toFixed(5)} SOL reclaimed
              </span>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          {/* Records */}
          <AnimatePresence>
            {visible.map((record, i) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {record.accountsClosed} account{record.accountsClosed > 1 ? "s" : ""} swept
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      record.network === "mainnet"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}>
                      {record.network}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatSweepDate(record.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary">
                    +{record.totalSolReclaimed.toFixed(5)} SOL
                  </span>
                  {record.signature && (
                    <a
                      href={EXPLORER_TX_URL(record.signature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Show more/less */}
          {records.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors border-t border-border"
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Show less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> Show {records.length - 3} more</>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default SweepHistory;
