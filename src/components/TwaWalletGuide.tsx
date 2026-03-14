import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

export function TwaWalletGuide() {
  const { isInTelegram } = useTelegramWebApp();
  if (!isInTelegram) return null;

  return (
    <div className="mx-4 mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
      <p className="font-medium text-amber-400 mb-2">Cara connect wallet di Telegram</p>
      <ol className="text-amber-300/80 space-y-1 list-decimal list-inside">
        <li>Buka Phantom app di HP kamu</li>
        <li>Aktifkan WalletConnect di Phantom</li>
        <li>Scan QR atau klik tombol connect</li>
        <li>Approve di Phantom app</li>
      </ol>
      <p className="mt-3 text-blue-400 text-xs">
        Atau buka arsweep.fun di browser untuk transaksi langsung.
      </p>
    </div>
  );
}
