import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";
import { isMainnet } from "@/config/env";

const SERVICE_FEE_PERCENT = 0.015; // 1.5%
const GAS_FEE_PER_ACCOUNT = 0.000005;

interface ActionBarProps {
  count: number;
  totalSol: number;
  onSweep: () => void;
  sweeping?: boolean;
  sweepProgress?: { currentBatch: number; totalBatches: number; confirmingSlow?: boolean } | null;
}

const ActionBar = ({ count, totalSol, onSweep, sweeping = false, sweepProgress }: ActionBarProps) => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const gasFee = GAS_FEE_PER_ACCOUNT * count;
  const serviceFee = totalSol * SERVICE_FEE_PERCENT;
  const netSol = totalSol - gasFee - serviceFee;
  const canSweep = disclaimerAccepted && !sweeping && !isMainnet;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl"
        >
          <div className="glass rounded-2xl p-4 shadow-2xl border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-sm text-foreground space-y-2 flex-1">
                <p>
                  Selected: <span className="font-bold text-primary">{count} tokens</span>
                </p>
                <div className="text-xs space-y-0.5 border-l-2 border-primary/30 pl-3">
                  <p className="font-semibold text-foreground">Transaction Summary</p>
                  <p className="text-muted-foreground">
                    Gross Refund: <span className="text-foreground">{totalSol.toFixed(5)} SOL</span>
                  </p>
                  <p className="text-muted-foreground">
                    − Network Gas: <span className="text-destructive">{gasFee.toFixed(6)} SOL</span>
                  </p>
                  <p className="text-muted-foreground">
                    − Service Fee (1.5%): <span className="text-destructive">{serviceFee.toFixed(6)} SOL</span>
                  </p>
                  <p className="text-primary font-semibold mt-1">
                    You Receive: {netSol.toFixed(5)} SOL
                  </p>
                </div>
                <label className="flex items-start gap-3 mt-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border bg-muted text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    I have read the{" "}
                    <Link to="/docs#disclaimer" className="text-primary hover:underline">
                      disclaimer
                    </Link>{" "}
                    and accept the risks. <span className="text-destructive">*</span>
                  </span>
                </label>
              </div>
              <motion.button
                whileHover={canSweep ? { scale: 1.03 } : undefined}
                whileTap={canSweep ? { scale: 0.95 } : undefined}
                onClick={canSweep ? onSweep : undefined}
                disabled={!canSweep}
                title={isMainnet ? "Sweep coming soon — mainnet program deploying" : undefined}
                className="gradient-bg gradient-bg-hover flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-primary-foreground font-semibold text-sm whitespace-nowrap transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {sweeping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {sweepProgress?.confirmingSlow
                      ? "Still confirming on network..."
                      : sweepProgress
                        ? `Batch ${sweepProgress.currentBatch} of ${sweepProgress.totalBatches}...`
                        : "Processing Transaction..."}
                  </>
                ) : isMainnet ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Sweep Coming Soon 🔒
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Sweep → {netSol.toFixed(5)} SOL
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ActionBar;
