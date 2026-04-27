import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useX402Payment } from '@/hooks/useX402Payment';
import { buildSyraTokenRiskQuestion, fetchSyraTokenRisk } from '@/lib/syraTokenRisk';

function parseX402PriceUsdcFromHeaders(headers: Headers): number | null {
  const raw = headers.get('payment-required') || headers.get('PAYMENT-REQUIRED')
    || headers.get('x402-price') || headers.get('x402-payment-required') || headers.get('x402-payment');
  if (!raw) return null;

  const attempts: string[] = [raw];
  try { attempts.push(atob(raw)); } catch { /* not base64 */ }

  for (const attempt of attempts) {
    try {
      const json = JSON.parse(attempt);
      const accepts = (json as any)?.accepts;
      if (Array.isArray(accepts)) {
        for (const a of accepts) {
          if (typeof a?.network === 'string' && a.network.includes('solana')) {
            const amt = Number(a?.amount);
            if (Number.isFinite(amt) && amt > 0) return amt / 1_000_000;
          }
        }
        const amt = Number(accepts[0]?.amount);
        if (Number.isFinite(amt) && amt > 0) return amt / 1_000_000;
      }
      const candidates = [(json as any)?.price, (json as any)?.amount];
      for (const c of candidates) {
        const n = typeof c === 'string' ? Number(c) : typeof c === 'number' ? c : NaN;
        if (Number.isFinite(n) && n > 0) return n > 1000 ? n / 1_000_000 : n;
      }
    } catch { /* ignore */ }
  }
  return null;
}

type SyraRiskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: unknown) => void;
};

export function SyraRiskModal({ isOpen, onClose, onSuccess }: SyraRiskModalProps) {
  const { publicKey, signTransaction, connected, usdcBalance, balanceLoading, refreshBalances } = useX402Payment();
  const signingWallet = useMemo(() => ({ publicKey, signTransaction }), [publicKey, signTransaction]);

  // Syra x402 pricing can vary, and in practice may be higher than earlier estimates.
  // We enforce a conservative minimum to prevent "confirm anyway" flows when balance is clearly insufficient.
  const MIN_SYRA_USDC = 0.5;

  const [mint, setMint] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotedPriceUsdc, setQuotedPriceUsdc] = useState<number | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const quoteGenRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    setMint('');
    setAcknowledged(false);
    setError(null);
    setQuotedPriceUsdc(null);
    setQuoteLoading(false);
    void refreshBalances();
  }, [isOpen, refreshBalances]);

  const walletReady = connected && !!publicKey && !!signTransaction;
  const needsQuote = walletReady && mint.trim().length > 0;
  const conservativeOk = usdcBalance != null ? usdcBalance + 1e-9 >= MIN_SYRA_USDC : false;
  const usdcOk =
    usdcBalance != null && typeof quotedPriceUsdc === 'number'
      ? usdcBalance + 1e-9 >= quotedPriceUsdc
      : false;
  const canRun =
    walletReady &&
    acknowledged &&
    !isProcessing &&
    !balanceLoading &&
    !quoteLoading &&
    (!needsQuote || typeof quotedPriceUsdc === 'number') &&
    (quotedPriceUsdc === 0 || usdcOk) &&
    conservativeOk;

  // Quote the exact x402 price for this mint (like premium modals).
  useEffect(() => {
    if (!isOpen) return;
    if (!needsQuote) {
      setQuotedPriceUsdc(null);
      setQuoteLoading(false);
      return;
    }
    const trimmed = mint.trim();
    quoteGenRef.current += 1;
    const gen = quoteGenRef.current;
    const t = setTimeout(() => {
      (async () => {
        setQuoteLoading(true);
        try {
          const quoteRes = await fetch('/syra/brain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: buildSyraTokenRiskQuestion(trimmed) }),
          });
          if (gen !== quoteGenRef.current) return;

          if (quoteRes.status === 402) {
            const p = parseX402PriceUsdcFromHeaders(quoteRes.headers);
            setQuotedPriceUsdc(p);
            if (p == null) {
              setError('Could not read Syra x402 price quote. Please try again.');
              return;
            }
            if (usdcBalance != null && usdcBalance + 1e-9 < p) {
              setError(
                `Insufficient USDC balance. This Syra request requires ~${p.toFixed(2)} USDC, but your balance is ${usdcBalance.toFixed(6)}.`,
              );
            } else {
              setError(null);
            }
            return;
          }

          if (quoteRes.ok) {
            // Request did not require payment (free/covered). Treat price as 0.
            setQuotedPriceUsdc(0);
            setError(null);
            return;
          }

          setQuotedPriceUsdc(null);
          setError(`Failed to fetch Syra price quote (${quoteRes.status}).`);
        } catch (e) {
          if (gen !== quoteGenRef.current) return;
          setQuotedPriceUsdc(null);
          setError(e instanceof Error ? e.message : 'Failed to fetch Syra price quote');
        } finally {
          if (gen === quoteGenRef.current) setQuoteLoading(false);
        }
      })();
    }, 450);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, needsQuote, mint, walletReady, usdcBalance]);

  const handleRun = async () => {
    if (!walletReady) return;
    const trimmed = mint.trim();
    if (!trimmed) {
      setError('Please enter a Solana token mint address.');
      return;
    }
    if (usdcBalance != null && usdcBalance + 1e-9 < MIN_SYRA_USDC) {
      setError(
        `Insufficient USDC balance. To run Syra Token Risk, keep at least ${MIN_SYRA_USDC.toFixed(2)} USDC in this wallet.`,
      );
      return;
    }
    if (typeof quotedPriceUsdc === 'number' && quotedPriceUsdc > 0 && usdcBalance != null && usdcBalance + 1e-9 < quotedPriceUsdc) {
      setError(
        `Insufficient USDC balance. This Syra request requires ~${quotedPriceUsdc.toFixed(2)} USDC, but your balance is ${usdcBalance.toFixed(6)}.`,
      );
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const data = await fetchSyraTokenRisk(signingWallet, trimmed);
      onSuccess?.(data);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Syra request failed';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          'max-w-md gap-0 overflow-hidden border border-white/[0.1] bg-[#0a0c10] p-0 shadow-2xl shadow-black/50',
          'sm:rounded-2xl',
        )}
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" aria-hidden />

        <DialogTitle className="sr-only">Syra Token Risk</DialogTitle>
        <DialogDescription className="sr-only">Syra x402 premium token risk check</DialogDescription>

        <div className="relative px-6 pb-3 pt-6">
          <div className="flex items-start gap-4 pr-8">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 via-white/10 to-slate-800/40 ring-1 ring-white/25 shadow-lg shadow-black/20">
              <ShieldCheck className="h-6 w-6 text-white/85" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="text-lg font-semibold leading-snug tracking-tight text-white">Syra Token Risk</h3>
              <p className="text-xs text-white/45">Premium · Powered by Syra (x402 on Solana mainnet)</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 pb-6">
          <div className="rounded-xl border border-white/20 bg-white/[0.03] p-4 text-sm text-white/70">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/45">Price</span>
              <span className="text-xl font-bold tracking-tight text-white">
                {quoteLoading
                  ? '…'
                  : quotedPriceUsdc != null
                    ? quotedPriceUsdc === 0
                      ? 'Free / covered'
                      : `~$${quotedPriceUsdc.toFixed(2)} USDC`
                    : 'Varies'}
              </span>
            </div>
            <p className="mt-2 text-xs text-white/45">
              Final price is set by Syra via x402 and shown in your wallet prompt when Syra responds with{' '}
              <code className="text-white/70">402 Payment Required</code>.
            </p>
            <div className="mt-3 border-t border-white/[0.06] pt-3 text-xs text-white/45">
              {balanceLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white/70" />
                  Loading USDC balance…
                </span>
              ) : (
                <span>
                  USDC balance:{' '}
                  <span className="font-mono tabular-nums text-white/70">
                    {usdcBalance != null ? usdcBalance.toFixed(6) : '—'}
                  </span>
                  {usdcBalance != null && usdcBalance + 1e-9 < MIN_SYRA_USDC ? (
                    <span className="text-white/70">
                      {' '}
                      · Needs at least <span className="font-mono text-white/80">{MIN_SYRA_USDC.toFixed(2)} USDC</span> to run
                    </span>
                  ) : null}
                </span>
              )}
            </div>
          </div>

          {!connected || !publicKey ? (
            <p className="rounded-lg border border-white/20 bg-white/[0.06] px-3 py-2.5 text-sm text-white/85">
              Connect your Privy (Solana) wallet first.
            </p>
          ) : !signTransaction ? (
            <p className="rounded-lg border border-white/20 bg-white/[0.06] px-3 py-2.5 text-sm text-white/85">
              This wallet does not support transaction signing. Try Phantom / Solflare on desktop.
            </p>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Token mint address
              </label>
              <input
                value={mint}
                onChange={(e) => setMint(e.target.value)}
                placeholder="e.g. So11111111111111111111111111111111111111112"
                className="h-11 w-full rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-sm text-white/90 placeholder:text-white/25 outline-none transition-colors focus:border-white/25"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/35 bg-red-950/25 p-3 text-sm text-red-200/95">{error}</div>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-white/55 transition-colors hover:border-white/[0.1] hover:bg-white/[0.03]">
            <Checkbox
              checked={acknowledged}
              onCheckedChange={(v) => setAcknowledged(v === true)}
              disabled={!walletReady || isProcessing || quoteLoading || (needsQuote && quotedPriceUsdc == null)}
              className={cn(
                'mt-0.5 h-4 w-4 rounded border-white/25 bg-white/[0.04]',
                'data-[state=checked]:border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-[#0a0a0a]',
                'focus-visible:ring-white/40 focus-visible:ring-offset-0 focus-visible:ring-offset-[#0a0c10]',
              )}
            />
            <span className="leading-snug">
              I understand this sends a premium request to Syra and my wallet may be asked to sign a USDC transaction (x402).
            </span>
          </label>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              className="border border-white/[0.08] bg-white/[0.04] text-white/90 hover:bg-white/[0.07]"
              onClick={onClose}
              type="button"
              disabled={isProcessing}
            >
              Close
            </Button>
            <Button onClick={handleRun} type="button" disabled={!canRun}>
              {isProcessing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running…
                </span>
              ) : (
                'Run Syra'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

