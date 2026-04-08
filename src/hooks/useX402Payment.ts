import { useCallback, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { createArsweepFetchWithPayment } from '@/lib/arsweepX402Client';
import {
  getPremiumMainnetConnection,
  getMainnetUsdcUiAmount,
  getSolBalanceLamports,
  PREMIUM_MIN_SOL_LAMPORTS,
} from '@/lib/solanaUsdcBalance';

const API_BASE = (
  import.meta.env.VITE_ARSWEEP_API_BASE?.trim() || 'https://api.arsweep.fun/v1'
).replace(/\/$/, '');

export type PremiumServicePath =
  | '/premium/analyze'
  | '/premium/report'
  | '/premium/roast'
  | '/premium/rugcheck'
  | '/premium/planner';

/** Normalisasi prefix path x402 (hindari typo env seperti /a402). */
function normalizeX402Prefix(raw: string | undefined): string {
  let p = (raw?.trim() || '/x402').replace(/\/$/, '') || '/x402';
  if (!p.startsWith('/')) p = `/${p}`;
  const lower = p.toLowerCase();
  if (lower === '/a402') return '/x402';
  return p;
}

/** Path API yang memakai middleware x402 + Pay AI facilitator (bukan /premium proxy server). */
function toX402Path(premiumPath: PremiumServicePath): string {
  const prefix = normalizeX402Prefix(import.meta.env.VITE_ARSWEEP_X402_PATH_PREFIX);
  return premiumPath.replace('/premium', prefix);
}

export function priceUsdcFor(
  serviceType: 'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner',
): number {
  return serviceType === 'analyze' || serviceType === 'rugcheck' ? 0.1 : 0.05;
}

export function useX402Payment() {
  const wallet = useWallet();
  const { publicKey, signTransaction, connected } = wallet;

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [solLamports, setSolLamports] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const mainnetConn = useMemo(() => getPremiumMainnetConnection(), []);

  const refreshBalances = useCallback(async () => {
    if (!publicKey) {
      setUsdcBalance(null);
      setSolLamports(null);
      return;
    }
    setBalanceLoading(true);
    try {
      const owner = new PublicKey(publicKey.toBase58());
      const [usdc, sol] = await Promise.all([
        getMainnetUsdcUiAmount(mainnetConn, owner),
        getSolBalanceLamports(mainnetConn, owner),
      ]);
      setUsdcBalance(usdc);
      setSolLamports(sol);
    } catch {
      setUsdcBalance(null);
      setSolLamports(null);
    } finally {
      setBalanceLoading(false);
    }
  }, [publicKey, mainnetConn]);

  async function requestPremium(walletAddress: string, premiumPath: PremiumServicePath) {
    if (!publicKey || !signTransaction || !connected) {
      const msg = 'Hubungkan wallet yang mendukung penandatanganan transaksi.';
      setError(msg);
      throw new Error(msg);
    }
    setIsProcessing(true);
    setError(null);
    try {
      const path = toX402Path(premiumPath);
      const fetchPay = createArsweepFetchWithPayment(wallet);
      const res = await fetchPay(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      const text = await res.text();
      let body: unknown = {};
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = { raw: text };
      }
      if (!res.ok) {
        const msg =
          typeof (body as { error?: string }).error === 'string'
            ? (body as { error: string }).error
            : `Permintaan gagal (${res.status})`;
        throw new Error(msg);
      }
      return body;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Pembayaran atau permintaan gagal';
      setError(msg);
      throw e;
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    wallet,
    publicKey,
    signTransaction,
    connected,
    isProcessing,
    error,
    setError,
    requestPremium,
    usdcBalance,
    solLamports,
    balanceLoading,
    refreshBalances,
    minSolLamports: PREMIUM_MIN_SOL_LAMPORTS,
  };
}
