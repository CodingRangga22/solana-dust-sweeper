import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";
import { isMainnet } from "@/config/env";

interface ActionBarProps {
  count: number;
  /** Rent + optional Jupiter→SOL (swap) estimate */
  grossSol: number;
  /** 1.5% of rent only (matches close-account path) */
  serviceFeeSol: number;
  gasFeeSol: number;
  netSol: number;
  hasSwapEstimate?: boolean;
  disclaimerNote?: string;
  onSweep: () => void;
  sweeping?: boolean;
  pendingTx?: string | null;
  sweepProgress?: { currentBatch: number; totalBatches: number; confirmingSlow?: boolean } | null;
}

const ActionBar = ({
  count,
  grossSol,
  serviceFeeSol,
  gasFeeSol,
  netSol,
  hasSwapEstimate = false,
  disclaimerNote,
  onSweep,
  sweeping = false,
  pendingTx = null,
  sweepProgress,
}: ActionBarProps) => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [open, setOpen] = useState(true);
  const isBusy = sweeping || !!pendingTx;
  const canSweep = disclaimerAccepted && !isBusy;

  // Reset open state when new tokens selected
  useEffect(() => { if (count > 0) setOpen(true); }, [count]);

  return (
    <AnimatePresence>
      {count > 0 && open && (
        <>
        <div className="fixed inset-0 bg-black/60 sm:hidden z-[49]" onClick={() => setOpen(false)} />
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 sm:inset-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 z-[50] sm:w-[calc(100%-2rem)] sm:max-w-xl flex items-end sm:items-stretch"
        >
          <div
            className="surface-premium w-full rounded-t-2xl sm:rounded-2xl p-5 shadow-premium-lg"
          >
            <div className="flex flex-col gap-3">
              <div className="text-sm text-foreground space-y-2 flex-1">
                <p>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Selected:</span>{" "}<span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "#FFFFFF" }}>{count} accounts</span>
                </p>
                <div className="text-xs space-y-0.5 border-l-2 border-primary/30 pl-3">
                  <p className="font-semibold text-foreground">Transaction Summary</p>
                  <p className="text-muted-foreground">
                    Gross (est.): <span className="text-foreground">{grossSol.toFixed(5)} SOL</span>
                    {hasSwapEstimate && (
                      <span className="block text-[10px] text-muted-foreground/90 mt-0.5 leading-snug">
                        Includes Jupiter swap output + rent. Wallet may differ with priority fees and routes.
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    − Network (est.): <span className="text-destructive">{gasFeeSol.toFixed(6)} SOL</span>
                  </p>
                  <p className="text-muted-foreground">
                    − Service (1.5% of rent): <span className="text-destructive">{serviceFeeSol.toFixed(6)} SOL</span>
                  </p>
                  <p className="text-primary font-semibold mt-1">
                    You Receive (est.): {Math.max(netSol, 0).toFixed(5)} SOL
                  </p>
                  {disclaimerNote && (
                    <p className="text-[10px] text-amber-400/90 mt-1">{disclaimerNote}</p>
                  )}
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
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {sweepProgress?.confirmingSlow
                      ? "Still confirming on network..."
                      : sweepProgress
                        ? `Batch ${sweepProgress.currentBatch} of ${sweepProgress.totalBatches}...`
                        : pendingTx
                          ? "Transaction Pending..."
                          : "Processing..."}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Confirm Sweep → {Math.max(netSol, 0).toFixed(5)} SOL
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </>
      )}
    </AnimatePresence>
  );
};

export default ActionBar;
