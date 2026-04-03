import { useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const API_BASE = 'https://api.arsweep.fun/v1';
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const RPC_URL = 'https://api.mainnet-beta.solana.com';

export const useX402Payment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeX402Payment = async (
    wallet: any,
    endpoint: string,
    amountUSDC: number
  ) => {
    if (!wallet?.publicKey) throw new Error('Wallet not connected');

    const connection = new Connection(RPC_URL, 'confirmed');
    const amountAtomic = Math.floor(amountUSDC * 1_000_000);

    // Step 1: Get 402 requirements
    const req402 = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: wallet.publicKey.toString() }),
    });
    const data402 = await req402.json();
    if (!data402.accepts) throw new Error('Invalid 402 response');

    const paymentReq = data402.accepts[0];
    const treasury = new PublicKey(paymentReq.payTo);

    // Step 2: Build USDC transfer
    const fromATA = await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey);
    const toATA = await getAssociatedTokenAddress(USDC_MINT, treasury);

    const tx = new Transaction().add(
      createTransferInstruction(fromATA, toATA, wallet.publicKey, amountAtomic, [], TOKEN_PROGRAM_ID)
    );

    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;

    // Step 3: Sign & send
    const signed = await wallet.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature, 'confirmed');

    // Step 4: Call endpoint with payment proof
    const result = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Payment': JSON.stringify({ signature, network: 'solana', amount: amountAtomic }),
      },
      body: JSON.stringify({ walletAddress: wallet.publicKey.toString() }),
    });

    if (!result.ok) throw new Error('Payment verification failed');
    return result.json();
  };

  const requestAnalysis = async (walletAddress: string, wallet: any, endpoint: string = '/x402/analyze') => {
    setIsProcessing(true);
    setError(null);
    try {
      const amount = endpoint === '/x402/analyze' || endpoint === '/x402/rugcheck' ? 0.10 : 0.05;
      return await makeX402Payment(wallet, endpoint, amount);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setError(msg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const requestReport = async (walletAddress: string, wallet: any) => {
    setIsProcessing(true);
    setError(null);
    try {
      return await makeX402Payment(wallet, '/x402/report', 0.05);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Report failed';
      setError(msg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, error, requestAnalysis, requestReport };
};
