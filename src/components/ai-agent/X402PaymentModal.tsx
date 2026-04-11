import { useEffect, useState } from 'react';
import { X, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useX402Payment, priceUsdcFor, type PremiumServicePath } from '@/hooks/useX402Payment';
import { formatPremiumResult } from '@/lib/formatPremiumResult';
import { cn } from '@/lib/utils';

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'max-w-md gap-0 overflow-hidden border border-white/[0.1] bg-[#0a0c10] p-0 shadow-2xl shadow-black/50',
          'sm:rounded-2xl',
        )}
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" aria-hidden />

        <DialogTitle className="sr-only">Payment Modal</DialogTitle>
        <DialogDescription className="sr-only">
          Pembayaran fitur premium Arsweep melalui x402 dan facilitator Pay AI di Solana mainnet.
        </DialogDescription>

        <div className="relative px-6 pb-2 pt-6">
          <div className="flex items-start gap-4 pr-8">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/25 via-sky-600/15 to-slate-800/40 ring-1 ring-cyan-500/25 shadow-lg shadow-cyan-500/10">
              <Sparkles className="h-6 w-6 text-cyan-200" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-lg font-semibold leading-snug tracking-tight text-white">{title}</h3>
              <p className="flex items-center gap-1.5 text-xs text-white/45">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-cyan-400/70" />
                <span>Powered by x402 · Solana mainnet</span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 pb-6">
          <p className="text-sm leading-relaxed text-white/55">{description}</p>

          <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.07] via-white/[0.02] to-transparent p-4 shadow-inner shadow-black/20 ring-1 ring-white/[0.04]">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/45">Price</span>
              <span className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-sky-200 to-white">
                {priceDisplay}
              </span>
            </div>
            <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-white/45">
              Pembayaran USDC di <strong className="text-white/70">Solana mainnet</strong> dari wallet Anda. Setelah
              mengonfirmasi, wallet akan meminta tanda tangan transaksi sebelum fitur dijalankan.
            </p>
          </div>

          {!connected || !publicKey ? (
            <p className="rounded-lg border border-sky-500/20 bg-sky-500/[0.06] px-3 py-2.5 text-sm text-sky-200/90">
              Hubungkan wallet terlebih dahulu.
            </p>
          ) : !signTransaction ? (
            <p className="rounded-lg border border-sky-500/20 bg-sky-500/[0.06] px-3 py-2.5 text-sm text-sky-200/90">
              Wallet ini tidak mengekspos penandatanganan transaksi tunggal. Coba Phantom / Solflare di desktop.
            </p>
          ) : (
            <div className="space-y-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm shadow-sm">
              <p className="font-medium text-white/90">Saldo mainnet (untuk pembayaran)</p>
              {balanceLoading ? (
                <p className="flex items-center gap-2 text-white/45">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400/80" />
                  Memuat saldo USDC…
                </p>
              ) : (
                <>
                  <p className="text-white/75">
                    USDC:{' '}
                    <span className="font-mono tabular-nums text-white">
                      {usdcBalance != null ? usdcBalance.toFixed(6) : '—'}
                    </span>
                  </p>
                  <p className="text-xs text-white/40">
                    SOL (referensi):{' '}
                    <span className="font-mono tabular-nums text-white/60">
                      {solLamports != null ? (solLamports / 1e9).toFixed(6) : '—'}
                    </span>
                    {solLamports != null && solLamports < minSolLamports ? (
                      <span className="text-sky-400/85">
                        {' '}
                        · Biaya jaringan biasanya ditanggung facilitator; jika gagal, tambah sedikit SOL.
                      </span>
                    ) : null}
                  </p>
                </>
              )}
            </div>
          )}

          {walletReady && !balanceLoading && usdcBalance != null && !usdcOk && (
            <div className="rounded-xl border border-red-500/35 bg-red-950/30 p-3 text-sm text-red-200/95">
              Saldo USDC Anda di Solana mainnet tidak cukup untuk transaksi ini. Diperlukan setidaknya{' '}
              <span className="font-mono font-medium text-red-100">{priceUsdc.toFixed(2)} USDC</span>. Isi USDC mainnet di
              wallet ini lalu coba lagi.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/35 bg-red-950/25 p-3 text-sm text-red-300">{error}</div>
          )}

          {result && (
            <div className="max-h-56 overflow-auto rounded-xl border border-white/[0.08] bg-black/30 p-3 text-xs prose prose-sm dark:prose-invert max-w-none prose-headings:text-white/90 prose-p:text-white/75 prose-strong:text-white">
              <ReactMarkdown>{formatPremiumResult(serviceType, result)}</ReactMarkdown>
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-white/55 transition-colors hover:border-white/[0.1] hover:bg-white/[0.03]">
            <Checkbox
              checked={acknowledged}
              onCheckedChange={(v) => setAcknowledged(v === true)}
              disabled={!walletReady || !usdcOk || balanceLoading}
              className={cn(
                'mt-0.5 h-4 w-4 rounded border-white/25 bg-white/[0.04]',
                'data-[state=checked]:border-cyan-400 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-[#042018]',
                'focus-visible:ring-cyan-500/40 focus-visible:ring-offset-0 focus-visible:ring-offset-[#0a0c10]',
              )}
            />
            <span className="leading-snug">
              Saya mengerti bahwa saya akan <strong className="text-white/85">menandatangani</strong> transaksi pembayaran
              USDC sebesar {priceDisplay} di Solana mainnet, dan fitur premium hanya berjalan setelah pembayaran berhasil.
            </span>
          </label>

          <Button
            onClick={handlePay}
            disabled={!canSignAndPay}
            className={cn(
              'h-12 w-full rounded-xl font-semibold shadow-lg transition-all',
              'bg-gradient-to-r from-cyan-600 via-sky-600 to-cyan-700 text-white',
              'hover:from-cyan-500 hover:via-sky-500 hover:to-cyan-600 hover:shadow-cyan-500/20',
              'disabled:from-white/10 disabled:via-white/10 disabled:to-white/10 disabled:text-white/35 disabled:shadow-none',
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
