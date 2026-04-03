import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import axios from 'axios';
import { Send, Sparkles, Plus, Trash2, Zap, Crown, ArrowLeft, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ArsweepLogo from '@/components/ArsweepLogo';
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
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const userId = publicKey?.toString() || 'anonymous-' + Date.now();
  const { messages, isLoading, error, sendMessage, clearChat, updateMessage, setMessages } = useArsweepChat(userId);
  const [walletScans, setWalletScans] = useState<Map<string, any>>(new Map());
  const [scanVersion, setScanVersion] = useState(0);

  // useEffect scanner disabled - using handleSubmit detection instead
  
  const [input, setInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [paymentType, setPaymentType] = useState<'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner'>('analyze');
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
    { 
      icon: '🧹', 
      text: 'Analyze my wallet', 
      desc: 'Scan for dust accounts, locked SOL, and get a full breakdown of what you can reclaim.',
      action: () => setInput('Analyze my wallet') 
    },
    { 
      icon: '🛡️', 
      text: 'Check for scam tokens', 
      desc: 'Detect suspicious airdrops, honeypots, and known rug pull tokens in your wallet.',
      action: () => setInput('Check my wallet for scam tokens') 
    },
    { 
      icon: '💰', 
      text: 'Find dust & locked SOL', 
      desc: 'Identify all empty token accounts holding locked rent SOL you can instantly reclaim.',
      action: () => setInput('Show me all dust tokens in my wallet') 
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 border-r border-border flex-col bg-muted/30 h-screen overflow-hidden">
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

          <button
            onClick={() => { setPaymentType('roast'); setShowPayment(true); }}
            className="w-full p-3 rounded-lg border border-orange-600/30 bg-orange-600/5 hover:bg-orange-600/10 transition-all text-left group"
          >
            <div className="flex items-start gap-2">
              <span className="text-base mt-0.5">🔥</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Wallet Roast</p>
                <p className="text-xs text-muted-foreground">Score + AI roast</p>
                <p className="text-xs font-semibold text-orange-500 mt-1">$0.05 USDC</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { setPaymentType('rugcheck'); setShowPayment(true); }}
            className="w-full p-3 rounded-lg border border-red-600/30 bg-red-600/5 hover:bg-red-600/10 transition-all text-left group"
          >
            <div className="flex items-start gap-2">
              <span className="text-base mt-0.5">🕵️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Rug Detector</p>
                <p className="text-xs text-muted-foreground">Find dangerous tokens</p>
                <p className="text-xs font-semibold text-red-500 mt-1">$0.10 USDC</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => { setPaymentType('planner'); setShowPayment(true); }}
            className="w-full p-3 rounded-lg border border-cyan-600/30 bg-cyan-600/5 hover:bg-cyan-600/10 transition-all text-left group"
          >
            <div className="flex items-start gap-2">
              <span className="text-base mt-0.5">🤖</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Sweep Planner</p>
                <p className="text-xs text-muted-foreground">Optimal sweep plan</p>
                <p className="text-xs font-semibold text-cyan-500 mt-1">$0.05 USDC</p>
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {/* Header */}
        <div className="relative h-16 border-b border-border flex items-center justify-between px-3 md:px-6 overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-purple-600/5 animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <div className="flex items-center gap-2 relative z-10">
            {/* Back - mobile */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="md:hidden p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
            {/* Hamburger - mobile */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-2 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Menu className="w-4 h-4" />
            </motion.button>

            {/* Logo + Title */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArsweepLogo className="w-7 h-7" />
              </motion.div>
              <div>
                <h1 className="font-bold text-sm leading-tight">Arsweep AI</h1>
                <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">Powered by api.arsweep.fun</p>
              </div>
            </div>

            {/* Online badge */}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1"
            >
              <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
              Online
            </motion.span>
          </div>

          <div className="flex items-center gap-1 relative z-10">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={clearChat} className="text-muted-foreground hover:text-foreground h-8 w-8">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-3 md:px-6" ref={scrollRef}>
          <div className="max-w-3xl mx-auto pt-2 pb-4 space-y-4">
{messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center pt-0 pb-2"
              >
                {/* Premium Logo Animation */}
                <div className="relative mx-auto mb-6 w-32 h-32">
                  {/* Outer ring pulse */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-[#14F195]/10 blur-2xl"
                  />
                  {/* Mid ring */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border border-dashed border-[#14F195]/20"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 rounded-full border border-[#14F195]/10"
                  />
                  {/* Core */}
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-6 rounded-2xl bg-[#0a0a0a] border border-[#14F195]/30 flex items-center justify-center backdrop-blur-sm shadow-[0_0_40px_rgba(20,241,149,0.15),inset_0_0_20px_rgba(20,241,149,0.05)]"
                  >
                    <ArsweepLogo className="w-10 h-10 drop-shadow-[0_0_12px_rgba(20,241,149,0.9)]" />
                  </motion.div>
                  {/* Orbiting dot */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                    style={{ transformOrigin: "center" }}
                  >
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#14F195] shadow-[0_0_10px_#14F195]" />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#14F195]/60 shadow-[0_0_8px_#14F195]" />
                  </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-2xl font-extrabold mb-1 text-[#14F195] drop-shadow-[0_0_20px_rgba(20,241,149,0.5)]">
                    Arsweep AI
                  </h2>
                  <p className="text-xs text-muted-foreground mb-1">Your intelligent Solana wallet assistant</p>
                  <div className="flex items-center justify-center gap-1.5 mb-6">
                    <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Online & Ready</span>
                  </div>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto w-full px-2">
                  {quickSuggestions.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={suggestion.action}
                      className="p-4 rounded-2xl border border-[#14F195]/15 bg-[#14F195]/[0.03] hover:border-[#14F195]/40 hover:bg-[#14F195]/[0.06] hover:shadow-[0_0_25px_rgba(20,241,149,0.08)] transition-all text-left group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#14F195]/5 rounded-full blur-xl" />
                      <span className="text-2xl mb-3 block">{suggestion.icon}</span>
                      <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-[#14F195] transition-colors font-mono">{suggestion.text}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
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
        <div className="p-3 md:p-4 border-t border-border bg-background/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your wallet, tokens, or Solana..."
                className="pr-14 min-h-[60px] max-h-40 resize-none bg-black/30 border-[#14F195]/20 focus:border-[#14F195]/50 focus:shadow-[0_0_15px_rgba(20,241,149,0.1)] rounded-2xl text-sm placeholder:text-muted-foreground/40 transition-all"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 h-9 w-9 rounded-xl bg-[#14F195] hover:bg-[#14F195]/90 text-black shadow-[0_0_20px_rgba(20,241,149,0.4)] hover:shadow-[0_0_30px_rgba(20,241,149,0.6)] transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs">Shift + Enter</kbd> for new line
            </p>
          </form>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-background border-r border-border flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-bold">Menu</span>
              <button onClick={() => setShowMobileSidebar(false)} className="p-1.5 rounded-lg hover:bg-muted/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground mb-3">Premium Features</p>
              {[
                { type: 'analyze', label: 'AI Analysis', desc: 'Deep wallet insights', price: '$0.10', color: 'blue' },
                { type: 'report', label: 'Sweep Report', desc: 'Quick dust check', price: '$0.05', color: 'green' },
                { type: 'roast', label: 'Wallet Roast 🔥', desc: 'Score + AI roast', price: '$0.05', color: 'orange' },
                { type: 'rugcheck', label: 'Rug Detector 🕵️', desc: 'Find dangerous tokens', price: '$0.10', color: 'red' },
                { type: 'planner', label: 'Sweep Planner 🤖', desc: 'Optimal sweep plan', price: '$0.05', color: 'cyan' },
              ].map((item) => (
                <button key={item.type} onClick={() => { setPaymentType(item.type as any); setShowPayment(true); setShowMobileSidebar(false); }}
                  className="w-full p-3 rounded-lg border border-border hover:bg-muted/50 transition-all text-left">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                  <p className="text-xs font-bold text-primary mt-1">{item.price} USDC</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <X402PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        serviceType={paymentType}
      />
    </div>
  );
}
