import { useMemo, useState } from 'react';
const API_BASE = 'https://api.arsweep.fun/v1';

type ServiceEndpoint = '/premium/analyze' | '/premium/report' | '/premium/roast' | '/premium/rugcheck' | '/premium/planner';

export function useX402Payment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlain = useMemo(() => fetch, []);

  async function requestPremium(walletAddress: string, endpoint: ServiceEndpoint) {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetchPlain(`${API_BASE}${endpoint}`, {
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
