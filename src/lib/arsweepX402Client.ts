import { x402Client } from '@x402/core/client';
import { wrapFetchWithPayment } from '@x402/fetch';
import { ExactSvmScheme } from '@x402/svm/exact/client';
import { ExactSvmSchemeV1 } from '@x402/svm/exact/v1/client';
import type { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { createCorsSafeFetchForX402 } from '@/lib/x402CorsSafeFetch';
import { createWalletAdapterPartialSigner } from '@/lib/x402WalletSigner';

const V1_NETWORKS = ['solana', 'solana-devnet', 'solana-testnet'] as const;

/** Minimal wallet shape untuk x402 (Privy `signTransaction` + `PublicKey`). */
export type ArsweepX402SigningWallet = {
  publicKey: PublicKey | null;
  signTransaction?: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
};

function rpcUrlForX402(): string | undefined {
  const u =
    import.meta.env.VITE_HELIUS_RPC_URL?.trim() ||
    import.meta.env.VITE_RPC_ENDPOINT?.trim() ||
    import.meta.env.NEXT_PUBLIC_RPC_URL?.trim();
  return u || undefined;
}

/**
 * Fetch yang menangani HTTP 402: membangun pembayaran USDC (Solana) dan meminta tanda tangan wallet.
 */
export function createArsweepFetchWithPayment(
  wallet: ArsweepX402SigningWallet,
): typeof fetch {
  const signer = createWalletAdapterPartialSigner(wallet);
  const rpc = rpcUrlForX402();
  const cfg = rpc ? { rpcUrl: rpc } : undefined;
  const schemeV2 = new ExactSvmScheme(signer, cfg);
  const schemeV1 = new ExactSvmSchemeV1(signer, cfg);
  let client = new x402Client().register('solana:*', schemeV2);
  for (const n of V1_NETWORKS) {
    client = client.registerV1(n, schemeV1);
  }
  return wrapFetchWithPayment(createCorsSafeFetchForX402(fetch), client);
}
