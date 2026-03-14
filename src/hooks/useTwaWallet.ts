import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useTelegramWebApp } from "./useTelegramWebApp";

/**
 * Di dalam TWA, kita tidak bisa connect Phantom langsung.
 * Hook ini menyediakan wallet address dari URL param sebagai
 * "read-only" public key untuk scan & display.
 * Transaksi diarahkan ke browser eksternal (arsweep.fun).
 */
export function useTwaWallet() {
  const { isInTelegram, walletFromTwa } = useTelegramWebApp();
  const [twaPublicKey, setTwaPublicKey] = useState<PublicKey | null>(null);

  useEffect(() => {
    if (!isInTelegram || !walletFromTwa) return;
    try {
      setTwaPublicKey(new PublicKey(walletFromTwa));
    } catch {
      console.warn("Invalid wallet address from TWA:", walletFromTwa);
    }
  }, [isInTelegram, walletFromTwa]);

  const openInBrowser = (path = "/app") => {
    const url = `https://arsweep.fun${path}?wallet=${walletFromTwa}`;
    window.open(url, "_blank");
  };

  return {
    isInTelegram,
    twaPublicKey,
    walletFromTwa,
    openInBrowser,
  };
}
