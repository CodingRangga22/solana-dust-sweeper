import { usePrivy, useLogin, useConnectWallet } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { toast } from "sonner";
import { describePrivyWalletError } from "@/lib/privyErrors";
import {
  userHasLinkedEthereumWallet,
  userHasLinkedSolanaMetadata,
} from "@/lib/privyLinkedAccounts";

/**
 * Privy-first Solana flow:
 * 1) login() — modal Privy
 * 2) connectWallet({ walletChainType: 'solana' }) — sampai ada wallet Solana di Privy
 * On-chain signing memakai Privy Solana hooks (bukan wallet-adapter).
 */
export function useArsweepWalletAuthUi() {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { connectWallet } = useConnectWallet({
    onError: (err) => {
      console.error("[Privy] connectWallet:", err);
      toast.error(describePrivyWalletError(err));
    },
  });
  const { wallets: privySolanaWallets, ready: privySolanaReady } = useWallets();

  const hasEthLinked = userHasLinkedEthereumWallet(user);
  const hasSolMeta = userHasLinkedSolanaMetadata(user);
  const showSwitchFromEvmHint =
    authenticated &&
    privySolanaReady &&
    privySolanaWallets.length === 0 &&
    hasEthLinked &&
    !hasSolMeta;

  const needsPrivySolanaWallet =
    authenticated &&
    privySolanaReady &&
    privySolanaWallets.length === 0;

  const connectSolana = () =>
    connectWallet({ walletChainType: "solana" }).catch(() => {
      /* onError toast */
    });

  return {
    ready,
    authenticated,
    login,
    connectSolana,
    showSwitchFromEvmHint,
    needsPrivySolanaWallet,
  };
}
