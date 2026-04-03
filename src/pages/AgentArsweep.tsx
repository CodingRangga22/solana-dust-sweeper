import { useState, useRef, useEffect } from 'react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import axios from 'axios';
import { Send, Sparkles, Plus, Trash2, Zap, Crown } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useArsweepChat } from '@/hooks/useArsweepChat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/ai-agent/ChatMessage';
import { X402PaymentModal } from '@/components/ai-agent/X402PaymentModal';


// Inline Wallet Scanner (to avoid module issues)
const detectWalletAddress = (text: string): string | null => {
  const walletPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
  const matches = text.match(walletPattern);
  if (matches && matches.length > 0) {
    for (const match of matches) {
      try {
        new PublicKey(match);
        return match;
      } catch {
        continue;
      }
    }
  }
  return null;
};

const scanWallet = async (address: string) => {
  try {
    const connection = new Connection(import.meta.env.VITE_HELIUS_RPC_URL, 'confirmed');
    const publicKey = new PublicKey(address);

    // Get SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const solBalanceSOL = solBalance / LAMPORTS_PER_SOL;

    // Get token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const tokens: any[] = [];
    let nftCount = 0;

    for (const account of tokenAccounts.value) {
      const parsedInfo = account.account.data.parsed.info;
      const mint = parsedInfo.mint;
      const amount = parsedInfo.tokenAmount.amount;
      const decimals = parsedInfo.tokenAmount.decimals;
      const uiAmount = parsedInfo.tokenAmount.uiAmount;

      if (uiAmount === 0) continue;
      if (decimals === 0 && amount === '1') {
        nftCount++;
        continue;
      }

      tokens.push({ mint, amount, decimals, uiAmount });
    }

    // Get SOL price
    let solPrice = 0;
    try {
      const priceRes = await axios.get('https://api.jup.ag/price/v3/price?ids=SOL', { headers: { 'X-API-Key': import.meta.env.VITE_JUPITER_API_KEY } });
      solPrice = priceRes.data.data['So11111111111111111111111111111111111111112']?.price || 0;
    } catch {}

    const solValue = solBalanceSOL * solPrice;

    // Enrich token data
    if (tokens.length > 0) {
      try {
        const mints = tokens.map(t => t.mint).join(',');
        const priceRes = await axios.get(`https://api.jup.ag/price/v3/price?ids=${mints}`, { headers: { 'X-API-Key': import.meta.env.VITE_JUPITER_API_KEY } });
        const prices = priceRes.data.data;

        const metadataRes = await axios.get('https://api.jup.ag/tokens/v1/all');
        const tokenList = metadataRes.data;

        for (const token of tokens) {
          if (prices[token.mint]) {
            token.price = prices[token.mint].price;
            token.value = token.uiAmount * token.price;
          }
          const metadata = tokenList.find((t: any) => t.address === token.mint);
          if (metadata) {
            token.symbol = metadata.symbol;
            token.name = metadata.name;
            token.logoURI = metadata.logoURI;
          }
        }
      } catch {}
    }

    const tokensValue = tokens.reduce((sum, t) => sum + (t.value || 0), 0);

    return {
      address,
      solBalance: solBalanceSOL,
      solValue,
      tokens: tokens.sort((a, b) => (b.value || 0) - (a.value || 0)),
      totalValue: solValue + tokensValue,
      tokenCount: tokens.length,
      nftCount,
    };
  } catch (error) {
    console.error('Wallet scan error:', error);
    return null;
  }
};

export default function AgentArsweep() {
  const { publicKey } = useWallet();
  const userId = publicKey?.toString() || 'anonymous-' + Date.now();
  const { messages, isLoading, error, sendMessage, clearChat, updateMessage, setMessages } = useArsweepChat(userId);
  const [walletScans, setWalletScans] = useState<Map<string, any>>(new Map());
  const [scanVersion, setScanVersion] = useState(0);

  // useEffect scanner disabled - using handleSubmit detection instead
  
  const [input, setInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'analyze' | 'report'>('analyze');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    console.log("🔍 Input value:", message);
    let detectedWallet = detectWalletAddress(message);
    if (!detectedWallet && message.length >= 32 && message.length <= 44) detectedWallet = message;
    // Fallback: kalau user bilang "analyze my wallet" dll, pakai connected wallet
    if (!detectedWallet && publicKey && /my wallet|analyze|scan|check|sweep/i.test(message)) {
      detectedWallet = publicKey.toString();
    }
    console.log("🔍 Detected wallet:", detectedWallet);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Use wallet already detected above (includes length fallback)
      console.log('🔍 User input wallet:', detectedWallet);
      
      // Send message normally
      
      // If wallet detected, scan it
      await sendMessage(message, publicKey?.toString());

    } catch (err) {
      console.error('Chat error:', err);
    }

      if (detectedWallet) {
        console.log("⏳ ENTERING SCAN BLOCK");
        console.log('⏳ Scanning wallet from user input...');
        console.log("📡 CALLING scanWallet...");
        const scanResult = await scanWallet(detectedWallet);
        console.log("📊 SCAN COMPLETE:", scanResult);
        console.log('✅ Scan result:', scanResult);
        
        if (scanResult) {
          console.log("💾 SAVING TO STATE");
          setWalletScans(prev => {
            const newMap = new Map(prev);
            newMap.set(detectedWallet, scanResult);
            console.log('💾 Saved scan:', detectedWallet);
            return newMap;
          });
          setScanVersion(v => v + 1);
          // Attach scan directly to user message - functional update avoids stale closure
          setMessages((prev: any[]) => prev.map((msg: any) =>
            msg.content.includes(detectedWallet) ? { ...msg, walletScan: scanResult } : msg
          ));
        }
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickSuggestions = [
    { icon: '🔍', text: 'Analyze my wallet', action: () => setInput('Analyze my wallet') },
    { icon: '⚠️', text: 'Check for scam tokens', action: () => setInput('Check my wallet for scam tokens') },
    { icon: '💎', text: 'Find dust tokens', action: () => setInput('Show me all dust tokens in my wallet') },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-muted/30 h-screen overflow-hidden">
        <div className="p-4 border-b border-border">
          <a href="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">Arsweep AI</span>
          </a>
          <Button
            onClick={clearChat}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Premium Features */}
        <div className="p-4 space-y-2 flex-shrink-0">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Premium Features</p>
          
          <button
            onClick={() => { setPaymentType('analyze'); setShowPayment(true); }}
            className="w-full p-3 rounded-lg border border-blue-600/30 bg-blue-600/5 hover:bg-blue-600/10 transition-all text-left group"
          >
            <div className="flex items-start gap-2">
              <Crown className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">AI Analysis</p>
                <p className="text-xs text-muted-foreground">Deep wallet insights</p>
                <p className="text-xs font-semibold text-blue-500 mt-1">$0.10 USDC</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { setPaymentType('report'); setShowPayment(true); }}
            className="w-full p-3 rounded-lg border border-green-600/30 bg-green-600/5 hover:bg-green-600/10 transition-all text-left group"
          >
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Sweep Report</p>
                <p className="text-xs text-muted-foreground">Quick dust check</p>
                <p className="text-xs font-semibold text-green-500 mt-1">$0.05 USDC</p>
              </div>
            </div>
          </button>
        </div>

        

        {/* Wallet Connect */}
        <div className="p-4  mt-auto">
          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !h-10 !text-sm !rounded-lg !w-full" />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-muted/30">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold">Arsweep AI Agent</h1>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              Online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Powered by api.arsweep.fun</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="max-w-3xl mx-auto py-8 space-y-6">
{messages.length === 0 && (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Arsweep AI</h2>
                <p className="text-muted-foreground mb-6">
                  Your intelligent assistant for Solana wallet management
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {quickSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={suggestion.action}
                      className="p-4 rounded-lg border border-border hover:border-purple-600/50 hover:bg-purple-600/5 transition-all text-left group"
                    >
                      <span className="text-2xl mb-2 block">{suggestion.icon}</span>
                      <span className="text-sm group-hover:text-purple-600 transition-colors">
                        {suggestion.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, _idx) => { const _sv = scanVersion; // force re-render on scan update
              const scanData = (message as any).walletScan;
              console.log('📊 Message:', message.id, 'ScanData:', scanData);
              
              return (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  walletAddress={publicKey?.toString()}
                  walletScan={scanData}
                  onPremiumAnalysis={() => {
                    setPaymentType('analyze');
                    setShowPayment(true);
                  }}
                />
              );
            })}

            {isLoading && (
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3 border border-border">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400 text-sm">
                <p className="font-semibold mb-1">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className=" p-4 bg-muted/30">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your wallet, tokens, or Solana..."
                className="pr-12 min-h-[52px] max-h-32 resize-none bg-background"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">Shift + Enter</kbd> for new line
            </p>
          </form>
        </div>
      </div>

      {/* Payment Modal */}
      <X402PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        serviceType={paymentType}
      />
    </div>
  );
}
