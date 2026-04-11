import type { User } from "@privy-io/react-auth";

function isWalletLike(
  a: unknown,
): a is { type: string; chainType?: string } {
  return (
    typeof a === "object" &&
    a !== null &&
    "type" in a &&
    typeof (a as { type: unknown }).type === "string"
  );
}

/** True if user linked an EVM wallet (MetaMask, etc.) via Privy. */
export function userHasLinkedEthereumWallet(
  user: User | null | undefined,
): boolean {
  if (!user?.linkedAccounts?.length) return false;
  return user.linkedAccounts.some((a) => {
    if (!isWalletLike(a)) return false;
    if (a.type !== "wallet" && a.type !== "smart_wallet") return false;
    return a.chainType === "ethereum";
  });
}

/** True if user linked a Solana wallet via Privy (linked account metadata). */
export function userHasLinkedSolanaMetadata(
  user: User | null | undefined,
): boolean {
  if (!user?.linkedAccounts?.length) return false;
  return user.linkedAccounts.some((a) => {
    if (!isWalletLike(a)) return false;
    if (a.type !== "wallet" && a.type !== "smart_wallet") return false;
    return a.chainType === "solana";
  });
}
