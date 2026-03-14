import { useEffect } from "react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

interface TwaBannerProps {
  onWalletDetected?: (wallet: string) => void;
}

export function TwaBanner({ onWalletDetected }: TwaBannerProps) {
  const { isInTelegram, user, walletFromTwa, expand } = useTelegramWebApp();

  useEffect(() => {
    if (!isInTelegram) return;
    expand();
    if (walletFromTwa && onWalletDetected) {
      onWalletDetected(walletFromTwa);
    }
  }, [isInTelegram, walletFromTwa]);

  if (!isInTelegram) return null;

  const browserUrl = "https://arsweep.fun/app" + (walletFromTwa ? "?wallet=" + walletFromTwa : "");

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-2 px-4 py-2 bg-blue-600/15 border-b border-blue-500/20 text-sm backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="text-blue-300 text-xs">
          {user ? user.first_name + " via Telegram" : "Arsweep via Telegram"}
        </span>
      </div>
      {walletFromTwa && (
        <a href={browserUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 underline shrink-0">
          Buka di Browser
        </a>
      )}
    </div>
  );
}

export function useTwaSweepCallback() {
  const { isInTelegram, sendDataToBot, showAlert, close } = useTelegramWebApp();

  const notifySweepComplete = (result: {
    sol_recovered: number;
    accounts_closed: number;
    wallet: string;
  }) => {
    if (!isInTelegram) return;
    sendDataToBot({
      type: "sweep_complete",
      sol_recovered: result.sol_recovered,
      accounts_closed: result.accounts_closed,
      wallet: result.wallet,
      timestamp: Date.now(),
    });
    showAlert(
      "Sweep selesai! Akun ditutup: " + result.accounts_closed +
      ". SOL direcovery: " + result.sol_recovered.toFixed(4) + " SOL"
    );
    setTimeout(() => close(), 2000);
  };

  return { notifySweepComplete, isInTelegram };
}
