import { useState } from 'react';
import { createX402Client } from 'x402-solana/client';

const API_BASE = 'https://api.arsweep.fun/v1';

export const useX402Payment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeX402Payment = async (wallet: any, endpoint: string) => {
    if (!wallet?.publicKey) throw new Error('Wallet not connected');

    const client = createX402Client({
      wallet: {
        address: wallet.publicKey.toString(),
        signTransaction: async (tx: any) => await wallet.signTransaction(tx),
      },
      network: 'solana-mainnet',
    });

    const response = await client.fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: wallet.publicKey.toString() }),
    });

    if (!response.ok) throw new Error('Service request failed');
    return response.json();
  };

  const requestAnalysis = async (walletAddress: string, wallet: any, endpoint: string = '/x402/analyze') => {
    setIsProcessing(true);
    setError(null);
    try {
      return await makeX402Payment(wallet, endpoint);
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
