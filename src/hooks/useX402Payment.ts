import { useState } from 'react';
import { getSolanaConnection, sendUSDCPayment } from '@/lib/solana-payment';

const API_BASE = 'https://api.arsweep.fun/v1';

/** USDC price per premium endpoint (matches arsweep-agent x402Routes). */
const ENDPOINT_PRICE_USDC: Record<string, number> = {
  '/x402/analyze': 0.1,
  '/x402/report': 0.05,
  '/x402/roast': 0.05,
  '/x402/rugcheck': 0.1,
  '/x402/planner': 0.05,
};

export const useX402Payment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Pay via /v1/payment/usdc, then call the premium route with X-Payment-Signature.
   */
  const makePaidRequest = async (wallet: any, endpoint: string, walletAddress: string) => {
    if (!wallet?.publicKey) throw new Error('Wallet not connected');

    const price = ENDPOINT_PRICE_USDC[endpoint];
    if (price == null) throw new Error(`Unknown premium endpoint: ${endpoint}`);

    const connection = getSolanaConnection();
    const pay = await sendUSDCPayment(connection, wallet, price);
    if (!pay.success || !pay.signature) {
      throw new Error(pay.error || 'Payment failed');
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Signature': pay.signature,
      },
      body: JSON.stringify({ walletAddress }),
    });

    const body = await res.json().catch(() => ({}));

    if (res.status === 402) {
      const reason = typeof body.reason === 'string' ? body.reason : body.error;
      throw new Error(reason || 'Payment verification failed');
    }
    if (!res.ok) {
      throw new Error(typeof body.error === 'string' ? body.error : 'Service request failed');
    }

    if (body && typeof body === 'object' && 'success' in body && body.success && 'data' in body) {
      return (body as { data: unknown }).data;
    }
    return body;
  };

  const requestAnalysis = async (walletAddress: string, wallet: any, endpoint: string = '/x402/analyze') => {
    setIsProcessing(true);
    setError(null);
    try {
      return await makePaidRequest(wallet, endpoint, walletAddress);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      setError(msg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const requestReport = async (walletAddress: string, wallet: any) => {
    return requestAnalysis(walletAddress, wallet, '/x402/report');
  };

  return { isProcessing, error, requestAnalysis, requestReport };
};
