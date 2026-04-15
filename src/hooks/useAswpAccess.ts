import { useCallback, useMemo, useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { getPremiumMainnetConnection } from "@/lib/solanaUsdcBalance";
import { getJupiterPriceUsd } from "@/lib/jupiterPrice";
import { ASWP_MINT, ASWP_TIERS, type PremiumServiceType } from "@/config/aswpGating";

type AswpAccessState = {
  loading: boolean;
  error: string | null;
  aswpUiAmount: number | null;
  aswpUsdValue: number | null;
};

function computeUnlocked(params: {
  usdValue: number | null;
  uiAmount: number | null;
}): { tierLabel: string | null; unlocked: Set<PremiumServiceType> } {
  const hasAswp = (params.uiAmount ?? 0) > 0;
  const usd = params.usdValue ?? 0;
  const sorted = [...ASWP_TIERS].sort((a, b) => a.minUsd - b.minUsd);
  // Ensure every ASWP holder has at least a base tier label.
  let tierLabel: string | null = hasAswp ? "ASWP Holder" : null;
  const unlocked = new Set<PremiumServiceType>();
  for (const t of sorted) {
    if (usd + 1e-9 >= t.minUsd) {
      tierLabel = t.label;
      for (const s of t.unlocks) unlocked.add(s);
    }
  }
  return { tierLabel, unlocked };
}

export function useAswpAccess(owner: PublicKey | null) {
  const [state, setState] = useState<AswpAccessState>({
    loading: false,
    error: null,
    aswpUiAmount: null,
    aswpUsdValue: null,
  });

  const inFlightRef = useRef<Promise<void> | null>(null);
  const lastFetchMsRef = useRef<number>(0);
  const ownerKey = owner?.toBase58() ?? null;

  const refresh = useCallback(async () => {
    if (!owner) {
      setState({ loading: false, error: null, aswpUiAmount: null, aswpUsdValue: null });
      return;
    }

    // Dedupe concurrent callers.
    if (inFlightRef.current) return inFlightRef.current;

    // Cooldown to avoid RPC/Jupiter rate limits when multiple components mount.
    const now = Date.now();
    if (now - lastFetchMsRef.current < 15_000 && state.aswpUiAmount != null) return;

    setState((p) => ({ ...p, loading: true, error: null }));
    const work = (async () => {
      try {
        const conn = getPremiumMainnetConnection();
        const mint = new PublicKey(ASWP_MINT);

        const [acctResp, price] = await Promise.all([
          conn.getParsedTokenAccountsByOwner(owner, { mint }),
          getJupiterPriceUsd(ASWP_MINT),
        ]);

        let ui = 0;
        for (const { account } of acctResp.value) {
          const data = account.data;
          if (!("parsed" in data)) continue;
          const info = (data.parsed as any).info as {
            tokenAmount?: { uiAmount?: number };
          };
          const amt = info?.tokenAmount?.uiAmount;
          if (typeof amt === "number" && Number.isFinite(amt)) ui += amt;
        }

        const usdValue = price != null ? ui * price : null;
        lastFetchMsRef.current = Date.now();
        setState({ loading: false, error: null, aswpUiAmount: ui, aswpUsdValue: usdValue });
      } catch (e) {
        lastFetchMsRef.current = Date.now();
        setState((p) => ({
          ...p,
          loading: false,
          error: e instanceof Error ? e.message : "Failed to read ASWP holdings",
        }));
      } finally {
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = work;
    return work;
  }, [ownerKey, owner, state.aswpUiAmount]);

  const derived = useMemo(() => {
    const { tierLabel, unlocked } = computeUnlocked({
      usdValue: state.aswpUsdValue,
      uiAmount: state.aswpUiAmount,
    });
    return { tierLabel, unlocked };
  }, [state.aswpUsdValue, state.aswpUiAmount]);

  const isUnlocked = useCallback(
    (service: PremiumServiceType) => derived.unlocked.has(service),
    [derived.unlocked],
  );

  return {
    ...state,
    tierLabel: derived.tierLabel,
    unlocked: derived.unlocked,
    isUnlocked,
    refresh,
  };
}

