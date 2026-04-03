import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useX402Payment } from '@/hooks/useX402Payment';
import { sendUSDCPayment, getSolanaConnection, checkUSDCBalance } from '@/lib/solana-payment';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'analyze' | 'report';
}

export function X402PaymentModal({ isOpen, onClose, serviceType }: X402PaymentModalProps) {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { isProcessing, error, requestAnalysis, requestReport } = useX402Payment();
  const [result, setResult] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'paying' | 'verifying' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string>('');
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [hasUsdcAccount, setHasUsdcAccount] = useState<boolean>(false);
  const [checkingBalance, setCheckingBalance] = useState(false);

  const price = serviceType === 'analyze' ? 0.10 : 0.05;
  const priceDisplay = serviceType === 'analyze' ? '$0.10 USDC' : '$0.05 USDC';
  const title = serviceType === 'analyze' ? 'AI Wallet Analysis' : 'Quick Sweep Report';
  const description = serviceType === 'analyze' 
    ? 'Deep AI-powered analysis of your wallet holdings, risk assessment, and personalized recommendations'
    : 'Fast report showing all dust tokens that can be swept to reclaim SOL rent';

  // Check USDC balance when modal opens
  useEffect(() => {
    if (isOpen && publicKey) {
      checkBalance();
    }
  }, [isOpen, publicKey]);

  const checkBalance = async () => {
    if (!publicKey) return;
    
    setCheckingBalance(true);
    try {
      const connection = getSolanaConnection();
      const balanceInfo = await checkUSDCBalance(connection, publicKey);
      setUsdcBalance(balanceInfo.balance);
      setHasUsdcAccount(balanceInfo.hasAccount);
    } catch (err) {
      console.error('Balance check error:', err);
    } finally {
      setCheckingBalance(false);
    }
  };

  const handlePurchase = async () => {
    if (!publicKey || !wallet) {
      setPaymentError('Please connect your wallet first');
      return;
    }

    try {
      setPaymentStatus('paying');
      setPaymentError('');

      const connection = getSolanaConnection();
      const paymentResult = await sendUSDCPayment(connection, wallet, price);

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      setPaymentStatus('verifying');

      const data = serviceType === 'analyze'
        ? await requestAnalysis(publicKey.toString(), paymentResult.signature)
        : await requestReport(publicKey.toString(), paymentResult.signature);
      
      setResult(data);
      setPaymentStatus('success');
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStatus('error');
    }
  };

  const handleClose = () => {
    setResult(null);
    setPaymentStatus('idle');
    setPaymentError('');
    setUsdcBalance(null);
    onClose();
  };

  const canPay = hasUsdcAccount && usdcBalance !== null && usdcBalance >= price;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
          <Button onClick={handleClose} variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {paymentStatus === 'idle' && !result && (
          <>
            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground">{description}</p>

              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-600/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Price</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {priceDisplay}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  One-time payment via x402 protocol on Solana
                </p>
              </div>

              {/* USDC Balance Display */}
              {publicKey && (
                <div className="bg-muted/50 rounded-lg p-3 border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">Your USDC Balance</span>
                    {checkingBalance && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-semibold">
                      {usdcBalance !== null ? `$${usdcBalance.toFixed(2)}` : '---'}
                    </span>
                    {usdcBalance !== null && (
                      <span className={`text-xs ${canPay ? 'text-green-500' : 'text-red-500'}`}>
                        {canPay ? '✓ Sufficient' : '✗ Insufficient'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {!publicKey && (
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 text-sm text-yellow-600">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  Please connect your Solana wallet to continue
                </div>
              )}

              {publicKey && !hasUsdcAccount && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-red-400">
                      <p className="font-semibold mb-1">No USDC Found</p>
                      <p className="text-xs mb-2">You need USDC in your wallet to pay for this service.</p>
                      <a 
                        href="https://jup.ag/swap/SOL-USDC" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                      >
                        Swap SOL → USDC on Jupiter <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {publicKey && hasUsdcAccount && usdcBalance !== null && usdcBalance < price && (
                <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="text-orange-400">
                      <p className="font-semibold mb-1">Insufficient USDC</p>
                      <p className="text-xs mb-2">
                        You have ${usdcBalance.toFixed(2)} USDC but need {priceDisplay}
                      </p>
                      <a 
                        href="https://jup.ag/swap/SOL-USDC" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                      >
                        Get more USDC on Jupiter <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(error || paymentError) && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4 text-red-400 text-sm">
                {error || paymentError}
              </div>
            )}

            <Button
              onClick={handlePurchase}
              disabled={!canPay}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {canPay ? `Pay ${priceDisplay} & Get ${title}` : 'Insufficient USDC'}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Secure payment powered by x402 protocol • Non-custodial
            </p>
          </>
        )}

        {paymentStatus === 'paying' && (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Processing Payment...</h4>
            <p className="text-sm text-muted-foreground">
              Please approve the transaction in your wallet
            </p>
          </div>
        )}

        {paymentStatus === 'verifying' && (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h4 className="font-semibold mb-2">Verifying Payment...</h4>
            <p className="text-sm text-muted-foreground">
              Confirming transaction on blockchain
            </p>
          </div>
        )}

        {paymentStatus === 'success' && result && (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-green-400">Payment Successful!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your {serviceType === 'analyze' ? 'analysis' : 'report'} is ready
              </p>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            <Button onClick={handleClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
              <X className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="font-semibold text-red-400">Payment Failed</p>
              <p className="text-xs text-muted-foreground mt-1">
                {paymentError || 'Something went wrong'}
              </p>
            </div>

            <Button onClick={() => setPaymentStatus('idle')} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
