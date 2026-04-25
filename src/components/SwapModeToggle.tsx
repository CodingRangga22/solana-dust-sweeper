import { ArrowLeftRight, Trash2, AlertTriangle } from "lucide-react";
import type { TokenMode } from "@/hooks/useSwapMode";

interface SwapModeToggleProps {
  mode: TokenMode;
  onToggle: () => void;
  hasLiquidity: boolean;
  disabled?: boolean;
  estimatedSol?: number | null;
  disabledReason?: string;
}

const SwapModeToggle = ({
  mode,
  onToggle,
  hasLiquidity,
  disabled = false,
  estimatedSol,
  disabledReason,
}: SwapModeToggleProps) => {
  if (!hasLiquidity) return null;

  const isCloseOnly = mode === "close";

  return (
    <div className="flex flex-col items-end gap-1 mt-1">
      {/* Warning kalau user pilih Close Only */}
      {isCloseOnly && (
        <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-2 py-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Token has value — swap first to avoid loss
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onToggle();
        }}
        disabled={disabled}
        title={
          disabled
            ? (disabledReason || "Action disabled")
            : isCloseOnly
              ? "This token has a liquidity pool. Swap first to recover value."
              : ""
        }
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
          mode === "swap"
            ? "bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30"
            : "bg-amber-500/10 border-amber-400/30 text-amber-400 hover:bg-amber-500/20"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {mode === "swap" ? (
          <>
            <ArrowLeftRight className="w-3 h-3" />
            Swap → SOL
          </>
        ) : (
          <>
            <Trash2 className="w-3 h-3" />
            Close Only
          </>
        )}
      </button>

      {mode === "swap" && estimatedSol != null && estimatedSol > 0 && (
        <span className="text-[10px] text-purple-400">
          ≈ +{estimatedSol.toFixed(6)} SOL from swap
        </span>
      )}
      {mode === "swap" && (estimatedSol == null || estimatedSol === 0) && (
        <span className="text-[10px] text-muted-foreground">
          Fetching quote...
        </span>
      )}
    </div>
  );
};

export default SwapModeToggle;