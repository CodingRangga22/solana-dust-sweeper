import { X, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner';
}

export function X402PaymentModal({ isOpen, onClose, serviceType }: X402PaymentModalProps) {
  const priceDisplay = serviceType === 'analyze' || serviceType === 'rugcheck' ? '$0.10 USDC' : '$0.05 USDC';
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

          <Button
            disabled
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 disabled:opacity-50"
          >
            Coming Soon
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
