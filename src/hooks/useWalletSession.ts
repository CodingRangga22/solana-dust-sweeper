import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";

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

export interface WalletSession {
  lockedPublicKey: PublicKey | null;
  sessionActive: boolean;
  walletMismatch: boolean;
  sendTransaction: ReturnType<typeof useWallet>["sendTransaction"];
  handleChangeWallet: () => void;
  handleDisconnect: () => Promise<void>;
  /** Disconnect fully and open wallet modal (for "Disconnect" in change-wallet instruction modal) */
  handleDisconnectAndReconnect: () => Promise<void>;
  showChangeWalletModal: boolean;
  setShowChangeWalletModal: (show: boolean) => void;
}

/** localStorage keys used by @solana/wallet-adapter and Phantom to persist wallet choice */
const ADAPTER_STORAGE_KEYS = [
  "walletName",
  "walletAdapter",
  "walletConnected",
  "wallet-standard:wallet",
] as const;

export function useWalletSession(): WalletSession {
  const {
    publicKey: adapterPublicKey,
    connected: adapterConnected,
    disconnect,
    sendTransaction,
    select,
    wallet,
  } = useWallet();
  const { setVisible } = useWalletModal();

  const [lockedWallet, setLockedWallet] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_WALLET);
    } catch {
      return null;
    }
  });
  const [showChangeWalletModal, setShowChangeWalletModal] = useState(false);

  const lockedPublicKey = useMemo(
    () => (lockedWallet ? new PublicKey(lockedWallet) : null),
    [lockedWallet],
  );

  // ── Lock on first connect ───────────────────────────────────────────
  useEffect(() => {
    if (adapterConnected && adapterPublicKey && !lockedWallet) {
      const key = adapterPublicKey.toBase58();
      setLockedWallet(key);
      localStorage.setItem(STORAGE_KEY_WALLET, key);
      localStorage.setItem(STORAGE_KEY_ACTIVITY, Date.now().toString());
      console.log(`[Wallet] Locked: ${key}`);
    }
  }, [adapterConnected, adapterPublicKey, lockedWallet]);

  // ── Detect Phantom account switch ───────────────────────────────────
  const walletMismatch =
    !!lockedWallet &&
    !!adapterPublicKey &&
    adapterPublicKey.toBase58() !== lockedWallet;

  const prevMismatchRef = useRef(false);

  useEffect(() => {
    if (walletMismatch && !prevMismatchRef.current) {
      console.warn(
        `[Wallet] Account switch detected: adapter=${adapterPublicKey!.toBase58()}, locked=${lockedWallet}. Ignoring.`,
      );
      toast.warning(
        'Wallet account changed. Click "Change Wallet" to switch.',
      );
    }
    prevMismatchRef.current = walletMismatch;
  }, [walletMismatch, adapterPublicKey, lockedWallet]);

  // ── Change Wallet: show instruction modal (Phantom blocks in-page account selector) ──
  const handleChangeWallet = useCallback(() => {
    setShowChangeWalletModal(true);
  }, []);

  // ── Disconnect and open wallet modal (for "Disconnect" in change-wallet instruction modal) ──
  const handleDisconnectAndReconnect = useCallback(async () => {
    setShowChangeWalletModal(false);
    try {
      setLockedWallet(null);
      localStorage.removeItem(STORAGE_KEY_WALLET);
      localStorage.removeItem(STORAGE_KEY_ACTIVITY);
      try {
        if (wallet?.adapter?.connected) await wallet.adapter.disconnect();
      } catch (_) {}
      try {
        await disconnect();
      } catch (_) {}
      try {
        select(null as any);
      } catch (_) {}
      ADAPTER_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      await new Promise((resolve) => setTimeout(resolve, 300));
      setVisible(true);
    } catch (err) {
      console.error("Disconnect and reconnect error:", err);
    }
  }, [disconnect, select, setVisible, wallet, setShowChangeWalletModal]);

  // ── Disconnect (no modal reopen) ────────────────────────────────────
  const handleDisconnect = useCallback(async () => {
    try {
      console.log("[Wallet] Disconnecting...");

      setLockedWallet(null);
      localStorage.removeItem(STORAGE_KEY_WALLET);
      localStorage.removeItem(STORAGE_KEY_ACTIVITY);

      try {
        if (wallet?.adapter?.connected) await wallet.adapter.disconnect();
      } catch (_) {}
      try {
        await disconnect();
      } catch (_) {}
      try {
        select(null as any);
      } catch (_) {}

      ADAPTER_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  }, [disconnect, select, wallet]);

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
        handleDisconnect();
      }
    }, IDLE_CHECK_INTERVAL_MS);

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, bump);
      }
      clearInterval(timer);
    };
  }, [lockedWallet, handleDisconnect]);

  const sessionActive = !!lockedWallet && adapterConnected && !walletMismatch;

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
