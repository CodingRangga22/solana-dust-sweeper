import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useX402Payment } from '@/hooks/useX402Payment';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner';
}

export function X402PaymentModal({ isOpen, onClose, serviceType }: X402PaymentModalProps) {
  const priceDisplay = serviceType === 'analyze' || serviceType === 'rugcheck' ? '$0.10 USDC' : '$0.05 USDC';
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { isProcessing, error, requestPremium } = useX402Payment();
  const [result, setResult] = useState<any>(null);
  const title = serviceType === 'analyze' ? 'AI Wallet Analysis' 
    : serviceType === 'report' ? 'Quick Sweep Report'
    : serviceType === 'roast' ? 'Wallet Roast 🔥'
    : serviceType === 'rugcheck' ? 'Rug Pull Detector 🕵️'
    : 'Auto-Sweep Planner 🤖';
  const description = serviceType === 'analyze'
    ? 'Deep AI-powered analysis of your wallet holdings, risk assessment, and personalized recommendations'
    : serviceType === 'report' ? 'Fast report showing all dust tokens that can be swept to reclaim SOL rent'
    : serviceType === 'roast' ? 'Get a brutal AI roast of your wallet + a score from 0-100. Share it on X!'
    : serviceType === 'rugcheck' ? 'AI scans all your tokens against rugcheck.xyz to detect dangerous or suspicious tokens'
    : 'AI creates the optimal sweep plan — which accounts to close first for maximum SOL recovery';

  const endpoint =
    serviceType === 'analyze' ? '/premium/analyze'
      : serviceType === 'report' ? '/premium/report'
      : serviceType === 'roast' ? '/premium/roast'
      : serviceType === 'rugcheck' ? '/premium/rugcheck'
      : '/premium/planner';

  const canPay = !!publicKey && !isProcessing;

  const handlePay = async () => {
    if (!publicKey) return;
    const data = await requestPremium(publicKey.toString(), endpoint as any);
    setResult(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">Payment Modal</DialogTitle>
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
            <p className="text-xs text-muted-foreground mt-2">Pay via x402 on Solana mainnet (USDC).</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-muted/40 border rounded-lg p-4 space-y-3">
              {serviceType === 'roast' && result.data && (
                <>
                  <div className="text-center">
                    <span className="text-4xl font-black">{result.data.score}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                    <p className="text-xs font-bold text-purple-400 mt-1">{result.data.tier}</p>
                  </div>
                  <p className="text-sm italic text-center">"{result.data.roast}"</p>
                  <p className="text-xs text-muted-foreground text-center">{result.data.advice}</p>
                </>
              )}
              {serviceType === 'analyze' && result.data && (
                <>
                  <p className="text-sm font-medium">{result.data.recommendation}</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Token Accounts: {result.data.totalTokenAccounts}</p>
                    <p>Empty Accounts: {result.data.emptyAccounts}</p>
                    <p>Reclaimable SOL: {result.data.estimatedReclaimableSOL} SOL (${result.data.estimatedReclaimableUSD})</p>
                  </div>
                </>
              )}
              {(serviceType === 'report' || serviceType === 'rugcheck' || serviceType === 'planner') && result.data && (
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
              )}
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={!canPay}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${priceDisplay}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
