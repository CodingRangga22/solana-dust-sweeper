import { ArrowLeftRight, Trash2 } from "lucide-react";
import type { TokenMode } from "@/hooks/useSwapMode";

interface SwapModeToggleProps {
  mode: TokenMode;
  onToggle: () => void;
  hasLiquidity: boolean;
  disabled?: boolean;
  estimatedSol?: number | null;
}

const SwapModeToggle = ({
  mode,
  onToggle,
  hasLiquidity,
  disabled = false,
  estimatedSol,
}: SwapModeToggleProps) => {
  if (!hasLiquidity) return null;

  return (
    <div className="flex flex-col items-end gap-1 mt-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onToggle();
        }}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
          mode === "swap"
            ? "bg-purple-500/20 border-purple-500/40 text-purple-300 hover:bg-purple-500/30"
            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
