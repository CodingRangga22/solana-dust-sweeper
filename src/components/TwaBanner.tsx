import { useEffect } from "react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

interface TwaBannerProps {
  onWalletDetected?: (wallet: string) => void;
  onSweepComplete?: (result: { sol_recovered: number; accounts_closed: number }) => void;
}

export function TwaBanner({ onWalletDetected, onSweepComplete }: TwaBannerProps) {
  const { isInTelegram, user, walletFromTwa, actionFromTwa, expand } = useTelegramWebApp();

  useEffect(() => {
    if (!isInTelegram) return;
    expand();
    if (walletFromTwa && onWalletDetected) {
      onWalletDetected(walletFromTwa);
    }
  }, [isInTelegram, walletFromTwa]);

  if (!isInTelegram) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border-b border-blue-500/20 text-sm">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400 shrink-0">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.038 9.593c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.48 14.51l-2.95-.924c-.642-.2-.654-.642.136-.953l11.527-4.443c.535-.194 1.003.13.37.058z"/>
      </svg>
      <span className="text-blue-300">
        {user ? `Halo, ${user.first_name}!` : "Dibuka dari Telegram"}
        {actionFromTwa === "sweep" && " — Wallet siap untuk di-sweep"}
      </span>
    </div>
  );
}

// Hook untuk kirim hasil sweep balik ke bot
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
      `✅ Sweep selesai!\n` +
      `Akun ditutup: ${result.accounts_closed}\n` +
      `SOL direcovery: ${result.sol_recovered.toFixed(4)} SOL`
    );

    // Tutup TWA setelah 2 detik
    setTimeout(() => close(), 2000);
  };

  return { notifySweepComplete, isInTelegram };
}
