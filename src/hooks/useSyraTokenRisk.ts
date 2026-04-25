import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallets } from "@privy-io/react-auth/solana";
import { usePrivySignTransaction } from "@/hooks/usePrivySignTransaction";
import type { ArsweepX402SigningWallet } from "@/lib/arsweepX402Client";
import { fetchSyraTokenRisk, type SyraTokenRisk } from "@/lib/syraTokenRisk";

type RiskMap = Record<string, SyraTokenRisk>;

const TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const MAX_CONCURRENCY = 3;

export function useSyraTokenRisk(mints: string[]) {
  const { wallets } = useWallets();
  const { signTransaction } = usePrivySignTransaction();

  const addr = wallets[0]?.address;
  const publicKey = useMemo(() => (addr ? new PublicKey(addr) : null), [addr]);

  const wallet = useMemo<ArsweepX402SigningWallet>(() => ({ publicKey, signTransaction }), [publicKey, signTransaction]);

  const [risks, setRisks] = useState<RiskMap>({});
  const [loadingMints, setLoadingMints] = useState<Set<string>>(new Set());

  const inFlightRef = useRef<Map<string, Promise<void>>>(new Map());

  const needsFetch = useCallback(
    (mint: string) => {
      const existing = risks[mint];
      if (!existing) return true;
      return Date.now() - existing.fetchedAt > TTL_MS;
    },
    [risks],
  );

  const queueFetch = useCallback(
    async (mint: string) => {
      if (!wallet.publicKey || !wallet.signTransaction) return;
      if (!needsFetch(mint)) return;
      if (inFlightRef.current.has(mint)) return;

      setLoadingMints((prev) => new Set(prev).add(mint));
      const p = (async () => {
        try {
          const r = await fetchSyraTokenRisk(wallet, mint);
          setRisks((prev) => ({ ...prev, [mint]: r }));
        } finally {
          inFlightRef.current.delete(mint);
          setLoadingMints((prev) => {
            const next = new Set(prev);
            next.delete(mint);
            return next;
          });
        }
      })();

      inFlightRef.current.set(mint, p);
      await p;
    },
    [wallet, needsFetch],
  );

  useEffect(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return;
    if (mints.length === 0) return;

    let cancelled = false;
    const unique = Array.from(new Set(mints)).slice(0, 200); // sanity cap

    (async () => {
      // Poor-man's concurrency limiter.
      const pending = [...unique].filter((m) => needsFetch(m));
      let idx = 0;
      const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, pending.length) }).map(async () => {
        while (!cancelled) {
          const m = pending[idx++];
          if (!m) return;
          await queueFetch(m);
        }
      });
      await Promise.all(workers);
    })();

    return () => {
      cancelled = true;
    };
  }, [mints, wallet.publicKey, wallet.signTransaction, needsFetch, queueFetch]);

  return {
    risks,
    loadingMints,
    canFetch: wallet.publicKey != null && wallet.signTransaction != null,
  };
}

