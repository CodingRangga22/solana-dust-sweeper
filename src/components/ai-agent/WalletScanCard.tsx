import { useState } from 'react';
import { ExternalLink, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TokenBalance {
  mint: string;
  amount: string;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
  price?: number;
  value?: number;
}

interface WalletScanResult {
  address: string;
  solBalance: number;
  solValue: number;
  tokens: TokenBalance[];
  totalValue: number;
  tokenCount: number;
  nftCount: number;
}

interface WalletScanCardProps {
  result: WalletScanResult;
  onPremiumAnalysis?: () => void;
}

export function WalletScanCard({ result, onPremiumAnalysis }: WalletScanCardProps) {
  const [showAllTokens, setShowAllTokens] = useState(false);
  const displayTokens = showAllTokens ? result.tokens : result.tokens.slice(0, 5);
  const hasMore = result.tokens.length > 5;

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(decimals)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(decimals)}K`;
    return value.toFixed(decimals);
  };

  return (
    <div className="space-y-3">
      <div className="bg-white/4 border border-white/10 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Wallet Scan Results</h3>
          <a href={`https://solscan.io/account/${result.address}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <p className="text-xs opacity-90 font-mono">{result.address.slice(0, 8)}...{result.address.slice(-8)}</p>
      </div>

      <div className="p-4 bg-white/4 border border-white/10 rounded-xl">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Value</p>
            <p className="text-lg font-bold text-yellow-400">{formatUSD(result.totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Tokens</p>
            <p className="text-lg font-bold">{result.tokenCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">NFTs</p>
            <p className="text-lg font-bold">{result.nftCount}</p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-white/4 border border-white/10 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
              <span className="text-white text-xs font-bold">◎</span>
            </div>
            <div>
              <p className="font-semibold">Solana</p>
              <p className="text-xs text-muted-foreground">SOL</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold">{formatNumber(result.solBalance, 4)} SOL</p>
            <p className="text-xs text-muted-foreground">{formatUSD(result.solValue)}</p>
          </div>
        </div>
      </div>

      {displayTokens.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Token Holdings</p>
            {onPremiumAnalysis && (
              <Button size="sm" onClick={onPremiumAnalysis} className="h-7 text-xs bg-white/10 hover:bg-white/15 border border-white/10 text-white">
                <Sparkles className="h-3 w-3 mr-1" />AI Analysis
              </Button>
            )}
          </div>
          {displayTokens.map((token, idx) => (
            <div key={idx} className="p-3 bg-white/4 border border-white/10 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs">{token.symbol?.[0] || '?'}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{token.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{token.symbol || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatNumber(token.uiAmount)}</p>
                  <p className="text-xs text-muted-foreground">{token.value ? formatUSD(token.value) : 'No price'}</p>
                </div>
              </div>
            </div>
          ))}
          {hasMore && (
            <Button variant="ghost" size="sm" onClick={() => setShowAllTokens(!showAllTokens)} className="w-full">
              {showAllTokens ? 'Show Less' : `Show ${result.tokens.length - 5} More`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
