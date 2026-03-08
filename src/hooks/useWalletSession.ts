import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";

const STORAGE_KEY_WALLET = "arsweep_locked_wallet";
const STORAGE_KEY_ACTIVITY = "arsweep_last_activity";
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const IDLE_CHECK_INTERVAL_MS = 30_000; // poll every 30 s

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
  handleChangeWallet: () => Promise<void>;
}

export function useWalletSession(): WalletSession {
  const {
    publicKey: adapterPublicKey,
    connected: adapterConnected,
    disconnect,
    sendTransaction,
  } = useWallet();

  // ── Locked wallet (persisted in localStorage) ───────────────────────
  const [lockedWallet, setLockedWallet] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_WALLET);
    } catch {
      return null;
    }
  });

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
      console.log(`[WalletSession] Wallet locked: ${key}`);
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
        `[WalletSession] Account switch detected → ` +
          `adapter=${adapterPublicKey!.toBase58()}, locked=${lockedWallet}. Ignoring.`,
      );
      toast.warning(
        "Phantom account changed — Arsweep is still using your original session. " +
          'Click "Change Wallet" to switch.',
      );
    }
    prevMismatchRef.current = walletMismatch;
  }, [walletMismatch, adapterPublicKey, lockedWallet]);

  // ── Change wallet (explicit user action) ────────────────────────────
  const handleChangeWallet = useCallback(async () => {
    setLockedWallet(null);
    localStorage.removeItem(STORAGE_KEY_WALLET);
    localStorage.removeItem(STORAGE_KEY_ACTIVITY);
    try {
      await disconnect();
    } catch {
      // Phantom may throw if already disconnected
    }
    console.log("[WalletSession] Session cleared — ready for new wallet.");
  }, [disconnect]);

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
      const idle = Date.now() - lastActivityRef.current;
      if (idle >= IDLE_TIMEOUT_MS) {
        console.warn("[WalletSession] Idle timeout (15 min). Auto-disconnecting.");
        toast.info("Session expired due to inactivity. Please reconnect.");
        handleChangeWallet();
      }
    }, IDLE_CHECK_INTERVAL_MS);

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, bump);
      }
      clearInterval(timer);
    };
  }, [lockedWallet, handleChangeWallet]);

  // ── Session cleared while adapter still connected ───────────────────
  // (e.g. user manually cleared localStorage in devtools)
  useEffect(() => {
    if (!lockedWallet && adapterConnected) {
      disconnect().catch(() => {});
    }
  }, [lockedWallet, adapterConnected, disconnect]);

  // ── Public API ──────────────────────────────────────────────────────
  const sessionActive = !!lockedWallet && adapterConnected && !walletMismatch;

  return {
    lockedPublicKey,
    sessionActive,
    walletMismatch,
    sendTransaction,
    handleChangeWallet,
  };
}
