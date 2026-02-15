import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ExternalLink, AlertTriangle } from "lucide-react";

interface Token {
  id: string;
  name: string;
  mint: string;
  balance: string;
  rentRefundable: number;
  icon: string;
}

const MOCK_TOKENS: Token[] = [
  { id: "1", name: "DustCoin", mint: "Dust4k...xR7m", balance: "0.000001", rentRefundable: 0.00204, icon: "🪙" },
  { id: "2", name: "SolPup", mint: "SPup3q...wN2a", balance: "0", rentRefundable: 0.00204, icon: "🐶" },
  { id: "3", name: "MoonDust", mint: "Moon7z...pK5f", balance: "0.0000003", rentRefundable: 0.00204, icon: "🌙" },
  { id: "4", name: "RektInu", mint: "Rekt2m...vL9c", balance: "0", rentRefundable: 0.00204, icon: "💀" },
  { id: "5", name: "BabyDoge", mint: "BDog8r...tH3e", balance: "0.00001", rentRefundable: 0.00204, icon: "🐕" },
  { id: "6", name: "SafeRug", mint: "SRug1a...qM4d", balance: "0", rentRefundable: 0.00204, icon: "🧹" },
  { id: "7", name: "ElonFart", mint: "EFrt5w...bJ8g", balance: "0", rentRefundable: 0.00204, icon: "💨" },
  { id: "8", name: "CatWIF", mint: "CWif9x...nP6h", balance: "0.000002", rentRefundable: 0.00204, icon: "🐱" },
];

const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-5 h-5 rounded bg-muted" />
    <div className="w-10 h-10 rounded-xl bg-muted" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-24 bg-muted rounded" />
      <div className="h-3 w-32 bg-muted rounded" />
    </div>
    <div className="h-4 w-20 bg-muted rounded" />
    <div className="h-4 w-24 bg-muted rounded" />
  </div>
);

interface TokenListProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
}

const TokenList = ({ selectedIds, onToggle, onSelectAll }: TokenListProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const allSelected = !loading && selectedIds.size === MOCK_TOKENS.length;

  return (
    <section className="px-4 pb-32">
      <div className="container mx-auto max-w-3xl">
        {/* Safety Warning Banner */}
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>Warning: Closing accounts is permanent. Ensure the token balance is zero or insignificant.</p>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <button
              onClick={onSelectAll}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 ${
                allSelected ? "gradient-bg border-transparent" : "border-border hover:border-muted-foreground"
              }`}
            >
              {allSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>
            <div className="w-10" />
            <div className="flex-1">Token</div>
            <div className="w-24 text-right">Balance</div>
            <div className="w-28 text-right">Rent Refund</div>
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : (
            <AnimatePresence>
              {MOCK_TOKENS.map((token, i) => {
                const selected = selectedIds.has(token.id);
                return (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => onToggle(token.id)}
                    className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer transition-all duration-200 border-b border-border last:border-b-0 ${
                      selected ? "bg-primary/5" : "hover:bg-muted/30 hover:shadow-[inset_0_0_30px_hsla(162,93%,51%,0.04)]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 ${
                        selected ? "gradient-bg border-transparent animate-[pulse_0.4s_ease-in-out_1]" : "border-border"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg">
                      {token.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{token.name}</p>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                        {token.mint}
                        <a
                          href={`https://solscan.io/token/${token.mint}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </span>
                    </div>
                    <div className="w-24 text-right text-sm text-muted-foreground font-mono">
                      {token.balance}
                    </div>
                    <div className="w-28 text-right text-sm text-primary font-semibold font-mono">
                      {token.rentRefundable} SOL
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
};

export { MOCK_TOKENS };
export default TokenList;
