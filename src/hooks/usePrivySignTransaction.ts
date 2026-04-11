import { useCallback } from "react";
import { VersionedTransaction } from "@solana/web3.js";
import { useSignTransaction, useWallets } from "@privy-io/react-auth/solana";
import { NETWORK } from "@/config/env";

function privyChainForNetwork(): "solana:mainnet" | "solana:devnet" {
  return NETWORK === "mainnet" ? "solana:mainnet" : "solana:devnet";
}

/**
 * Privy-powered `signTransaction` with the same contract as wallet-adapter for
 * versioned transactions (x402 `ExactSvmScheme`). Pair with `wallets[0]?.address`
 * when building the object for `createWalletAdapterPartialSigner`.
 */
export function usePrivySignTransaction() {
  const { wallets } = useWallets();
  const { signTransaction: privySignTransaction } = useSignTransaction();

  const signTransaction = useCallback(
    async (transaction: VersionedTransaction): Promise<VersionedTransaction> => {
      const wallet = wallets[0];
      if (!wallet) {
        throw new Error("No Privy Solana wallet connected");
      }

      const serialized = transaction.serialize();
      const { signedTransaction } = await privySignTransaction({
        transaction: serialized,
        wallet,
        chain: privyChainForNetwork(),
      });

      return VersionedTransaction.deserialize(signedTransaction);
    },
    [wallets, privySignTransaction]
  );

  return { signTransaction };
}
