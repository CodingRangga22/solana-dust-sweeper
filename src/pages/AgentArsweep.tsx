import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import axios from 'axios';
import {
  Send,
  Plus,
  Trash2,
  Zap,
  Crown,
  ArrowLeft,
  Menu,
  Copy,
  ChevronDown,
  LogOut,
  Loader2,
  ShieldCheck,
  ScanSearch,
  Sparkles,
  FileBarChart,
  Flame,
  ShieldAlert,
  LayoutList,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ArsweepLogo from '@/components/ArsweepLogo';
import { usePrivySendTransaction } from '@/hooks/usePrivySendTransaction';
import { useArsweepChat } from '@/hooks/useArsweepChat';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/ai-agent/ChatMessage';
import { X402PaymentModal } from '@/components/ai-agent/X402PaymentModal';
import { executeSweepNative, SweepAccount } from '@/lib/sweepNative';
import { arsweepApi } from '@/services/arsweepApi';
import { extractSolscanTxUrl, formatPremiumResult } from '@/lib/formatPremiumResult';
import { usePrivy, useLogin } from '@privy-io/react-auth';
import { useWallets } from '@privy-io/react-auth/solana';
import { toast } from 'sonner';
import { useArsweepWalletAuthUi } from '@/hooks/useArsweepWalletAuthUi';
import { isDevnet } from '@/config/env';

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

const AgentAmbientBackground = () => (
  <>
    <div className="pointer-events-none fixed inset-0 z-0 bg-[#040506]" aria-hidden />
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
      style={{
        background:
          'radial-gradient(ellipse 90% 55% at 50% -15%, rgba(56, 189, 248, 0.1), transparent 52%), radial-gradient(ellipse 55% 45% at 100% 35%, rgba(34, 211, 238, 0.08), transparent 48%), radial-gradient(ellipse 45% 35% at 0% 75%, rgba(148, 163, 184, 0.06), transparent 42%)',
      }}
    />
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.55]"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.038) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, black 12%, transparent 68%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, black 12%, transparent 68%)',
      }}
      aria-hidden
    />
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-[#040506]"
      aria-hidden
    />
  </>
);

export default function AgentArsweep() {
  const navigate = useNavigate();
  const { sendTransaction } = usePrivySendTransaction();
  const { authenticated, logout } = usePrivy();
  const { login } = useLogin();
  const { wallets: privySolanaWallets } = useWallets();
  const privyWalletAddress = privySolanaWallets[0]?.address ?? null;
  const publicKey = useMemo(
    () => (privyWalletAddress ? new PublicKey(privyWalletAddress) : null),
    [privyWalletAddress],
  );
  const {
    needsPrivySolanaWallet,
    showSwitchFromEvmHint,
    connectSolana,
  } = useArsweepWalletAuthUi();
  const [agentPrivyConnectBusy, setAgentPrivyConnectBusy] = useState(false);

  const userId = useMemo(
    () => privyWalletAddress ?? getOrCreateAnonId(),
    [privyWalletAddress],
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
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const walletMenuRef = useRef<HTMLDivElement>(null);

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
    if (!walletMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!walletMenuRef.current) return;
      if (!walletMenuRef.current.contains(e.target as Node)) setWalletMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [walletMenuOpen]);

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

  const quickSuggestions: {
    Icon: typeof Zap;
    text: string;
    desc: string;
    action: () => void;
  }[] = [
    {
      Icon: Zap,
      text: 'Analyze my wallet',
      desc: 'Scan for dust accounts, locked SOL, and get a full breakdown.',
      action: () => setInput('Analyze my wallet'),
    },
    {
      Icon: ShieldCheck,
      text: 'Check for scam tokens',
      desc: 'Detect suspicious airdrops, honeypots, and rug pull tokens.',
      action: () => setInput('Check my wallet for scam tokens'),
    },
    {
      Icon: ScanSearch,
      text: 'Find dust & locked SOL',
      desc: 'Identify empty token accounts holding locked rent SOL.',
      action: () => setInput('Show me all dust tokens in my wallet'),
    },
  ];

  const premiumFeatures: {
    type: 'analyze' | 'report' | 'roast' | 'rugcheck' | 'planner';
    label: string;
    desc: string;
    price: string;
    Icon: typeof Sparkles;
  }[] = [
    { type: 'analyze', label: 'AI Analysis', desc: 'Deep wallet insights', price: '$0.10', Icon: Sparkles },
    { type: 'report', label: 'Sweep Report', desc: 'Quick dust check', price: '$0.05', Icon: FileBarChart },
    { type: 'roast', label: 'Wallet Roast', desc: 'Score + AI roast', price: '$0.05', Icon: Flame },
    { type: 'rugcheck', label: 'Rug Detector', desc: 'Find dangerous tokens', price: '$0.10', Icon: ShieldAlert },
    { type: 'planner', label: 'Sweep Planner', desc: 'Optimal sweep plan', price: '$0.05', Icon: LayoutList },
  ];

  const onPremiumPaid = (data: unknown) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `premium-${Date.now()}`,
        role: 'assistant',
        content: formatPremiumResult(paymentType, data),
        timestamp: new Date(),
        premiumResult: { serviceType: paymentType, payload: data },
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
        className="group w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2.5 text-left shadow-sm shadow-black/20 transition-all hover:border-cyan-500/20 hover:bg-white/[0.06] hover:shadow-md hover:shadow-cyan-500/5"
        title={s.preview}
      >
        <p className="truncate text-[11px] leading-snug text-white/65 transition-colors group-hover:text-white/85">
          {s.preview}
        </p>
      </motion.button>
    ));

  return (
    <div
      className="relative flex overflow-hidden bg-[#040506]"
      style={{ height: '100dvh' }}
    >
      <AgentAmbientBackground />

      {/* Desktop sidebar 240px */}
      <aside className="relative z-10 hidden h-screen w-[260px] shrink-0 flex-col border-r border-white/[0.07] bg-gradient-to-b from-[#0a0c10]/95 via-[#06080b]/98 to-[#040506] shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.04)] backdrop-blur-2xl md:flex">
        <div className="border-b border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-4">
          <a href="/" className="mb-4 flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-sky-500/10 blur-md" />
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                <ArsweepLogo className="h-8 w-8 drop-shadow-[0_0_14px_rgba(56,189,248,0.25)]" />
              </motion.div>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-white">Arsweep</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">AI Agent</p>
            </div>
          </a>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.06] text-sm font-semibold text-white/95 shadow-lg shadow-black/30 transition-all hover:border-cyan-500/25 hover:bg-white/[0.09] hover:shadow-cyan-500/10"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-slate-500/10 opacity-80" />
            <Plus className="relative h-4 w-4" />
            <span className="relative">New Chat</span>
          </motion.button>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-3 py-4">
          <div className="space-y-5 pr-1">
            {sessionsToday.length > 0 && (
              <div>
                <p className="mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  Today
                </p>
                <div className="space-y-2">{renderSessionList(sessionsToday)}</div>
              </div>
            )}
            {sessionsPrev.length > 0 && (
              <div>
                <p className="mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  Previous 7 days
                </p>
                <div className="space-y-2">{renderSessionList(sessionsPrev)}</div>
              </div>
            )}
            {sessionsToday.length === 0 && sessionsPrev.length === 0 && (
              <p className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] px-3 py-6 text-center text-[11px] leading-relaxed text-white/35">
                No chat history yet — start below
              </p>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-white/[0.06] bg-gradient-to-t from-black/40 to-transparent p-3">
          <div className="mb-3 flex items-center gap-2 px-0.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/15 to-slate-800/40 ring-1 ring-white/15">
              <Crown className="h-3.5 w-3.5 text-cyan-200/90" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Premium</span>
              <p className="text-[9px] text-white/35">Paid tools · x402</p>
            </div>
            <Zap className="h-3.5 w-3.5 shrink-0 text-cyan-400/45" />
          </div>
          <div className="space-y-2">
            {premiumFeatures.map((f) => (
              <motion.button
                key={f.type}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setPaymentType(f.type);
                  setShowPayment(true);
                }}
                className="group flex w-full items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-2.5 py-2.5 text-left shadow-sm shadow-black/25 transition-all hover:border-cyan-500/22 hover:bg-white/[0.07]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] ring-1 ring-white/[0.08] transition-transform group-hover:scale-[1.02]">
                  <f.Icon className="h-3.5 w-3.5 text-cyan-300/90" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-white/90">{f.label}</p>
                  <p className="truncate text-[9px] text-white/38">{f.desc}</p>
                </div>
                <span className="shrink-0 rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/85 ring-1 ring-white/15">
                  {f.price}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col bg-gradient-to-b from-transparent via-[#050608]/80 to-[#040506]">
        <header className="relative flex h-[3.75rem] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#050608]/75 px-4 shadow-[0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl md:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMobileSidebar(true)}
              className="rounded-xl p-2 text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white md:hidden"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="hidden rounded-xl p-1.5 text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/85 sm:block md:hidden"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.button>
            <span
              className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:px-2.5 sm:py-1 sm:text-[10px] ${
                isDevnet
                  ? 'border-emerald-500/35 bg-emerald-500/[0.12] text-emerald-200/95 shadow-[0_0_20px_rgba(52,211,153,0.12)]'
                  : 'border-sky-500/35 bg-sky-500/[0.12] text-sky-100/95 shadow-[0_0_20px_rgba(56,189,248,0.1)]'
              }`}
            >
              {isDevnet ? 'Devnet' : 'Mainnet'}
            </span>
            {publicKey ? (
              <span
                className="flex max-w-[min(100vw-12rem,220px)] items-center gap-2 rounded-full border border-emerald-500/30 bg-gradient-to-r from-emerald-500/[0.12] to-emerald-600/[0.06] px-2.5 py-1 text-[11px] font-mono text-emerald-100/95 shadow-sm shadow-emerald-500/10"
                title={publicKey.toBase58()}
              >
                <span className="relative inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="truncate">
                  {publicKey.toBase58().slice(0, 4)}…{publicKey.toBase58().slice(-4)}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/45">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/15 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white/30" />
                </span>
                No wallet
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div ref={walletMenuRef} className="relative">
              {needsPrivySolanaWallet ? (
                <div className="flex flex-col items-end gap-1">
                  {showSwitchFromEvmHint ? (
                    <span className="max-w-[210px] text-right text-[9px] leading-tight text-sky-200/85">
                      Arsweep pakai Solana. Hubungkan wallet Solana (Phantom, …).
                    </span>
                  ) : null}
                  <button
                    type="button"
                    disabled={agentPrivyConnectBusy}
                    onClick={() => {
                      setAgentPrivyConnectBusy(true);
                      void connectSolana().finally(() => setAgentPrivyConnectBusy(false));
                    }}
                    className="flex h-9 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.08] px-3 text-xs font-medium text-white/85 transition-colors hover:bg-white/[0.12] disabled:opacity-60"
                    title="Hubungkan wallet Solana lewat Privy"
                  >
                    {agentPrivyConnectBusy ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    <span className="font-mono text-xs">
                      {agentPrivyConnectBusy ? 'Membuka…' : 'Hubungkan Solana'}
                    </span>
                  </button>
                </div>
              ) : !authenticated ? (
                <button
                  type="button"
                  onClick={() => login()}
                  className="flex h-9 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.08] px-3 text-xs font-medium text-white/85 transition-colors hover:bg-white/[0.12]"
                >
                  <span className="font-mono">Log in</span>
                </button>
              ) : publicKey ? (
                <button
                  type="button"
                  onClick={() => setWalletMenuOpen((v) => !v)}
                  className="flex h-9 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.08] px-3 text-xs font-medium text-white/85 transition-colors hover:bg-white/[0.12]"
                  title="Wallet menu"
                >
                  <span className="font-mono text-xs">
                    {publicKey.toBase58().slice(0, 4)}…{publicKey.toBase58().slice(-4)}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${walletMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : null}

              {publicKey && walletMenuOpen && (
                <div className="absolute right-0 top-full z-[70] mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-black/90 shadow-xl backdrop-blur-md">
                  <p className="truncate border-b border-white/10 px-4 py-2.5 font-mono text-[11px] text-white/45">
                    {publicKey.toBase58()}
                  </p>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(publicKey.toBase58());
                        toast.success('Address copied');
                      } catch {
                        toast.error('Failed to copy address');
                      } finally {
                        setWalletMenuOpen(false);
                      }
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-white/85 transition-colors hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4 text-white/50" />
                    Copy Address
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await logout();
                        toast.success('Signed out');
                      } catch {
                        toast.error('Failed to sign out');
                      } finally {
                        setWalletMenuOpen(false);
                      }
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-300 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
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
                className="pt-6 text-center md:pt-10"
              >
                <div className="relative mx-auto mb-8 h-32 w-32">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.18, 0.05, 0.18] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-cyan-500/15 blur-3xl"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.12, 0.04, 0.12] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-4 rounded-full bg-cyan-400/15 blur-2xl"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-3 rounded-full border border-dashed border-white/[0.12]"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute inset-7 flex items-center justify-center rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[#0c0f14]/95 to-black/90 shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  >
                    <ArsweepLogo className="h-11 w-11 drop-shadow-[0_0_22px_rgba(56,189,248,0.3)]" />
                  </motion.div>
                </div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  <Sparkles className="h-3 w-3 text-cyan-300/85" />
                  Solana-native
                </p>
                <h2 className="mb-2 bg-gradient-to-br from-white via-white to-white/55 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-[2rem] md:leading-tight">
                  Arsweep AI
                </h2>
                <p className="mx-auto mb-10 max-w-md font-mono text-xs leading-relaxed text-white/42">
                  Your intelligent Solana wallet assistant
                </p>
                <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 px-1 sm:grid-cols-3">
                  {quickSuggestions.map((s, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + idx * 0.07 }}
                      whileHover={{ scale: 1.02, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={s.action}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4 text-left shadow-lg shadow-black/40 transition-all hover:border-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/10"
                    >
                      <span className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-slate-400/0 opacity-0 transition-opacity group-hover:opacity-100 group-hover:from-cyan-500/10 group-hover:to-slate-500/5" />
                      <div className="relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/12 to-white/[0.04] ring-1 ring-white/[0.1]">
                        <s.Icon className="h-5 w-5 text-cyan-200/95" strokeWidth={2} />
                      </div>
                      <p className="relative mb-1 text-xs font-semibold tracking-tight text-white/92">
                        {s.text}
                      </p>
                      <p className="relative text-[10px] leading-relaxed text-white/40">{s.desc}</p>
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
                  premiumResult={message.premiumResult}
                  onPremiumAnalysis={() => {
                    setPaymentType('analyze');
                    setShowPayment(true);
                  }}
                />
              );
            })}

            {(isLoading || isSweeping) && (
              <div className="flex items-end gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-md shadow-black/30 ring-1 ring-cyan-500/15">
                  <ArsweepLogo className="h-5 w-5" />
                </div>
                <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.07] to-white/[0.02] px-5 py-3.5 shadow-lg shadow-black/25">
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map((delay) => (
                      <div
                        key={delay}
                        className="h-2 w-2 animate-bounce rounded-full bg-gradient-to-b from-cyan-300/90 to-cyan-600/55 shadow-[0_0_8px_rgba(34,211,238,0.35)]"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-500/[0.08] to-red-600/[0.04] p-4 text-sm text-red-200/95 shadow-lg shadow-red-900/20">
                <p className="mb-1 font-semibold text-red-300">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="relative shrink-0 border-t border-white/[0.07] bg-[#050608]/90 p-3 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent md:px-6 md:pb-5 md:pt-4">
          <form
            onSubmit={handleSubmit}
            className="mx-auto w-full max-w-3xl pb-[env(safe-area-inset-bottom)]"
          >
            <div className="relative rounded-2xl bg-gradient-to-br from-white/15 via-white/[0.05] to-white/[0.02] p-px shadow-2xl shadow-black/50 ring-1 ring-white/[0.08]">
              <div className="relative rounded-[15px] bg-[#0a0c10]/95">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your wallet, tokens, or Solana…"
                  disabled={isLoading}
                  className="min-h-[56px] max-h-36 resize-none rounded-[15px] border-0 bg-transparent px-4 py-3.5 pr-16 text-sm text-white/92 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] placeholder:text-white/28 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900 shadow-lg shadow-black/30 transition-all hover:from-white hover:to-slate-200 disabled:opacity-30 disabled:shadow-none"
                >
                  <Send className="h-4 w-4" strokeWidth={2.25} />
                </button>
              </div>
            </div>
            <p className="mt-2.5 text-center font-mono text-[10px] tracking-wide text-white/32">
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
              className="absolute left-0 top-0 flex h-full w-[min(280px,92vw)] flex-col border-r border-white/[0.08] bg-gradient-to-b from-[#0a0c10] to-[#040506] shadow-2xl shadow-black/60 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] p-4">
                <span className="text-sm font-bold tracking-tight text-white">Arsweep AI</span>
                <button
                  type="button"
                  onClick={() => setShowMobileSidebar(false)}
                  className="rounded-xl p-2 text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="border-b border-white/[0.06] p-4">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNewChat}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.06] text-sm font-semibold text-white/95 shadow-lg shadow-black/30"
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </motion.button>
              </div>
              <ScrollArea className="min-h-0 flex-1 p-4">
                <div className="space-y-5">
                  {sessionsToday.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Today</p>
                      <div className="space-y-2">{renderSessionList(sessionsToday)}</div>
                    </div>
                  )}
                  {sessionsPrev.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                        Previous 7 days
                      </p>
                      <div className="space-y-2">{renderSessionList(sessionsPrev)}</div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="border-t border-white/[0.06] bg-gradient-to-t from-black/30 to-transparent p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">Premium</p>
                <div className="space-y-2">
                  {premiumFeatures.map((f) => (
                    <button
                      key={f.type}
                      type="button"
                      onClick={() => {
                        setPaymentType(f.type);
                        setShowPayment(true);
                        setShowMobileSidebar(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 py-2.5 text-left transition-colors hover:border-cyan-500/25 hover:bg-white/[0.07]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08]">
                        <f.Icon className="h-3.5 w-3.5 text-cyan-300/90" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white/90">{f.label}</p>
                        <p className="text-[9px] text-white/38">{f.desc}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold text-white/85 ring-1 ring-white/15">
                        {f.price}
                      </span>
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
