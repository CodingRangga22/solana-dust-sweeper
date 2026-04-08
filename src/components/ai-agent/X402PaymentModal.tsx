import { useEffect, useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useX402Payment, priceUsdcFor, type PremiumServicePath } from '@/hooks/useX402Payment';
import { formatPremiumResult } from '@/lib/formatPremiumResult';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner';
  /** Called after payment request succeeds (HTTP OK + body). Parent can append to chat. */
  onPaidSuccess?: (data: unknown) => void;
}

export function X402PaymentModal({ isOpen, onClose, serviceType, onPaidSuccess }: X402PaymentModalProps) {
  const priceUsdc = priceUsdcFor(serviceType);
  const priceDisplay = serviceType === 'analyze' || serviceType === 'rugcheck' ? '$0.10 USDC' : '$0.05 USDC';
  const {
    publicKey,
    signTransaction,
    connected,
    isProcessing,
    error,
    requestPremium,
    usdcBalance,
    solLamports,
    balanceLoading,
    refreshBalances,
    minSolLamports,
  } = useX402Payment();
  const [result, setResult] = useState<any>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  const title =
    serviceType === 'analyze'
      ? 'AI Wallet Analysis'
      : serviceType === 'report'
        ? 'Quick Sweep Report'
        : serviceType === 'roast'
          ? 'Wallet Roast 🔥'
          : serviceType === 'rugcheck'
            ? 'Rug Pull Detector 🕵️'
            : 'Auto-Sweep Planner 🤖';
  const description =
    serviceType === 'analyze'
      ? 'Deep AI-powered analysis of your wallet holdings, risk assessment, and personalized recommendations'
      : serviceType === 'report'
        ? 'Fast report showing all dust tokens that can be swept to reclaim SOL rent'
        : serviceType === 'roast'
          ? 'Get a brutal AI roast of your wallet + a score from 0-100. Share it on X!'
          : serviceType === 'rugcheck'
            ? 'AI scans all your tokens against rugcheck.xyz to detect dangerous or suspicious tokens'
            : 'AI creates the optimal sweep plan — which accounts to close first for maximum SOL recovery';

  const endpoint: PremiumServicePath =
    serviceType === 'analyze'
      ? '/premium/analyze'
      : serviceType === 'report'
        ? '/premium/report'
        : serviceType === 'roast'
          ? '/premium/roast'
          : serviceType === 'rugcheck'
            ? '/premium/rugcheck'
            : '/premium/planner';

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setAcknowledged(false);
      void refreshBalances();
    }
  }, [isOpen, refreshBalances]);

  const usdcOk = usdcBalance != null && usdcBalance + 1e-9 >= priceUsdc;
  const walletReady = !!publicKey && !!signTransaction && connected;
  const canSignAndPay =
    walletReady && !balanceLoading && usdcOk && acknowledged && !isProcessing;

  const handlePay = async () => {
    if (!publicKey) return;
    const data = await requestPremium(publicKey.toString(), endpoint);
    setResult(data);
    onPaidSuccess?.(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">Payment Modal</DialogTitle>
        <DialogDescription className="sr-only">
          Pembayaran fitur premium Arsweep melalui x402 dan facilitator Pay AI di Solana mainnet.
        </DialogDescription>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground">Powered by x402 Protocol</p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>

          <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-600/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Price</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {priceDisplay}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pembayaran USDC di <strong>Solana mainnet</strong> dari wallet Anda. Setelah Anda mengonfirmasi, wallet akan
              meminta tanda tangan transaksi sebelum fitur dijalankan.
            </p>
          </div>

          {!connected || !publicKey ? (
            <p className="text-sm text-amber-400">Hubungkan wallet terlebih dahulu.</p>
          ) : !signTransaction ? (
            <p className="text-sm text-amber-400">
              Wallet ini tidak mengekspos penandatanganan transaksi tunggal. Coba Phantom / Solflare di desktop.
            </p>
          ) : (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm space-y-1">
              <p className="font-medium text-foreground">Saldo mainnet (untuk pembayaran)</p>
              {balanceLoading ? (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Memuat saldo USDC…
                </p>
              ) : (
                <>
                  <p>
                    USDC:{' '}
                    <span className="font-mono">{usdcBalance != null ? usdcBalance.toFixed(6) : '—'}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SOL (referensi):{' '}
                    {solLamports != null ? (solLamports / 1e9).toFixed(6) : '—'}{' '}
                    {solLamports != null && solLamports < minSolLamports ? (
                      <span className="text-amber-500"> · Biaya jaringan biasanya ditanggung facilitator; jika gagal, tambah sedikit SOL.</span>
                    ) : null}
                  </p>
                </>
              )}
            </div>
          )}

          {walletReady && !balanceLoading && usdcBalance != null && !usdcOk && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
              Saldo USDC Anda di Solana mainnet tidak cukup untuk transaksi ini. Diperlukan setidaknya{' '}
              <span className="font-mono">{priceUsdc.toFixed(2)} USDC</span>. Isi USDC mainnet di wallet ini lalu coba lagi.
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">{error}</div>
          )}

          {result && (
            <div className="max-h-56 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{formatPremiumResult(serviceType, result)}</ReactMarkdown>
            </div>
          )}

          <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
            <Checkbox
              checked={acknowledged}
              onCheckedChange={(v) => setAcknowledged(v === true)}
              disabled={!walletReady || !usdcOk || balanceLoading}
              className="mt-0.5"
            />
            <span>
              Saya mengerti bahwa saya akan <strong>menandatangani</strong> transaksi pembayaran USDC sebesar {priceDisplay}{' '}
              di Solana mainnet, dan fitur premium hanya berjalan setelah pembayaran berhasil.
            </span>
          </label>

          <Button
            onClick={handlePay}
            disabled={!canSignAndPay}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menunggu tanda tangan / memproses…
              </>
            ) : (
              `Tanda tangani & bayar ${priceDisplay}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
