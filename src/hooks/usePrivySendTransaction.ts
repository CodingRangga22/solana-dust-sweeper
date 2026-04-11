import { useCallback } from "react";
import bs58 from "bs58";
import {
  Connection,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import type { SendOptions } from "@solana/web3.js";
import {
  useSignAndSendTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";
import { NETWORK } from "@/config/env";

function privyChainForNetwork(): "solana:mainnet" | "solana:devnet" {
  return NETWORK === "mainnet" ? "solana:mainnet" : "solana:devnet";
}

function serializeForWallet(
  transaction: Transaction | VersionedTransaction
): Uint8Array {
  if (transaction instanceof VersionedTransaction) {
    return transaction.serialize();
  }
  return transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });
}

/**
 * Bridges Privy `signAndSendTransaction` to the same shape as
 * `@solana/wallet-adapter-react` `sendTransaction` (Promise&lt;signature string&gt;).
 */
export function usePrivySendTransaction() {
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();

  const sendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction,
      _connection: Connection,
      _options?: SendOptions
    ): Promise<string> => {
      const wallet = wallets[0];
      if (!wallet) {
        throw new Error("No Privy Solana wallet connected");
      }

      const serialized = serializeForWallet(transaction);
      const chain = privyChainForNetwork();

      const { signature } = await signAndSendTransaction({
        transaction: serialized,
        wallet,
        chain,
      });

      return bs58.encode(Buffer.from(signature));
    },
    [wallets, signAndSendTransaction]
  );

  return { sendTransaction };
}
