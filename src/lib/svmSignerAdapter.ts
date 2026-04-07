// Universal adapter: @solana/wallet-adapter → @solana/kit TransactionSigner
// Works with Phantom, OKX, Solflare, Backpack, any wallet-adapter compatible wallet

export function createSvmSignerFromWalletAdapter(wallet: any) {
  if (!wallet?.publicKey || typeof wallet?.signTransaction !== 'function') {
    throw new Error('Wallet not connected or does not support signing');
  }

  return {
    address: wallet.publicKey.toBase58(),
    signTransactions: async (transactions: any[]) => {
      if (typeof wallet.signAllTransactions === 'function') {
        return wallet.signAllTransactions(transactions);
      }
      // Fallback: sign one by one
      return Promise.all(transactions.map((tx: any) => wallet.signTransaction(tx)));
    },
  };
}

