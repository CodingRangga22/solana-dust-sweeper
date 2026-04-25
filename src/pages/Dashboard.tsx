import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { toast } from "sonner";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import WalletMenu from "@/components/WalletMenu";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import TokenList, { type Token } from "@/components/TokenList";
import ActionBar from "@/components/ActionBar";
import SweepSuccessModal from "@/components/SweepSuccessModal";
import ChangeWalletInstructionModal from "@/components/ChangeWalletInstructionModal";
import ChatWidget from "@/components/ChatWidget";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import PremiumFooter from "@/components/PremiumFooter";

import { executeSweepNative } from "@/lib/sweepNative";
import { EXPLORER_TX_URL, NETWORK } from "@/config/env";
import SweepHistory from "@/components/SweepHistory";
import { saveSweepRecord, getSweepHistory, type SweepRecord } from "@/lib/sweepHistory";
import { fetchAllTokenAccounts, type TokenAccountInfo } from "@/lib/tokenAccounts";
import { useSwapMode } from "@/hooks/useSwapMode";
import { getSwapQuote, getSwapTransaction } from "@/lib/jupiterSwap";
import { useReferral } from "@/hooks/useReferral";
import { updateSweepStats } from "@/lib/supabase";
import { formatTokenUiBalance } from "@/lib/utils";
import { useWalletSession } from "@/hooks/useWalletSession";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useTwaSweepCallback } from "@/components/TwaBanner";
import ConnectWalletGate from "@/components/ConnectWalletGate";
import { useSyraTokenRisk } from "@/hooks/useSyraTokenRisk";

/** Fallback when rentLamports missing — prefer per-account rent from scan */
const RENT_PER_ACCOUNT = 0.002042;
const FEE_BPS = 150;
const GAS_EST_PER_ACCOUNT = 0.000005;
const MIN_SWAP_VALUE_CENTS = 5; // $0.05 — below this, skip swap and close-only
const TOKEN_ICONS = ["🪙", "🐶", "🌙", "💀", "🐕", "🧹", "💨", "🐱", "🦊", "🐸"];

const Dashboard = () => {
  useScrollReveal();
  const { connection } = useConnection();
  const {
    sessionActive: connected,
    sendTransaction,
    handleChangeWallet,
    handleDisconnect,
    handleDisconnectAndReconnect,
    showChangeWalletModal,
    setShowChangeWalletModal,
    walletMismatch,
  } = useWalletSession();
  const { authenticated } = usePrivy();
  const { wallets: privySolanaWallets } = useWallets();
  const solanaWalletAddress = privySolanaWallets[0]?.address;
  const publicKey = useMemo(
    () => (solanaWalletAddress ? new PublicKey(solanaWalletAddress) : null),
    [solanaWalletAddress],
  );
  const { user, season } = useReferral(publicKey?.toBase58() ?? null);
  const { isInTelegram, walletFromTwa, setMainButton, hideMainButton, showConfirm } = useTelegramWebApp();
  const { notifySweepComplete } = useTwaSweepCallback();

  const [tokenAccounts, setTokenAccounts] = useState<TokenAccountInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [pendingTx, setPendingTx] = useState<string | null>(null);
  const sweepLockRef = useRef(false);
  const [sweepProgress, setSweepProgress] = useState<{
    currentBatch: number;
    totalBatches: number;
    confirmingSlow?: boolean;
  } | null>(null);
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    count: number;
    totalSol: number;
    signature?: string;
  }>({ open: false, count: 0, totalSol: 0 });

  const { tokenModes, toggleMode, resetModes, setMode } = useSwapMode();
  const [swapQuotes, setSwapQuotes] = useState<Record<string, number>>({});
  const [sweepHistory, setSweepHistory] = useState<SweepRecord[]>(() => {
    try {
      const raw = localStorage.getItem("arsweep_history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!publicKey) return;
    setSweepHistory(getSweepHistory(publicKey.toBase58()));
  }, [publicKey, scanned]);

  useEffect(() => {
    if (!connected) {
      setTokenAccounts([]);
      setSelectedIds(new Set());
      setScanned(false);
      setSweeping(false);
      setPendingTx(null);
      sweepLockRef.current = false;
      setSweepProgress(null);
      resetModes();
      setSwapQuotes({});
    }
  }, [connected, resetModes]);

  // TWA: auto-scan wallet dari bot + Main Button
  useEffect(() => {
    if (!isInTelegram) return;
    if (!walletFromTwa || !connected || !publicKey) return;
    if (publicKey.toBase58() === walletFromTwa && !scanned) {
      handleScan();
    }
  }, [isInTelegram, walletFromTwa, connected, publicKey, scanned]);

  // TWA: update Main Button saat token dipilih
  useEffect(() => {
    if (!isInTelegram) return;
    if (selectedIds.size > 0 && !sweeping) {
      setMainButton(`Sweep ${selectedIds.size} Token`, () => {
        showConfirm(
          `Sweep ${selectedIds.size} token dan recover SOL?`,
          (confirmed) => { if (confirmed) handleSweep(); }
        );
      });
    } else {
      hideMainButton();
    }
  }, [isInTelegram, selectedIds, sweeping]);

  useEffect(() => {
    const fetchQuotes = async () => {
      const swapTokens = tokenAccounts.filter(
        (a) =>
          a.isSweepable &&
          a.amount > BigInt(0) &&
          tokenModes[a.pubkey.toBase58()] === "swap",
      );

      for (const account of swapTokens) {
        const id = account.pubkey.toBase58();
        if (swapQuotes[id] !== undefined) continue;
        const quote = await getSwapQuote(account.mint.toBase58(), account.amount);
        if (quote) {
          setSwapQuotes((prev) => ({ ...prev, [id]: quote.outAmountSol }));
        }
      }
    };

    fetchQuotes();
  }, [tokenModes, tokenAccounts]);

  // Syra: fetch token risk for swap-eligible mints (so we can force close-only on high risk).
  const syraRiskMints = useMemo(() => {
    const m: string[] = [];
    for (const a of tokenAccounts) {
      if (!a.isSweepable) continue;
      if (!a.hasLiquidityPool) continue;
      if (a.amount <= BigInt(0)) continue;
      m.push(a.mint.toBase58());
    }
    return m;
  }, [tokenAccounts]);

  const { risks: syraRisks, loadingMints: syraLoadingMints } = useSyraTokenRisk(syraRiskMints);

  // Force close-only when Syra flags a mint as high risk.
  useEffect(() => {
    if (tokenAccounts.length === 0) return;
    for (const a of tokenAccounts) {
      const id = a.pubkey.toBase58();
      const mint = a.mint.toBase58();
      const risk = syraRisks[mint];
      if (risk?.level === "high" && (tokenModes[id] ?? "close") === "swap") {
        setMode(id, "close");
      }
    }
  }, [syraRisks, tokenAccounts, tokenModes, setMode]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const sweepableAccounts = useMemo(
    () => tokenAccounts.filter((a) => a.isSweepable),
    [tokenAccounts]
  );

  const nonSweepableAccounts = useMemo(
    () => tokenAccounts.filter((a) => !a.isSweepable),
    [tokenAccounts]
  );

  const tokens: Token[] = useMemo(
    () =>
      sweepableAccounts.map((a) => ({
        id: a.pubkey.toBase58(),
        name: a.metadata.name,
        mint: a.mint.toBase58(),
        balance: formatTokenUiBalance(a.amount, a.decimals),
        rentRefundable: RENT_PER_ACCOUNT,
        icon: a.metadata.logoURI ?? TOKEN_ICONS[0],
      })),
    [sweepableAccounts]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === tokens.length ? new Set() : new Set(tokens.map((t) => t.id))
    );
  }, [tokens]);

  /** Matches on-chain intent: rent reclaim + Jupiter→SOL when swap mode (not just count×constant). */
  const sweepEstimate = useMemo(() => {
    let rentSol = 0;
    let swapSol = 0;
    let swapRowsMissingQuote = 0;

    for (const a of tokenAccounts) {
      const id = a.pubkey.toBase58();
      if (!selectedIds.has(id) || !a.isSweepable) continue;
      rentSol += a.rentLamports / 1e9;
      const mode = tokenModes[id] ?? "close";
      if (mode === "swap" && a.amount > BigInt(0)) {
        const q = swapQuotes[id];
        if (q !== undefined) swapSol += q;
        else swapRowsMissingQuote += 1;
      }
    }

    const grossSol = rentSol + swapSol;
    const serviceFeeSol = rentSol * (FEE_BPS / 10000);
    const gasFeeSol = GAS_EST_PER_ACCOUNT * selectedIds.size;
    const netSol = Math.max(grossSol - serviceFeeSol - gasFeeSol, 0);

    return {
      rentSol,
      swapSol,
      grossSol,
      serviceFeeSol,
      gasFeeSol,
      netSol,
      swapRowsMissingQuote,
    };
  }, [tokenAccounts, selectedIds, tokenModes, swapQuotes]);

  const handleRescan = useCallback(() => {
    setTokenAccounts([]);
    setSelectedIds(new Set());
    setScanned(false);
    resetModes();
    setSwapQuotes({});
  }, [resetModes]);

  const handleScan = useCallback(async () => {
    if (!publicKey || scanning || scanned) return;

    setScanning(true);

    try {
      const accounts = await fetchAllTokenAccounts(connection, publicKey);
      setTokenAccounts(accounts);
      const sweepable = accounts.filter((a) => a.isSweepable);
      setSelectedIds(new Set(sweepable.map((a) => a.pubkey.toBase58())));

      const defaultModes: Record<string, "close" | "swap"> = {};
      for (const a of sweepable) {
        const id = a.pubkey.toBase58();
        defaultModes[id] = a.hasLiquidityPool && a.amount > BigInt(0) ? "swap" : "close";
      }
      resetModes();
      for (const [id, mode] of Object.entries(defaultModes)) {
        if (mode === "swap") toggleMode(id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      console.error("[Arsweep] Scan failed:", {
        error: err,
        message: errorMessage,
        stack: errorStack,
      });
      toast.error(`Failed to scan wallet: ${errorMessage}`);
      setTokenAccounts([]);
    } finally {
      setScanning(false);
      setScanned(true);
    }
  }, [publicKey, connection, scanning, scanned]);

  const handleSweep = useCallback(async () => {
    // ── Transaction Guard: triple-layer re-entrancy protection ──────
    if (sweepLockRef.current) {
      console.warn("[TxGuard] Sweep blocked — synchronous lock active");
      return;
    }
    if (sweeping || pendingTx) {
      console.warn("[TxGuard] Sweep blocked — already running", { sweeping, pendingTx });
      return;
    }
    if (!publicKey || !sendTransaction || selectedIds.size === 0) return;
    if (walletMismatch) {
      toast.error('Wallet account mismatch. Switch back in your wallet or click "Change Wallet".');
      return;
    }

    sweepLockRef.current = true;
    setSweeping(true);
    setPendingTx(null);
    setSweepProgress(null);
    console.log("[TxGuard] Sweep started — lock acquired");

    try {
      const selectedAccounts = tokenAccounts.filter(
        (a) => a.isSweepable && selectedIds.has(a.pubkey.toBase58())
      );

      // ════════════════════════════════════════════════════════════════
      // 3-LAYER AUTO-PROTECTION: classify every token before execution
      //
      //   Protection 1: liquidity > 0     → MUST swap, never burn
      //   Protection 2: price/value > 0   → TRY swap via Jupiter
      //   Protection 3: route exists       → swap via Jupiter
      //
      //   Burn ONLY if: value == 0 AND liquidity == 0
      // ════════════════════════════════════════════════════════════════

      const swapQueue: TokenAccountInfo[] = [];
      const burnQueue: TokenAccountInfo[] = [];

      for (const acc of selectedAccounts) {
        const hasBalance = acc.amount > BigInt(0);

        if (!hasBalance) {
          burnQueue.push(acc);
          continue;
        }

        if (acc.usdValueCents < MIN_SWAP_VALUE_CENTS) {
          console.log(
            `[Min-value] ${acc.metadata.symbol}: $${(acc.usdValueCents / 100).toFixed(2)} < $0.05 → burn queue (close-only)`,
          );
          burnQueue.push(acc);
          continue;
        }

        if (acc.hasLiquidityPool) {
          console.log(`[Protection 1] ${acc.metadata.symbol}: liquidity detected → swap queue`);
          swapQueue.push(acc);
          continue;
        }

        if (acc.usdValueCents > 0) {
          console.log(`[Protection 2] ${acc.metadata.symbol}: value $${(acc.usdValueCents / 100).toFixed(2)} → swap queue`);
          swapQueue.push(acc);
          continue;
        }

        console.log(`[Burn OK] ${acc.metadata.symbol}: value=$0, liquidity=none → burn queue`);
        burnQueue.push(acc);
      }

      console.log(`[TxGuard] Queues ready — swap: ${swapQueue.length}, burn: ${burnQueue.length}`);

      let totalClosed = 0;
      let totalRentLamports = 0;
      let lastSignature: string | undefined;
      const processedIds: string[] = [];
      const totalSteps = swapQueue.length + (burnQueue.length > 0 ? 1 : 0);

      // ── Phase 1: Swap tokens (Protection 3: route check) ─────────
      for (let i = 0; i < swapQueue.length; i++) {
        const acc = swapQueue[i];
        const id = acc.pubkey.toBase58();
        setSweepProgress({ currentBatch: i + 1, totalBatches: totalSteps });

        try {
          const quote = await getSwapQuote(acc.mint.toBase58(), acc.amount);

          if (!quote || Number(quote.outAmount) <= 0) {
            const reason = !quote ? "no Jupiter route" : "outAmount is 0";
            console.warn(`[Protection 3] ${acc.metadata.symbol}: ${reason}`);
            if (acc.usdValueCents === 0 && !acc.hasLiquidityPool) {
              console.log(`[Fallback] ${acc.metadata.symbol}: ${reason} + no value → move to burn`);
              burnQueue.push(acc);
            } else {
              toast.error(`${acc.metadata.symbol}: has value but ${reason}. Skipped for safety.`);
            }
            continue;
          }

          const swapTxBase64 = await getSwapTransaction(quote, publicKey.toBase58());
          if (!swapTxBase64) {
            toast.error(`Failed to build swap tx for ${acc.metadata.symbol}. Skipping.`);
            continue;
          }

          const swapTxBuf = Buffer.from(swapTxBase64, "base64");
          const versionedTx = VersionedTransaction.deserialize(swapTxBuf);

          console.log(`[TxGuard] Submitting swap tx for ${acc.metadata.symbol}...`);
          const sig = await sendTransaction(versionedTx as any, connection, {
            skipPreflight: false,
            preflightCommitment: "confirmed",
          });
          setPendingTx(sig);
          console.log(`[TxGuard] Swap tx submitted: ${sig} — awaiting confirmation`);

          await connection.confirmTransaction(sig, "confirmed");
          console.log(`[TxGuard] Swap confirmed: ${acc.metadata.symbol} → SOL (${sig})`);
          setPendingTx(null);

          lastSignature = sig;
          totalClosed++;
          totalRentLamports += acc.rentLamports;
          processedIds.push(id);
        } catch (err: any) {
          console.error(`[TxGuard] Swap failed for ${acc.metadata.symbol}:`, err);
          toast.error(`Swap failed for ${acc.metadata.symbol}: ${err?.message ?? "Unknown error"}`);
          setPendingTx(null);
        }
      }

      // ── Phase 2: Burn + close (only value==0 AND liquidity==0) ────
      if (burnQueue.length > 0) {
        setSweepProgress({
          currentBatch: swapQueue.length + 1,
          totalBatches: totalSteps + (burnQueue.length > 0 ? 1 : 0),
        });

        console.log(`[TxGuard] Submitting burn+close batch (${burnQueue.length} accounts)...`);
        const closeResults = await executeSweepNative(
          connection,
          { publicKey, sendTransaction },
          burnQueue.map((a) => ({
            pubkey: a.pubkey,
            mint: a.mint,
            programId: a.programId,
            amount: a.amount,
            rentLamports: a.rentLamports,
            hasLiquidityPool: a.hasLiquidityPool,
            usdValueCents: a.usdValueCents,
          })),
          (progress) => {
            setSweepProgress({
              currentBatch: swapQueue.length + progress.currentBatch,
              totalBatches: swapQueue.length + progress.totalBatches,
              confirmingSlow: progress.confirmingSlow,
            });
          },
        );

        for (const r of closeResults) {
          lastSignature = r.signature;
          setPendingTx(r.signature);
          totalClosed += r.accountsClosed;
          totalRentLamports += r.rentReclaimed;
          console.log(`[TxGuard] Burn batch confirmed: ${r.signature} (${r.accountsClosed} accounts)`);
        }
        setPendingTx(null);

        for (const a of burnQueue) {
          processedIds.push(a.pubkey.toBase58());
        }
      }

      // ── Phase 3: Update UI + save history ─────────────────────────
      setSweepProgress(null);
      const closedSet = new Set(processedIds);
      setSelectedIds(new Set());
      setTokenAccounts((prev) => prev.filter((a) => !closedSet.has(a.pubkey.toBase58())));

      if (totalClosed > 0) {
        const sol = (totalRentLamports * (1 - FEE_BPS / 10000)) / 1e9;
        setSuccessModal({ open: true, count: totalClosed, totalSol: sol, signature: lastSignature });

        const saved = saveSweepRecord({
          walletAddress: publicKey.toBase58(),
          timestamp: Date.now(),
          accountsClosed: totalClosed,
          totalSolReclaimed: sol,
          signature: lastSignature,
          network: NETWORK,
        });
        setSweepHistory((prev) => [saved, ...prev]);

        if (season) {
          await updateSweepStats(publicKey.toBase58(), season.id, totalClosed, sol);
        }

        console.log(`[TxGuard] Sweep complete — ${totalClosed} accounts closed, ${sol.toFixed(5)} SOL reclaimed`);
      }
    } catch (err: any) {
      console.error("[TxGuard] Sweep error:", err);
      toast.error(err?.message ?? "Sweep failed. Please try again.");
    } finally {
      sweepLockRef.current = false;
      setSweeping(false);
      setPendingTx(null);
      setSweepProgress(null);
      console.log("[TxGuard] Sweep finished — lock released");
    }
  }, [publicKey, sendTransaction, connection, selectedIds, sweeping, pendingTx, tokenAccounts, season, walletMismatch]);

  // Not connected
  if (!connected && !authenticated) {
    return (
      <ConnectWalletGate
        cta={
          <WalletMenu
            variant="hero"
            onChangeWallet={handleChangeWallet}
            onDisconnect={handleDisconnect}
            walletMismatch={walletMismatch}
          />
        }
        helperText="Sign in with Privy, then connect a Solana wallet to scan and sign transactions."
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden arsweep-bg-ambient">
      <div className="orb w-[600px] h-[600px] bg-primary/12 top-1/3 -right-60 animate-float" />
      <div className="orb w-[520px] h-[520px] bg-secondary/12 bottom-0 -left-40 animate-float" style={{ animationDelay: "3s" }} />

      <Header onChangeWallet={handleChangeWallet} onDisconnect={handleDisconnect} walletMismatch={walletMismatch} />
      <Hero scanning={scanning} scanned={scanned} onScan={handleScan} onRescan={handleRescan} sweeping={sweeping} accountsFound={sweepableAccounts.length} />
      <StatsBar
        totalDust={tokens.length}
        accountsToClose={selectedIds.size}
        grossRefund={sweepEstimate.grossSol}
        serviceFee={sweepEstimate.serviceFeeSol}
        gasFee={sweepEstimate.gasFeeSol}
        netRefund={sweepEstimate.netSol}
      />
      <TokenList
        tokenAccounts={tokenAccounts}
        selectedIds={selectedIds}
        onToggle={handleToggle}
        onSelectAll={handleSelectAll}
        loading={scanning}
        disabled={sweeping}
        scanned={scanned}
        tokenModes={tokenModes}
        onToggleMode={toggleMode}
        swapQuotes={swapQuotes}
        syraRisks={syraRisks}
        syraLoadingMints={syraLoadingMints}
        analyticsSlot={<AnalyticsPanel records={sweepHistory} hideRecentList />}
      />
      {publicKey && sweepHistory.length > 0 && (
        <SweepHistory
          walletAddress={publicKey.toBase58()}
          initialRecords={sweepHistory}
          onClear={() => setSweepHistory([])}
        />
      )}
      <ActionBar
        count={selectedIds.size}
        grossSol={sweepEstimate.grossSol}
        serviceFeeSol={sweepEstimate.serviceFeeSol}
        gasFeeSol={sweepEstimate.gasFeeSol}
        netSol={sweepEstimate.netSol}
        hasSwapEstimate={sweepEstimate.swapSol > 0}
        disclaimerNote={
          sweepEstimate.swapRowsMissingQuote > 0
            ? "Loading swap quotes… net may update."
            : undefined
        }
        onSweep={handleSweep}
        sweeping={sweeping}
        pendingTx={pendingTx}
        sweepProgress={sweepProgress}
      />
      <SweepSuccessModal
        open={successModal.open}
        onOpenChange={(open) => setSuccessModal((prev) => ({ ...prev, open }))}
        count={successModal.count}
        totalSol={successModal.totalSol}
        signature={successModal.signature}
        walletAddress={publicKey?.toBase58()}
      />
      <ChangeWalletInstructionModal
        open={showChangeWalletModal}
        onOpenChange={setShowChangeWalletModal}
        onDisconnect={handleDisconnectAndReconnect}
      />
      <PremiumFooter />
      <ChatWidget />
    </div>
  );
};

export default Dashboard;
