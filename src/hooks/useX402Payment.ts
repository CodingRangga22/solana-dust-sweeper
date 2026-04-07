import { useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const API_BASE = 'https://api.arsweep.fun/v1';

export const useX402Payment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeX402Payment = async (wallet: any, endpoint: string, amountUSDC: number) => {
    if (!wallet?.publicKey) throw new Error('Wallet not connected');

    // Fetch treasury dari backend — tidak hardcode di frontend
    const infoRes = await fetch(`${API_BASE}/payment/info`);
    const { treasury, usdcMint } = await infoRes.json();

    const connection = new Connection(
      import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    const USDC_MINT = new PublicKey(usdcMint);
    const TREASURY = new PublicKey(treasury);
    const amountAtomic = Math.floor(amountUSDC * 1_000_000);

    // Build USDC transfer
    const fromATA = await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey);
    const toATA = await getAssociatedTokenAddress(USDC_MINT, TREASURY);

    const tx = new Transaction().add(
      createTransferInstruction(fromATA, toATA, wallet.publicKey, amountAtomic, [], TOKEN_PROGRAM_ID)
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;

    // Sign di client
    const signed = await wallet.signTransaction(tx);
    const signedBase64 = Buffer.from(signed.serialize()).toString('base64');

    // Send via backend proxy
    const payRes = await fetch(`${API_BASE}/payment/usdc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromWallet: wallet.publicKey.toString(),
        amountUSDC,
        signedTx: signedBase64,
        blockhash,
        lastValidBlockHeight,
      }),
    });

    const payData = await payRes.json();
    if (!payData.success) throw new Error(payData.error || 'Payment failed');

    // Call x402 endpoint with payment proof
    const result = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PAYMENT-SIGNATURE': payData.signature,
      },
      body: JSON.stringify({ walletAddress: wallet.publicKey.toString() }),
    });

    if (!result.ok) throw new Error('Service request failed');
    return result.json();
  };

  const requestAnalysis = async (walletAddress: string, wallet: any, endpoint: string = '/x402/analyze') => {
    setIsProcessing(true);
    setError(null);
    try {
      const amount = endpoint === '/x402/analyze' || endpoint === '/x402/rugcheck' ? 0.10 : 0.05;
      return await makeX402Payment(wallet, endpoint, amount);
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
