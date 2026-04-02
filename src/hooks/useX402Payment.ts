import { useState } from 'react';
import { arsweepApi } from '../services/arsweepApi';

export const useX402Payment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestAnalysis = async (walletAddress: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await arsweepApi.x402Analyze({ walletAddress });
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const requestReport = async (walletAddress: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await arsweepApi.x402Report({ walletAddress });
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, error, requestAnalysis, requestReport };
};
