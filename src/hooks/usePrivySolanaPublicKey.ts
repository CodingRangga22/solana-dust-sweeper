import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallets } from "@privy-io/react-auth/solana";

/** Alamat Solana aktif dari Privy (`wallets[0]`), untuk UI yang tidak memakai `useWalletSession`. */
export function usePrivySolanaPublicKey() {
  const { wallets, ready } = useWallets();
  const address = wallets[0]?.address;
  const publicKey = useMemo(
    () => (address ? new PublicKey(address) : null),
    [address],
  );
  return { publicKey, ready, address };
}
