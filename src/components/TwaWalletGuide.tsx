import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

export function TwaWalletGuide() {
  const { isInTelegram, walletFromTwa } = useTelegramWebApp();
  if (!isInTelegram) return null;

  const browserUrl = "https://arsweep.fun/app" + (walletFromTwa ? "?wallet=" + walletFromTwa : "");

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background/95 backdrop-blur p-6 text-center">
      <div className="text-4xl mb-4">🧹</div>
      <h2 className="text-xl font-semibold mb-2">Buka di Browser</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Untuk connect Phantom wallet dan sweep token,
        buka Arsweep di browser HP kamu.
      </p>
      <a
        href={browserUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-xs bg-primary text-primary-foreground rounded-xl py-3 px-6 font-medium text-center block mb-3"
      >
        Buka arsweep.fun di Browser
      </a>
      <p className="text-xs text-muted-foreground">
        Atau scan wallet tanpa connect untuk melihat kondisi wallet
      </p>
    </div>
  );
}
