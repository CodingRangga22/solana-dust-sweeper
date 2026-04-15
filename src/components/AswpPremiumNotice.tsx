import { useEffect, useMemo } from "react";
import { useWallets } from "@privy-io/react-auth/solana";
import { PublicKey } from "@solana/web3.js";
import { Crown, Sparkles } from "lucide-react";
import { useAswpAccess } from "@/hooks/useAswpAccess";

export default function AswpPremiumNotice({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { wallets } = useWallets();
  const walletAddress = wallets[0]?.address ?? null;
  const owner = useMemo(() => (walletAddress ? new PublicKey(walletAddress) : null), [walletAddress]);
  const aswp = useAswpAccess(owner);

  useEffect(() => {
    void aswp.refresh();
  }, [owner]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      className={[
        "rounded-2xl border border-border bg-card/85 shadow-[var(--shadow-elevated)] backdrop-blur-xl",
        compact ? "p-4" : "p-5",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
          <Crown className="h-5 w-5 text-foreground/85" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">ASWP holder access</p>
          <p className="mt-1 text-sm text-foreground">
            Hold <span className="font-semibold">$ASWP</span> to unlock <span className="font-semibold">Premium Agent</span>{" "}
            access for <span className="font-semibold">free</span> across multiple tiers.
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            The more you hold, the more premium features unlock. Your current tier is shown inside the Agent when you run a premium tool.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-background/60 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Wallet status
          </div>
          {aswp.loading ? (
            <span className="text-[11px] text-muted-foreground">Checking ASWP…</span>
          ) : owner ? (
            <span className="text-[11px] text-muted-foreground">
              {aswp.aswpUsdValue == null ? (
                <>
                  {aswp.aswpUiAmount != null && aswp.aswpUiAmount > 0 ? (
                    <>
                      Tier: <span className="font-semibold text-foreground">{aswp.tierLabel ?? "ASWP Holder"}</span>
                    </>
                  ) : (
                    <>No ASWP detected</>
                  )}
                </>
              ) : (
                <>
                  {aswp.unlocked.size > 0 ? (
                    <>
                      Premium access: <span className="font-semibold text-foreground">active</span>
                    </>
                  ) : (
                    <>
                      Premium access: <span className="text-muted-foreground">inactive</span>
                    </>
                  )}
                </>
              )}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">Connect a wallet to check your tier</span>
          )}
        </div>
      </div>
    </section>
  );
}

