import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import axios from 'axios';
import { Send, Plus, Trash2, Zap, Crown, ArrowLeft, Menu } from 'lucide-react';
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
import { executeSweepNative, SweepAccount } from '@/lib/sweepNative';
import { useConnection } from '@solana/wallet-adapter-react';

const detectWalletAddress = (text: string): string | null => {
  const walletPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
  const matches = text.match(walletPattern);
  if (matches && matches.length > 0) {
    for (const match of matches) {
      try { new PublicKey(match); return match; } catch { continue; }
    }
  }
  return null;
};

const scanWallet = async (address: string) => {
  try {
    const connection = new Connection(import.meta.env.VITE_HELIUS_RPC_URL, 'confirmed');
    const publicKey = new PublicKey(address);
    const solBalance = await connection.getBalance(publicKey);
    const solBalanceSOL = solBalance / LAMPORTS_PER_SOL;
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
    const tokens: any[] = [];
    let nftCount = 0;
    for (const account of tokenAccounts.value) {
      const parsedInfo = account.account.data.parsed.info;
      const mint = parsedInfo.mint;
      const amount = parsedInfo.tokenAmount.amount;
      const decimals = parsedInfo.tokenAmount.decimals;
      const uiAmount = parsedInfo.tokenAmount.uiAmount;
      if (uiAmount === 0) continue;
      if (decimals === 0 && amount === '1') { nftCount++; continue; }
      tokens.push({ mint, amount, decimals, uiAmount });
    }
    let solPrice = 0;
    try {
      const priceRes = await axios.get('https://api.jup.ag/price/v3/price?ids=SOL', { headers: { 'X-API-Key': import.meta.env.VITE_JUPITER_API_KEY } });
      solPrice = priceRes.data.data['So11111111111111111111111111111111111111112']?.price || 0;
    } catch {}
    const solValue = solBalanceSOL * solPrice;
    if (tokens.length > 0) {
      try {
        const mints = tokens.map(t => t.mint).join(',');
        const priceRes = await axios.get(`https://api.jup.ag/price/v3/price?ids=${mints}`, { headers: { 'X-API-Key': import.meta.env.VITE_JUPITER_API_KEY } });
        const prices = priceRes.data.data;
        const metadataRes = await axios.get('https://api.jup.ag/tokens/v1/all');
        const tokenList = metadataRes.data;
        for (const token of tokens) {
          if (prices[token.mint]) { token.price = prices[token.mint].price; token.value = token.uiAmount * token.price; }
          const metadata = tokenList.find((t: any) => t.address === token.mint);
          if (metadata) { token.symbol = metadata.symbol; token.name = metadata.name; token.logoURI = metadata.logoURI; }
        }
      } catch {}
    }
    const tokensValue = tokens.reduce((sum, t) => sum + (t.value || 0), 0);
    return { address, solBalance: solBalanceSOL, solValue, tokens: tokens.sort((a, b) => (b.value || 0) - (a.value || 0)), totalValue: solValue + tokensValue, tokenCount: tokens.length, nftCount };
  } catch (error) {
    console.error('Wallet scan error:', error);
    return null;
  }
};

const DotGrid = () => (
  <div className="pointer-events-none fixed inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
);

export default function AgentArsweep() {
  const navigate = useNavigate();
  const { publicKey, sendTransaction } = useWallet();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Hide banner on agent page
    const banners = document.querySelectorAll('[role="alert"]');
    banners.forEach(b => (b as HTMLElement).style.display = 'none');
    return () => {
      document.body.style.overflow = '';
      const banners = document.querySelectorAll('[role="alert"]');
      banners.forEach(b => (b as HTMLElement).style.display = '');
    };
  }, []);
  const { connection } = useConnection();
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepResult, setSweepResult] = useState<string | null>(null);
  const userId = publicKey?.toString() || 'anonymous-' + Date.now();
  const { messages, isLoading, error, sendMessage, clearChat, updateMessage, setMessages } = useArsweepChat(userId);
  const [walletScans, setWalletScans] = useState<Map<string, any>>(new Map());
  const [scanVersion, setScanVersion] = useState(0);
  const [input, setInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [paymentType, setPaymentType] = useState<'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner'>('analyze');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    let detectedWallet = detectWalletAddress(message);
    if (!detectedWallet && message.length >= 32 && message.length <= 44) detectedWallet = message;
    if (!detectedWallet && publicKey && /my wallet|analyze|scan|check|sweep/i.test(message)) detectedWallet = publicKey.toString();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      await sendMessage(message, publicKey?.toString());
    } catch (err) {
      console.error('Chat error:', err);
    }

    // Direct trigger sweep on KONFIRMASI
    if (/^(konfirmasi|KONFIRMASI|yes|YES)$/.test(message.trim()) && publicKey) {
      setTimeout(() => handleAgentSweep(publicKey.toString()), 1000);
    }
    if (detectedWallet) {
      const scanResult = await scanWallet(detectedWallet);
      if (scanResult) {
        setWalletScans(prev => { const newMap = new Map(prev); newMap.set(detectedWallet, scanResult); return newMap; });
        setScanVersion(v => v + 1);
        setMessages((prev: any[]) => prev.map((msg: any) => msg.content.includes(detectedWallet) ? { ...msg, walletScan: scanResult } : msg));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  const handleAgentSweep = async (walletAddress: string) => {
    if (!publicKey || !sendTransaction) return;
    setIsSweeping(true);
    try {
      const { TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
      const conn = new Connection(import.meta.env.VITE_HELIUS_RPC_URL, 'confirmed');

      const tokenAccounts = await conn.getParsedTokenAccountsByOwner(
        publicKey, { programId: TOKEN_PROGRAM_ID }
      );
      const sweepAccounts: SweepAccount[] = tokenAccounts.value
        .filter(acc => acc.account.data.parsed.info.tokenAmount.uiAmount === 0)
        .map(acc => ({
          pubkey: acc.pubkey,
          mint: new PublicKey(acc.account.data.parsed.info.mint),
          programId: TOKEN_PROGRAM_ID,
          amount: BigInt(0),
          rentLamports: 2039280,
          hasLiquidityPool: false,
          usdValueCents: 0,
        }));

      if (sweepAccounts.length === 0) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(), role: 'assistant',
          content: 'Tidak ada akun kosong yang bisa di-sweep.',
          timestamp: new Date(),
        }]);
        return;
      }

      const results = await executeSweepNative(
        conn,
        { publicKey, sendTransaction },
        sweepAccounts
      );

      const totalClosed = results.reduce((s, r) => s + r.accountsClosed, 0);
      const totalSOL = results.reduce((s, r) => s + r.rentReclaimed, 0) / 1e9;
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'assistant',
        content: `✅ Sweep berhasil!\n${totalClosed} akun ditutup\n${totalSOL.toFixed(4)} SOL direcovery\nSignature: ${results[0]?.signature}`,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'assistant',
        content: `❌ Sweep gagal: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsSweeping(false);
    }
  };

  const quickSuggestions = [
    { icon: '⚡', text: 'Analyze my wallet', desc: 'Scan for dust accounts, locked SOL, and get a full breakdown.', action: () => setInput('Analyze my wallet') },
    { icon: '🔰', text: 'Check for scam tokens', desc: 'Detect suspicious airdrops, honeypots, and rug pull tokens.', action: () => setInput('Check my wallet for scam tokens') },
    { icon: '◎', text: 'Find dust & locked SOL', desc: 'Identify empty token accounts holding locked rent SOL.', action: () => setInput('Show me all dust tokens in my wallet') },
  ];

  const premiumFeatures = [
    { type: 'analyze', label: 'AI Analysis', desc: 'Deep wallet insights', price: '$0.10', icon: '✦' },
    { type: 'report', label: 'Sweep Report', desc: 'Quick dust check', price: '$0.05', icon: '◈' },
    { type: 'roast', label: 'Wallet Roast', desc: 'Score + AI roast', price: '$0.05', icon: '▲' },
    { type: 'rugcheck', label: 'Rug Detector', desc: 'Find dangerous tokens', price: '$0.10', icon: '◉' },
    { type: 'planner', label: 'Sweep Planner', desc: 'Optimal sweep plan', price: '$0.05', icon: '⬡' },
  ];

  return (
    <div className="flex bg-background overflow-hidden relative" style={{height: "100dvh"}}>
      <div className="pointer-events-none fixed inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Sidebar */}
      <div className="hidden md:flex w-60 border-r border-white/8 flex-col h-screen z-10 bg-black/60 backdrop-blur-md">
        <div className="p-5 pt-4 border-b border-white/8">
          <a href="/" className="flex items-center gap-2.5 mb-5 group">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
              <ArsweepLogo className="w-7 h-7" />
            </motion.div>
            <span className="font-bold text-sm tracking-tight text-white/90 group-hover:text-yellow-400 transition-colors">
              Arsweep AI
            </span>
          </a>
          <button onClick={clearChat} className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium transition-all">
            <Plus className="h-3.5 w-3.5" />
            New Chat
          </button>
        </div>
        <div className="px-3 py-2 space-y-1 overflow-y-auto flex-1">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1">Premium</p>
          {premiumFeatures.map((f) => (
            <button key={f.type} onClick={() => { setPaymentType(f.type as any); setShowPayment(true); }}
              className="w-full p-2 rounded-lg border border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/15 transition-all text-left group flex items-center gap-2">
              <span className="text-sm">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">{f.label}</p>
                <p className="text-[10px] text-white/30">{f.desc}</p>
              </div>
              <span className="text-[10px] font-bold text-white/30 group-hover:text-yellow-400 transition-colors shrink-0">{f.price}</span>
            </button>
          ))}
        </div>
        <div className="hidden md:block fixed bottom-10 left-0 w-60 px-3 pb-3 pt-2 bg-black/80 backdrop-blur-md border-t border-white/8 z-20">
          <WalletMultiButton className="!bg-white/8 !border !border-white/12 hover:!bg-white/12 !h-9 !text-xs !rounded-xl !w-full !text-white/80" />
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <div className="h-14 border-b border-white/8 flex items-center justify-between px-4 md:px-6 bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowMobileSidebar(true)} className="md:hidden p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors">
              <Menu className="w-4 h-4" />
            </motion.button>
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="md:hidden">
              <ArsweepLogo className="w-6 h-6" />
            </motion.div>
            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
              <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
              Online
            </span>
          </div>
          <button onClick={clearChat} className="p-1.5 rounded-lg hover:bg-white/8 text-white/30 hover:text-white/70 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 md:px-6 overflow-y-auto" ref={scrollRef}>
          <div className="max-w-2xl mx-auto w-full space-y-4 pt-6 pb-6">
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-8">
                <div className="relative mx-auto mb-4 w-28 h-28">
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0, 0.15] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 rounded-full bg-white/10 blur-2xl" />
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute inset-2 rounded-full border border-dashed border-white/10" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute inset-4 rounded-full border border-white/5" />
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-6 rounded-2xl bg-black border border-white/10 flex items-center justify-center">
                    <ArsweepLogo className="w-9 h-9" />
                  </motion.div>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="absolute inset-0" style={{ transformOrigin: 'center' }}>
                    <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-400" style={{ boxShadow: '0 0 8px #facc15' }} />
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-2xl font-extrabold mb-1 text-white">Arsweep AI</h2>
                  <p className="text-xs text-white/30 mb-1 font-mono">Your intelligent Solana wallet assistant</p>
                  <div className="flex items-center justify-center gap-1.5 mb-8">
                    <span className="h-1.5 w-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Online & Ready</span>
                  </div>
                </motion.div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto w-full px-2">
                  {quickSuggestions.map((s, idx) => (
                    <motion.button key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={s.action}
                      className="p-4 rounded-2xl border border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/6 transition-all text-left group">
                      <span className="text-xl mb-2 block">{s.icon}</span>
                      <p className="text-xs font-semibold text-white/80 group-hover:text-yellow-400 transition-colors font-mono mb-1">{s.text}</p>
                      <p className="text-[10px] text-white/30 leading-relaxed">{s.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            {messages.map((message, _idx) => {
              const _sv = scanVersion;
              const scanData = (message as any).walletScan;
              return (
                <ChatMessage key={message.id} role={message.role} content={message.content} timestamp={message.timestamp}
                  walletAddress={publicKey?.toString()} walletScan={scanData}
                  onPremiumAnalysis={() => { setPaymentType('analyze'); setShowPayment(true); }} />
              );
            })}
            {isLoading && (
              <div className="flex gap-3 items-end">
                <div className="h-7 w-7 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                  <ArsweepLogo className="w-4 h-4" />
                </div>
                <div className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map((delay) => (
                      <div key={delay} className="h-1.5 w-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4 text-red-400/80 text-sm">
                <p className="font-semibold mb-1 text-red-400">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/8 bg-black/40 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <Textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown} placeholder="Ask about your wallet, tokens, or Solana..."
                className="pr-14 min-h-[56px] max-h-36 resize-none bg-white/4 border-white/10 focus:border-white/25 rounded-2xl text-sm placeholder:text-white/20 text-white/80 transition-all"
                disabled={isLoading} />
              <button type="submit" disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 h-9 w-9 rounded-xl flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 disabled:opacity-30 transition-all">
                <Send className="h-3.5 w-3.5 text-black" />
              </button>
            </div>
            <p className="text-[10px] text-white/20 text-center mt-2 font-mono">Enter to send · Shift+Enter new line</p>
          </form>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowMobileSidebar(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 h-full w-72 bg-black/90 border-r border-white/8 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/8">
                <span className="font-bold text-sm text-white/80">Menu</span>
                <button onClick={() => setShowMobileSidebar(false)} className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-4 space-y-1.5">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-1">Premium</p>
                {premiumFeatures.map((f) => (
                  <button key={f.type} onClick={() => { setPaymentType(f.type as any); setShowPayment(true); setShowMobileSidebar(false); }}
                    className="w-full p-2.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-white/15 transition-all text-left flex items-center gap-2.5 group">
                    <span className="text-sm">{f.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white/80">{f.label}</p>
                      <p className="text-[10px] text-white/30">{f.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold text-white/30 group-hover:text-yellow-400 transition-colors">{f.price}</span>
                  </button>
                ))}
              </div>
              <div className="hidden md:block fixed bottom-10 left-0 w-60 px-3 pb-3 pt-2 bg-black/80 backdrop-blur-md border-t border-white/8 z-20">
                <WalletMultiButton className="!bg-white/8 !border !border-white/12 !h-9 !text-xs !rounded-xl !w-full !text-white/80" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <X402PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} serviceType={paymentType} />
    </div>
  );
}
