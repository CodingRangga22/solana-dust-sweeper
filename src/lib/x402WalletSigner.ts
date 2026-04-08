import { address } from '@solana/addresses';
import { getTransactionDecoder, getTransactionEncoder, type Transaction } from '@solana/transactions';
import { VersionedTransaction } from '@solana/web3.js';

type WalletSignTx = (tx: VersionedTransaction) => Promise<VersionedTransaction>;

/**
 * Bridges @solana/wallet-adapter `signTransaction` to @solana/kit `TransactionSigner`
 * expected by @x402/svm ExactSvmScheme.
 */
export function createWalletAdapterPartialSigner(wallet: {
  publicKey: { toBase58(): string } | null;
  signTransaction?: WalletSignTx;
}) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet belum siap (perlu publicKey + signTransaction).');
  }
  const addr = address(wallet.publicKey.toBase58());

  return Object.freeze({
    address: addr,
    signTransactions: (transactions: readonly Transaction[]) =>
      Promise.all(
        transactions.map(async (tx) => {
          const encoder = getTransactionEncoder();
          const wire = new Uint8Array(encoder.encode(tx));
          const vt = VersionedTransaction.deserialize(wire);
          const signedVt = await wallet.signTransaction!(vt);
          const decoder = getTransactionDecoder();
          const decoded = decoder.decode(new Uint8Array(signedVt.serialize()));
          const sig = decoded.signatures[addr];
          if (sig == null) {
            throw new Error('Tanda tangan tidak ditemukan setelah approve di wallet.');
          }
          return Object.freeze({ [addr]: sig } as const);
        }),
      ),
  });
}
