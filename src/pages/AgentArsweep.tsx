import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
import { arsweepApi } from '@/services/arsweepApi';
import { extractSolscanTxUrl, formatPremiumResult } from '@/lib/formatPremiumResult';

const ANON_STORAGE_KEY = 'arsweep_agent_anon_id';
const sessionsStorageKey = (userId: string) => `arsweep_agent_sessions_${userId}`;

type ChatSession = { id: string; createdAt: number; preview: string };

function getOrCreateAnonId(): string {
  try {
    let id = sessionStorage.getItem(ANON_STORAGE_KEY);
    if (!id) {
      id = `anon-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`}`;
      sessionStorage.setItem(ANON_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

function loadSessions(userId: string): ChatSession[] {
  try {
    const raw = localStorage.getItem(sessionsStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatSession[];
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

function persistSessions(userId: string, sessions: ChatSession[]) {
  try {
    localStorage.setItem(sessionsStorageKey(userId), JSON.stringify(sessions.slice(0, 10)));
  } catch {
    /* ignore */
  }
}

function startOfTodayMs(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function groupSessionsByAge(sessions: ChatSession[]): { today: ChatSession[]; previous7: ChatSession[] } {
  const startToday = startOfTodayMs();
  const sevenDaysAgo = startToday - 7 * 86400000;
  const today: ChatSession[] = [];
  const previous7: ChatSession[] = [];
  for (const s of sessions) {
    if (s.createdAt >= startToday) today.push(s);
    else if (s.createdAt >= sevenDaysAgo) previous7.push(s);
  }
  return { today, previous7 };
}

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
      if (decimals === 0 && amount === '1') {
        nftCount++;
        continue;
      }
      tokens.push({ mint, amount, decimals, uiAmount });
    }
    let solPrice = 0;
    try {
      const priceRes = await axios.get('https://api.jup.ag/price/v3/price?ids=SOL', {
        headers: { 'X-API-Key': import.meta.env.VITE_JUPITER_API_KEY },
      });
      solPrice = priceRes.data.data['So11111111111111111111111111111111111111112']?.price || 0;
    } catch {
      /* optional */
    }
    const solValue = solBalanceSOL * solPrice;
    if (tokens.length > 0) {
      try {
        const mints = tokens.map((t) => t.mint).join(',');
        const priceRes = await axios.get(`https://api.jup.ag/price/v3/price?ids=${mints}`, {
          headers: { 'X-API-Key': import.meta.env.VITE_JUPITER_API_KEY },
        });
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
      } catch {
        /* optional */
      }
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

const DotGrid = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0"
    style={{
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}
  />
);

export default function AgentArsweep() {
  const navigate = useNavigate();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const userId = useMemo(
    () => publicKey?.toBase58() ?? getOrCreateAnonId(),
    [publicKey],
  );

  const { messages, isLoading, error, sendMessage, clearChat, setMessages } = useArsweepChat(userId);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [historyRows, setHistoryRows] = useState<ChatSession[]>([]);
  const [isSweeping, setIsSweeping] = useState(false);
  const [input, setInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [paymentType, setPaymentType] = useState<'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner'>('analyze');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentSessionIdRef = useRef<string>('');
  const fetchGenRef = useRef(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const banners = document.querySelectorAll('[role="alert"]');
    banners.forEach((b) => ((b as HTMLElement).style.display = 'none'));
    return () => {
      document.body.style.overflow = '';
      const b2 = document.querySelectorAll('[role="alert"]');
      b2.forEach((b) => ((b as HTMLElement).style.display = ''));
    };
  }, []);

  useEffect(() => {
    const loaded = loadSessions(userId);
    if (loaded.length === 0) {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`;
      currentSessionIdRef.current = id;
      const initial: ChatSession[] = [{ id, createdAt: Date.now(), preview: 'New conversation' }];
      persistSessions(userId, initial);
      setSessions(initial);
    } else {
      setSessions(loaded);
      currentSessionIdRef.current = loaded[0].id;
    }
  }, [userId]);

  useEffect(() => {
    fetchGenRef.current += 1;
    const generationAtStart = fetchGenRef.current;
    let cancelled = false;
    (async () => {
      try {
        const { messages: rows } = await arsweepApi.fetchHistory(userId);
        if (cancelled || generationAtStart !== fetchGenRef.current) return;
        const userMsgs = rows.filter((r) => r.role === 'user').slice(-10);
        const synthetic: ChatSession[] = userMsgs.map((m, i) => ({
          id: `hist-${userId}-${i}`,
          createdAt: Date.now() - (userMsgs.length - 1 - i) * 60000,
          preview: m.content.slice(0, 40) + (m.content.length > 40 ? '…' : ''),
        }));
        setHistoryRows(synthetic.reverse());

        if (rows?.length) {
          const mapped = rows.map((r, i) => ({
            id: `srv-${i}-${r.role}`,
            role: r.role as 'user' | 'assistant',
            content: r.content,
            timestamp: new Date(),
          }));
          setMessages(mapped);
        }
      } catch {
        if (!cancelled && generationAtStart === fetchGenRef.current) setHistoryRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, setMessages]);

  const sidebarSessions = useMemo(() => {
    const byId = new Map<string, ChatSession>();
    for (const s of [...historyRows, ...sessions]) {
      if (!byId.has(s.id)) byId.set(s.id, s);
    }
    return Array.from(byId.values()).slice(0, 10);
  }, [historyRows, sessions]);

  const { today: sessionsToday, previous7: sessionsPrev } = useMemo(
    () => groupSessionsByAge(sidebarSessions),
    [sidebarSessions],
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, error]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'user') return;
    const sid = currentSessionIdRef.current;
    if (!sid) return;
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === sid);
      if (idx === -1) return prev;
      const p = last.content.slice(0, 40) + (last.content.length > 40 ? '…' : '');
      if (prev[idx].preview === p) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], preview: p };
      persistSessions(userId, next);
      return next;
    });
  }, [messages, userId]);

  const bumpFetchAndClear = useCallback(() => {
    fetchGenRef.current += 1;
    clearChat();
  }, [clearChat]);

  const handleNewChat = () => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}`;
    currentSessionIdRef.current = id;
    setSessions((prev) => {
      const next = [{ id, createdAt: Date.now(), preview: 'New conversation' }, ...prev.filter((s) => s.id !== id)].slice(
        0,
        10,
      );
      persistSessions(userId, next);
      return next;
    });
    bumpFetchAndClear();
    setShowMobileSidebar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();

    // Premium intent routing (Syra-like upsell): if user asks for premium features, open payment first.
    const premiumIntent = (() => {
      const m = message.toLowerCase();

      // Allow explicit opt-out to use free scan flow.
      if (/\bfree\b|\bgratis\b|\btanpa\s*bayar\b|\bno\s*payment\b|\bscan\s*\(free\)\b/i.test(m)) return null;

      // Report / dust / empty accounts (ID + EN)
      if (
        /(sweep\s*report|report\s*sweep|dust\s*report|quick\s*report|wallet\s*report|generate\s*report)/i.test(m) ||
        /(laporan|report|ringkasan|summary).*(wallet|dompet)/i.test(m) ||
        /(akun\s*kosong|empty\s*accounts?|empty\s*token\s*accounts?|reclaim(able)?\s*sol|recover(able)?\s*sol|rent\s*sol|sol\s*(yang\s*)?bisa\s*direcover)/i.test(
          m,
        )
      )
        return 'report';

      // Roast (ID + EN slang)
      if (
        /(wallet\s*roast|roast\s*my\s*wallet|roast\s*wallet|roasting\s*my\s*wallet)/i.test(m) ||
        /\broast\b|\broasting\b|\bej(e|a)k\b|\bkeledek\b|\bngeledek\b/i.test(m)
      )
        return 'roast';

      // Rug/scam detector (treat scam token questions as premium rugcheck)
      if (
        /(rug\s*(check|detector)|rugcheck|honeypot|phishing|airdrop\s*scam|scam\s*token|scam\s*tokens|detect\s*scam|check\s*scam|is\s*this\s*a\s*scam)/i.test(
          m,
        ) ||
        /(cek|check|deteksi|detect).*(scam|penipuan|rug|honeypot|phishing)/i.test(m) ||
        /(token|koin).*(scam|penipuan|rug|honeypot)/i.test(m)
      )
        return 'rugcheck';

      // Planner (strategy/ordering)
      if (
        /(sweep\s*planner|auto\s*sweep|optimal\s*sweep|plan\s*sweep|sweep\s*plan|best\s*sweep\s*strategy)/i.test(m) ||
        /(rencana|plan|strategi|urutan).*(sweep|bersih(in)?|close|tutup)/i.test(m)
      )
        return 'planner';

      // AI Analysis (make very broad: any \"analyze / check / review my wallet\" intent -> premium analyze)
      if (
        /(analyze|analysis|review|audit|assess|evaluate|rate).*(my\s*)?(wallet|portfolio|holdings)/i.test(m) ||
        /(cek|check|periksa|anal(i|y)s(a|is)|review|audit|nilai|skor).*(wallet|dompet|portfolio|aset|holdings)/i.test(m) ||
        /\bwallet\s*(analysis|score|rating)\b/i.test(m)
      )
        return 'analyze';

      return null;
    })() as null | 'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner';

    if (premiumIntent) {
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';

      // Echo user message into thread for continuity
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: 'user', content: message, timestamp: new Date() },
      ]);

      if (!publicKey) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content:
              "That’s a Premium tool. Please connect your wallet first, then click it again to proceed with payment.",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      setPaymentType(premiumIntent);
      setShowPayment(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now() + 1}`,
          role: 'assistant',
          content:
            'This request matches a Premium tool. Complete the payment in the modal and I’ll post the result here.',
          timestamp: new Date(),
        },
      ]);
      return;
    }

    let detectedWallet = detectWalletAddress(message);
    if (!detectedWallet && message.length >= 32 && message.length <= 44) detectedWallet = message;
    if (!detectedWallet && publicKey && /my wallet|analyze|scan|check|sweep/i.test(message))
      detectedWallet = publicKey.toString();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    try {
      await sendMessage(message, publicKey?.toString());
    } catch (err) {
      console.error('Chat error:', err);
    }

    if (/^(konfirmasi|KONFIRMASI|yes|YES)$/.test(message.trim()) && publicKey) {
      setTimeout(() => handleAgentSweep(publicKey.toString()), 1000);
    }
    if (detectedWallet) {
      const scanResult = await scanWallet(detectedWallet);
      if (scanResult) {
        setMessages((prev: any[]) =>
          prev.map((msg: any) => (msg.content.includes(detectedWallet) ? { ...msg, walletScan: scanResult } : msg)),
        );
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const handleAgentSweep = async (walletAddress: string) => {
    if (!publicKey || !sendTransaction) return;
    setIsSweeping(true);
    try {
      const { TOKEN_PROGRAM_ID: TPID } = await import('@solana/spl-token');
      const conn = new Connection(import.meta.env.VITE_HELIUS_RPC_URL, 'confirmed');

      const tokenAccounts = await conn.getParsedTokenAccountsByOwner(publicKey, { programId: TPID });
      const sweepAccounts: SweepAccount[] = tokenAccounts.value
        .filter((acc) => acc.account.data.parsed.info.tokenAmount.uiAmount === 0)
        .map((acc) => ({
          pubkey: acc.pubkey,
          mint: new PublicKey(acc.account.data.parsed.info.mint),
          programId: TPID,
          amount: BigInt(0),
          rentLamports: 2039280,
          hasLiquidityPool: false,
          usdValueCents: 0,
        }));

      if (sweepAccounts.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Tidak ada akun kosong yang bisa di-sweep.',
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const results = await executeSweepNative(conn, { publicKey, sendTransaction }, sweepAccounts);

      const totalClosed = results.reduce((s, r) => s + r.accountsClosed, 0);
      const totalSOL = results.reduce((s, r) => s + r.rentReclaimed, 0) / 1e9;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ Sweep berhasil!\n${totalClosed} akun ditutup\n${totalSOL.toFixed(4)} SOL direcovery\nSignature: ${results[0]?.signature}`,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Sweep gagal: ${err instanceof Error ? err.message : 'Unknown error'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSweeping(false);
    }
  };

  const quickSuggestions = [
    {
      icon: '⚡',
      text: 'Analyze my wallet',
      desc: 'Scan for dust accounts, locked SOL, and get a full breakdown.',
      action: () => setInput('Analyze my wallet'),
    },
    {
      icon: '🔰',
      text: 'Check for scam tokens',
      desc: 'Detect suspicious airdrops, honeypots, and rug pull tokens.',
      action: () => setInput('Check my wallet for scam tokens'),
    },
    {
      icon: '◎',
      text: 'Find dust & locked SOL',
      desc: 'Identify empty token accounts holding locked rent SOL.',
      action: () => setInput('Show me all dust tokens in my wallet'),
    },
  ];

  const premiumFeatures = [
    { type: 'analyze' as const, label: 'AI Analysis', desc: 'Deep wallet insights', price: '$0.10', icon: '✦' },
    { type: 'report' as const, label: 'Sweep Report', desc: 'Quick dust check', price: '$0.05', icon: '◈' },
    { type: 'roast' as const, label: 'Wallet Roast', desc: 'Score + AI roast', price: '$0.05', icon: '▲' },
    { type: 'rugcheck' as const, label: 'Rug Detector', desc: 'Find dangerous tokens', price: '$0.10', icon: '◉' },
    { type: 'planner' as const, label: 'Sweep Planner', desc: 'Optimal sweep plan', price: '$0.05', icon: '⬡' },
  ];

  const onPremiumPaid = (data: unknown) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `premium-${Date.now()}`,
        role: 'assistant',
        content: formatPremiumResult(paymentType, data),
        timestamp: new Date(),
      },
    ]);
    setShowPayment(false);
  };

  const renderSessionList = (list: ChatSession[]) =>
    list.map((s) => (
      <motion.button
        key={s.id}
        type="button"
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-2 text-left transition-colors hover:border-white/10 hover:bg-white/[0.06]"
        title={s.preview}
      >
        <p className="truncate text-[11px] leading-snug text-white/70">{s.preview}</p>
      </motion.button>
    ));

  return (
    <div className="relative flex overflow-hidden bg-background" style={{ height: '100dvh' }}>
      <DotGrid />

      {/* Desktop sidebar 240px */}
      <aside className="relative z-10 hidden h-screen w-[240px] shrink-0 flex-col border-r border-white/10 bg-black/70 backdrop-blur-xl md:flex">
        <div className="border-b border-white/10 p-4">
          <a href="/" className="mb-4 flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArsweepLogo className="h-8 w-8" />
            </motion.div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-white">Arsweep</p>
              <p className="text-[10px] font-medium uppercase tracking-widest text-yellow-400/80">AI Agent</p>
            </div>
          </a>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] text-sm font-medium text-white/90 transition-colors hover:border-yellow-400/30 hover:bg-white/[0.1]"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </motion.button>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-3 py-3">
          <div className="space-y-4 pr-1">
            {sessionsToday.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Today</p>
                <div className="space-y-1.5">{renderSessionList(sessionsToday)}</div>
              </div>
            )}
            {sessionsPrev.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Previous 7 days
                </p>
                <div className="space-y-1.5">{renderSessionList(sessionsPrev)}</div>
              </div>
            )}
            {sessionsToday.length === 0 && sessionsPrev.length === 0 && (
              <p className="px-1 text-center text-[11px] text-white/30">No chat history yet</p>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-1.5 px-0.5">
            <Crown className="h-3 w-3 text-yellow-400/70" />
            <Zap className="h-3 w-3 text-yellow-400/50" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Premium</span>
          </div>
          <div className="space-y-1.5">
            {premiumFeatures.map((f) => (
              <motion.button
                key={f.type}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPaymentType(f.type);
                  setShowPayment(true);
                }}
                className="flex w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 py-2 text-left transition-all hover:border-yellow-400/20 hover:bg-white/[0.07]"
              >
                <span className="text-sm">{f.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-white/85">{f.label}</p>
                  <p className="truncate text-[9px] text-white/35">{f.desc}</p>
                </div>
                <span className="shrink-0 text-[10px] font-bold text-yellow-400/80">{f.price}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black/50 px-4 backdrop-blur-md md:px-5">
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMobileSidebar(true)}
              className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="hidden rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white/80 sm:block md:hidden"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.button>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <WalletMultiButton className="!h-9 !rounded-xl !border !border-white/12 !bg-white/[0.08] !px-3 !text-xs !text-white/85 hover:!bg-white/[0.12]" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={bumpFetchAndClear}
              className="h-9 w-9 text-white/35 hover:bg-white/10 hover:text-white/70"
              title="Clear thread"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 md:px-6">
          <div className="mx-auto w-full max-w-3xl space-y-5 py-6 pb-28">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 text-center md:pt-8"
              >
                <div className="relative mx-auto mb-6 h-28 w-28">
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.12, 0, 0.12] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-yellow-400/20 blur-2xl"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-2 rounded-full border border-dashed border-white/10"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-6 flex items-center justify-center rounded-2xl border border-white/10 bg-black/80"
                  >
                    <ArsweepLogo className="h-10 w-10" />
                  </motion.div>
                </div>
                <h2 className="mb-1 text-2xl font-extrabold text-white">Arsweep AI</h2>
                <p className="mb-8 font-mono text-xs text-white/40">Your intelligent Solana wallet assistant</p>
                <div className="mx-auto grid max-w-xl grid-cols-1 gap-2.5 px-1 sm:grid-cols-3">
                  {quickSuggestions.map((s, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + idx * 0.08 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={s.action}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:border-yellow-400/25 hover:bg-white/[0.07]"
                    >
                      <span className="mb-2 block text-xl">{s.icon}</span>
                      <p className="mb-1 font-mono text-xs font-semibold text-white/85">{s.text}</p>
                      <p className="text-[10px] leading-relaxed text-white/35">{s.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((message) => {
              const scanData = (message as any).walletScan;
              return (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  walletAddress={publicKey?.toString()}
                  walletScan={scanData}
                  toolsUsed={message.toolsUsed}
                  assistantUseArsweepLogo
                  userBubbleVariant="agent"
                  onPremiumAnalysis={() => {
                    setPaymentType('analyze');
                    setShowPayment(true);
                  }}
                />
              );
            })}

            {(isLoading || isSweeping) && (
              <div className="flex items-end gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  <ArsweepLogo className="h-5 w-5" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/35"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] p-4 text-sm text-red-300/90">
                <p className="mb-1 font-semibold text-red-400">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-black/50 p-3 backdrop-blur-md md:px-6 md:pb-4 md:pt-3">
          <form
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-3xl pb-[env(safe-area-inset-bottom)]"
          >
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your wallet, tokens, or Solana…"
                disabled={isLoading}
                className="min-h-[56px] max-h-36 resize-none rounded-2xl border-white/10 bg-white/[0.05] pr-14 text-sm text-white/90 placeholder:text-white/25 focus-visible:border-yellow-400/35"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-black transition-all hover:bg-yellow-300 disabled:opacity-30"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center font-mono text-[10px] text-white/25">
              Enter to send · Shift+Enter new line
            </p>
          </form>
        </div>
      </div>

      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div
              role="presentation"
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setShowMobileSidebar(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="absolute left-0 top-0 flex h-full w-[min(280px,92vw)] flex-col border-r border-white/10 bg-black/95 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <span className="text-sm font-bold text-white/90">Arsweep Agent</span>
                <button
                  type="button"
                  onClick={() => setShowMobileSidebar(false)}
                  className="rounded-lg p-2 text-white/45 hover:bg-white/10 hover:text-white"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="border-b border-white/10 p-4">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNewChat}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] text-sm font-medium text-white/90"
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </motion.button>
              </div>
              <ScrollArea className="min-h-0 flex-1 p-4">
                <div className="space-y-4">
                  {sessionsToday.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Today</p>
                      <div className="space-y-1.5">{renderSessionList(sessionsToday)}</div>
                    </div>
                  )}
                  {sessionsPrev.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                        Previous 7 days
                      </p>
                      <div className="space-y-1.5">{renderSessionList(sessionsPrev)}</div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="border-t border-white/10 p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/35">Premium</p>
                <div className="space-y-1.5">
                  {premiumFeatures.map((f) => (
                    <button
                      key={f.type}
                      type="button"
                      onClick={() => {
                        setPaymentType(f.type);
                        setShowPayment(true);
                        setShowMobileSidebar(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2.5 text-left"
                    >
                      <span className="text-sm">{f.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white/85">{f.label}</p>
                        <p className="text-[9px] text-white/35">{f.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-yellow-400/80">{f.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <X402PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        serviceType={paymentType}
        onPaidSuccess={onPremiumPaid}
      />
    </div>
  );
}
