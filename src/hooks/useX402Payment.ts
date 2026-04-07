import { useMemo, useState } from 'react';
import { x402Client, wrapFetchWithPayment } from '@x402/fetch';
import { registerExactSvmScheme } from '@x402/svm/exact/client';
import { useWallet } from '@solana/wallet-adapter-react';
import { createSvmSignerFromWalletAdapter } from '@/lib/svmSignerAdapter';

const API_BASE = 'https://api.arsweep.fun/v1';

type ServiceEndpoint = '/x402/analyze' | '/x402/report' | '/x402/roast' | '/x402/rugcheck' | '/x402/planner';

export function useX402Payment(wallet: ReturnType<typeof useWallet>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithPayment = useMemo(() => {
    const client = new x402Client();
    registerExactSvmScheme(client, { signer: createSvmSignerFromWalletAdapter(wallet) as any });
    return wrapFetchWithPayment(fetch, client);
  }, [wallet]);

  async function requestPremium(walletAddress: string, endpoint: ServiceEndpoint) {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetchWithPayment(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof (body as any)?.error === 'string' ? (body as any).error : 'Request failed';
        throw new Error(msg);
      }
      return body;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Payment request failed';
      setError(msg);
      throw e;
    } finally {
      setIsProcessing(false);
    }
  }

  return { isProcessing, error, requestPremium };
}
