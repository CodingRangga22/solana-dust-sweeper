// Convert Phantom wallet-adapter signing into an x402 SVM client signer shape.
// Note: @x402/svm expects a TransactionSigner from @solana/kit. Wallet-adapter uses @solana/web3.js.
// For now we adapt the minimal surface used by the x402 fetch flow.
import { useWallet } from '@solana/wallet-adapter-react';

export function createPhantomSigner(wallet: ReturnType<typeof useWallet>) {
  if (!wallet.publicKey) throw new Error('Wallet not connected');
  if (!wallet.signAllTransactions) throw new Error('Wallet does not support signAllTransactions');

  return {
    address: wallet.publicKey.toBase58(),
    signTransactions: async (txs: any[]) => {
      return wallet.signAllTransactions!(txs as any);
    },
  };
}

