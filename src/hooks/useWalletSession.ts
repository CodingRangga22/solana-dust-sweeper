import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { usePrivy, useLogin, useLogout } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { toast } from "sonner";
import { usePrivySendTransaction } from "@/hooks/usePrivySendTransaction";

const STORAGE_KEY_WALLET = "arsweep_locked_wallet";
const STORAGE_KEY_ACTIVITY = "arsweep_last_activity";
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const IDLE_CHECK_INTERVAL_MS = 30_000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
] as const;

/** localStorage keys used by legacy wallet-adapter / Phantom — cleared on disconnect */
const ADAPTER_STORAGE_KEYS = [
  "walletName",
  "walletAdapter",
  "walletConnected",
  "wallet-standard:wallet",
] as const;

export interface WalletSession {
  lockedPublicKey: PublicKey | null;
  sessionActive: boolean;
  walletMismatch: boolean;
  sendTransaction: ReturnType<typeof usePrivySendTransaction>["sendTransaction"];
  handleChangeWallet: () => void;
  handleDisconnect: () => Promise<void>;
  /** Disconnect fully and prompt login again (Privy) */
  handleDisconnectAndReconnect: () => Promise<void>;
  showChangeWalletModal: boolean;
  setShowChangeWalletModal: (show: boolean) => void;
}

export function useWalletSession(): WalletSession {
  const { ready: privyReady, authenticated } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { ready: walletsReady, wallets: privySolanaWallets } = useWallets();
  const { sendTransaction } = usePrivySendTransaction();

  const [lockedWallet, setLockedWallet] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_WALLET);
    } catch {
      return null;
    }
  });
  const [showChangeWalletModal, setShowChangeWalletModal] = useState(false);

  const primaryAddress = privySolanaWallets[0]?.address;

  const lockedPublicKey = useMemo(
    () => (lockedWallet ? new PublicKey(lockedWallet) : null),
    [lockedWallet],
  );

  const connected =
    privyReady && authenticated && walletsReady && privySolanaWallets.length > 0;

  // ── Lock on first connect (Privy Solana wallet address) ─────────────
  useEffect(() => {
    if (!connected || !primaryAddress || lockedWallet) return;
    setLockedWallet(primaryAddress);
    localStorage.setItem(STORAGE_KEY_WALLET, primaryAddress);
    localStorage.setItem(STORAGE_KEY_ACTIVITY, Date.now().toString());
    console.log(`[Wallet] Locked: ${primaryAddress}`);
  }, [connected, primaryAddress, lockedWallet]);

  // ── Account switch vs locked session ─────────────────────────────────
  const walletMismatch =
    !!lockedWallet &&
    !!primaryAddress &&
    primaryAddress !== lockedWallet;

  const prevMismatchRef = useRef(false);

  useEffect(() => {
    if (walletMismatch && !prevMismatchRef.current) {
      console.warn(
        `[Wallet] Account switch detected: current=${primaryAddress}, locked=${lockedWallet}. Ignoring.`,
      );
      toast.warning(
        'Wallet account changed. Click "Change Wallet" to switch.',
      );
    }
    prevMismatchRef.current = walletMismatch;
  }, [walletMismatch, primaryAddress, lockedWallet]);

  const clearLockedSession = useCallback(() => {
    setLockedWallet(null);
    localStorage.removeItem(STORAGE_KEY_WALLET);
    localStorage.removeItem(STORAGE_KEY_ACTIVITY);
  }, []);

  const clearLegacyAdapterStorage = useCallback(() => {
    ADAPTER_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }, []);

  // ── Change Wallet: show instruction modal ───────────────────────────
  const handleChangeWallet = useCallback(() => {
    setShowChangeWalletModal(true);
  }, []);

  const handleDisconnectAndReconnect = useCallback(async () => {
    setShowChangeWalletModal(false);
    try {
      clearLockedSession();
      clearLegacyAdapterStorage();
      await logout();
      await new Promise((resolve) => setTimeout(resolve, 300));
      login();
      toast.info(
        "Wallet disconnected. Sign in again to connect your Solana wallet.",
        { duration: 6500 },
      );
    } catch (err) {
      console.error("Disconnect and reconnect error:", err);
    }
  }, [clearLockedSession, clearLegacyAdapterStorage, logout, login]);

  const handleDisconnect = useCallback(async () => {
    try {
      console.log("[Wallet] Disconnecting...");
      clearLockedSession();
      clearLegacyAdapterStorage();
      await logout();
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  }, [clearLockedSession, clearLegacyAdapterStorage, logout]);

  // ── Idle auto-disconnect ────────────────────────────────────────────
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (!lockedWallet) return;

    const stored = localStorage.getItem(STORAGE_KEY_ACTIVITY);
    if (stored) lastActivityRef.current = Number(stored);

    const bump = () => {
      lastActivityRef.current = Date.now();
      localStorage.setItem(STORAGE_KEY_ACTIVITY, Date.now().toString());
    };

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, bump, { passive: true });
    }

    const timer = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) {
        console.warn("[Wallet] Idle timeout (15 min). Disconnecting.");
        toast.info("Session expired due to inactivity. Please reconnect.");
        void handleDisconnect();
      }
    }, IDLE_CHECK_INTERVAL_MS);

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, bump);
      }
      clearInterval(timer);
    };
  }, [lockedWallet, handleDisconnect]);

  const sessionActive = !!lockedWallet && connected && !walletMismatch;

  return {
    lockedPublicKey,
    sessionActive,
    walletMismatch,
    sendTransaction,
    handleChangeWallet,
    handleDisconnect,
    handleDisconnectAndReconnect,
    showChangeWalletModal,
    setShowChangeWalletModal,
  };
}
