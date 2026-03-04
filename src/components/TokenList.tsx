import { motion, AnimatePresence } from "framer-motion";
import { Check, ExternalLink, AlertTriangle } from "lucide-react";
import { type TokenAccountInfo, INACTIVITY_DAYS } from "@/lib/tokenAccounts";

export interface Token {
  id: string;
  name: string;
  mint: string;
  balance: string;
  rentRefundable: number;
  icon: string;
}

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

const formatMint = (mint: string) => (mint.length > 12 ? `${mint.slice(0, 4)}...${mint.slice(-4)}` : mint);

interface TokenListProps {
  tokenAccounts: TokenAccountInfo[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  loading?: boolean;
  disabled?: boolean;
  scanned?: boolean;
}

const TokenList = ({ tokenAccounts, selectedIds, onToggle, onSelectAll, loading = false, disabled = false, scanned = false }: TokenListProps) => {
  const sweepableCount = tokenAccounts.filter((a) => a.isSweepable).length;
  const allSelected = !loading && !disabled && sweepableCount > 0 && selectedIds.size === sweepableCount;
  const isDisabled = loading || disabled;

  return (
    <section className="px-4 pb-32">
      <div className="container mx-auto max-w-3xl">
        {/* Safety Warning Banner — only show after scan */}
        {scanned && sweepableCount > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>Warning: Closing accounts is permanent. Ensure the token balance is zero or insignificant.</p>
        </div>
        )}

        <div className="glass rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <button
              onClick={onSelectAll}
              disabled={isDisabled || sweepableCount === 0}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 disabled:opacity-50 ${
                allSelected ? "gradient-bg border-transparent" : "border-border hover:border-muted-foreground"
              }`}
            >
              {allSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>
            <div className="flex-1">Account</div>
            <div className="w-24 text-right">Balance</div>
            <div className="w-28 text-right">Rent</div>
          </div>

          {/* Rows */}
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : tokenAccounts.length === 0 ? (
            <div className="px-4 py-12 text-center text-muted-foreground text-sm">
              No token accounts found. Connect and scan to see accounts.
            </div>
          ) : (
            <AnimatePresence>
              {tokenAccounts.map((account, i) => {
                const id = account.pubkey.toBase58();
                const selected = account.isSweepable && selectedIds.has(id);
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => account.isSweepable && !isDisabled && onToggle(id)}
                    className={`flex items-center gap-4 px-4 py-3.5 transition-all duration-200 border-b border-border last:border-b-0 ${
                      account.isSweepable ? (isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer") : "cursor-default"
                    } ${!isDisabled && account.isSweepable && (selected ? "bg-primary/5" : "hover:bg-muted/30 hover:shadow-[inset_0_0_30px_hsla(162,93%,51%,0.04)]")}`}
                  >
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                      {account.isSweepable ? (
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 ${
                            selected ? "gradient-bg border-transparent animate-[pulse_0.4s_ease-in-out_1]" : "border-border"
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md border border-border bg-muted/30" />
                      )}
                    </div>
                    <div
                      className={`flex-1 min-w-0 flex items-center justify-between p-4 rounded-xl border transition-all ${
                        account.isSweepable
                          ? "bg-card border-primary/30"
                          : "bg-card border-border opacity-40"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-mono">
                          {account.pubkey.toBase58().slice(0, 4)}...
                          {account.pubkey.toBase58().slice(-4)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Mint: {account.mint.toBase58().slice(0, 6)}...
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-sm">
                          Balance: {account.amount.toString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rent: {(account.rentLamports / 1e9).toFixed(6)} SOL
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            account.isSweepable
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {account.isSweepable ? "Sweepable" : "Active"}
                        </span>
                        {account.isSweepable && account.eligibilityReasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 justify-end">
                            {account.eligibilityReasons.map((reason) => (
                              <span
                                key={reason}
                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                              >
                                {reason === "zero_balance" && "Empty"}
                                {reason === "dust_amount" && "Dust"}
                                {reason === "no_liquidity" && "No Pool"}
                                {reason === "low_usd_value" && (
                                  `$${(account.usdValueCents / 100).toFixed(2)}`
                                )}
                                {reason === "inactive" && `${INACTIVITY_DAYS}d inactive`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
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

export default TokenList;
