import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle, Copy, ExternalLink, ShieldAlert } from "lucide-react";
import { type TokenAccountInfo, INACTIVITY_DAYS } from "@/lib/tokenAccounts";
import { formatTokenUiBalance } from "@/lib/utils";
import SwapModeToggle from "@/components/SwapModeToggle";
import type { TokenMode } from "@/hooks/useSwapMode";

export interface Token {
  id: string;
  name: string;
  mint: string;
  balance: string;
  rentRefundable: number;
  icon: string;
}

const SkeletonRow = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }} className="animate-pulse">
    <div style={{ width: 18, height: 18, borderRadius: 4, background: "hsl(var(--muted))" }} />
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "hsl(var(--muted))", flexShrink: 0 }} />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-32 bg-muted rounded" />
      <div className="h-3 w-24 bg-muted rounded" />
    </div>
    <div className="h-4 w-20 bg-muted rounded" />
    <div className="h-4 w-24 bg-muted rounded" />
  </div>
);

const formatMint = (mint: string) => (mint.length > 12 ? `${mint.slice(0, 4)}...${mint.slice(-4)}` : mint);

const TokenLogo = ({ src, symbol }: { src: string | null; symbol: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "hsl(var(--muted))",
          border: "1px solid hsl(var(--border))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 600,
          color: "hsl(var(--muted-foreground))",
          flexShrink: 0,
          fontFamily: "var(--font-mono)",
        }}
      >
        {symbol.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={symbol}
      onError={() => setFailed(true)}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--muted))",
      }}
    />
  );
};

interface TokenListProps {
  tokenAccounts: TokenAccountInfo[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  loading?: boolean;
  disabled?: boolean;
  scanned?: boolean;
  tokenModes?: Record<string, TokenMode>;
  onToggleMode?: (id: string) => void;
  swapQuotes?: Record<string, number>;
  syraRisks?: Record<string, { level: "safe" | "caution" | "high" | "unknown"; reason: string }>;
  syraLoadingMints?: Set<string>;
  analyticsSlot?: React.ReactNode;
}

const TokenList = ({
  tokenAccounts,
  selectedIds,
  onToggle,
  onSelectAll,
  loading = false,
  disabled = false,
  scanned = false,
  tokenModes = {},
  onToggleMode,
  swapQuotes = {},
  syraRisks = {},
  syraLoadingMints = new Set(),
  analyticsSlot,
}: TokenListProps) => {
  const sweepableCount = tokenAccounts.filter((a) => a.isSweepable).length;
  const valueWarningCount = tokenAccounts.filter((a) => a.isSweepable && a.hasValueWarning).length;
  const allSelected = !loading && !disabled && sweepableCount > 0 && selectedIds.size === sweepableCount;
  const isDisabled = loading || disabled;

  return (
    <section className="px-4 pb-32">
      <div className="container mx-auto max-w-3xl">
        <div className="w-full">
            {/* Safety Warning Banner */}
            {scanned && sweepableCount > 0 && (
              <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>Warning: Closing accounts is permanent. Ensure the token balance is zero or insignificant.</p>
              </div>
            )}

            {/* Value Warning Banner */}
            {scanned && valueWarningCount > 0 && (
              <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-sm text-yellow-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>
                  <span className="font-semibold">{valueWarningCount} token{valueWarningCount > 1 ? "s" : ""}</span> still have value under $1.00. Closing these accounts will forfeit the remaining token balance.
                </p>
              </div>
            )}

            <div className="surface-premium" style={{ borderRadius: 14, overflow: "hidden" }}>
              {/* Table header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 16px",
                  borderBottom: "1px solid hsl(var(--border))",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "hsl(var(--muted-foreground))",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
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
                    const mintStr = account.mint.toBase58();
                    const selected = account.isSweepable && selectedIds.has(id);
                    const { name, symbol, logoURI } = account.metadata;
                    const rug = account.rugcheck;
                    const syra = syraRisks[mintStr];
                    const syraLoading = syraLoadingMints.has(mintStr);
                    const syraBadge =
                      syra?.level === "high"
                        ? { label: "Syra: High Risk", cls: "bg-red-500/20 text-red-300" }
                        : syra?.level === "caution"
                          ? { label: "Syra: Caution", cls: "bg-yellow-500/20 text-yellow-300" }
                          : syra?.level === "safe"
                            ? { label: "Syra: OK", cls: "bg-emerald-500/15 text-emerald-300" }
                            : syraLoading
                              ? { label: "Syra: Checking…", cls: "bg-muted text-muted-foreground" }
                              : null;
                    const rugBadge =
                      rug?.level === "danger"
                        ? { label: "RugCheck: Danger", cls: "bg-red-500/20 text-red-300" }
                        : rug?.level === "warn"
                          ? { label: "RugCheck: Warn", cls: "bg-yellow-500/20 text-yellow-300" }
                          : rug?.level === "good"
                            ? { label: "RugCheck: OK", cls: "bg-emerald-500/15 text-emerald-300" }
                            : null;

                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => account.isSweepable && !isDisabled && onToggle(id)}
                        className={`flex items-center gap-3 px-4 py-3.5 transition-all duration-200 border-b-0 ${
                          account.isSweepable ? (isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer") : "cursor-default"
                        } ${!isDisabled && account.isSweepable && (selected ? "bg-primary/5" : "hover:bg-muted/30")}`}
                      >
                        {/* Checkbox */}
                        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                          {account.isSweepable ? (
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 ${
                                selected ? "bg-muted border-border" : "border-border"
                              }`}
                            >
                              {selected && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                          ) : (
                            <div style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid hsl(var(--border))", background: "hsl(var(--muted))" }} />
                          )}
                        </div>

                        {/* Card */}
                        <div
                          className={`flex-1 min-w-0 p-4 rounded-xl border transition-all ${
                            account.isSweepable
                              ? account.hasValueWarning
                                ? "bg-card border-yellow-500/30"
                                : "bg-card border-primary/30"
                              : "bg-card border-border opacity-40"
                          }`}
                        >
                          {/* Top: Logo + Name + Balance */}
                          <div className="flex items-center gap-3 mb-3">
                            <TokenLogo src={logoURI} symbol={symbol} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {name}
                              </p>
                              <p className="text-xs text-muted-foreground font-medium">
                                {symbol}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold tabular-nums">
                                Balance: {formatTokenUiBalance(account.amount, account.decimals)}{" "}
                                {symbol}
                              </p>
                              <p className="text-xs text-muted-foreground tabular-nums">
                                Rent: {(account.rentLamports / 1e9).toFixed(6)} SOL
                              </p>
                            </div>
                          </div>

                          {/* Contract Address */}
                          <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg bg-muted/30 w-fit">
                            <span className="text-[11px] text-muted-foreground font-mono">
                              Mint: {formatMint(mintStr)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(mintStr);
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy mint address"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <a
                              href={`https://solscan.io/token/${mintStr}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="View on Solscan"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          {/* Tags + Swap */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  account.isSweepable
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {account.isSweepable ? "Sweepable" : "Active"}
                              </span>
                              {rugBadge && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium ${rugBadge.cls}`}
                                  title={
                                    rug?.scoreNormalized != null
                                      ? `RugCheck score: ${rug.scoreNormalized}/10`
                                      : "RugCheck"
                                  }
                                >
                                  <ShieldAlert className="w-3 h-3" />
                                  {rugBadge.label}
                                </span>
                              )}
                              {syraBadge && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium ${syraBadge.cls}`}
                                  title={syra?.reason || "Syra risk"}
                                >
                                  <ShieldAlert className="w-3 h-3" />
                                  {syraBadge.label}
                                </span>
                              )}
                              {account.hasValueWarning && (
                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1 font-medium">
                                  <AlertTriangle className="w-3 h-3" />
                                  Has Value
                                </span>
                              )}
                              {account.mintFlags?.freezeAuthority && (
                                <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 flex items-center gap-1 font-medium" title={`Freeze Authority: ${account.mintFlags.freezeAuthority}`}>
                                  <ShieldAlert className="w-3 h-3" />
                                  Freezable
                                </span>
                              )}
                              {account.mintFlags?.mintAuthority && (
                                <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 flex items-center gap-1 font-medium" title={`Mint Authority: ${account.mintFlags.mintAuthority}`}>
                                  <ShieldAlert className="w-3 h-3" />
                                  Mintable
                                </span>
                              )}
                              {account.isSweepable && account.eligibilityReasons.length > 0 &&
                                account.eligibilityReasons.map((reason) => (
                                  <span
                                    key={reason}
                                    className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                                  >
                                    {reason === "zero_balance" && "Empty"}
                                    {reason === "dust_amount" && "Dust"}
                                    {reason === "no_liquidity" && "No Pool"}
                                    {reason === "low_usd_value" && `$${(account.usdValueCents / 100).toFixed(2)}`}
                                    {reason === "inactive" && `${INACTIVITY_DAYS}d inactive`}
                                  </span>
                                ))}
                            </div>
                            {account.isSweepable && account.hasLiquidityPool && onToggleMode && (
                              <SwapModeToggle
                                mode={tokenModes[account.pubkey.toBase58()] ?? "close"}
                                onToggle={() => onToggleMode(account.pubkey.toBase58())}
                                hasLiquidity={account.hasLiquidityPool}
                                disabled={disabled || syra?.level === "high"}
                                disabledReason={syra?.level === "high" ? "High risk token — swap disabled" : undefined}
                                estimatedSol={swapQuotes[account.pubkey.toBase58()]}
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {analyticsSlot != null && (
              <div className="mt-8 w-full">{analyticsSlot}</div>
            )}
        </div>
      </div>
    </section>
  );
};

export default TokenList;