import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useConnection, useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import TokenList, { type Token } from "@/components/TokenList";
import ActionBar from "@/components/ActionBar";
import SweepSuccessModal from "@/components/SweepSuccessModal";
import ChatWidget from "@/components/ChatWidget";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import PremiumFooter from "@/components/PremiumFooter";

import { getProgram } from "@/lib/anchor";
import { EXPLORER_TX_URL, NETWORK } from "@/config/env";
import SweepHistory from "@/components/SweepHistory";
import { saveSweepRecord, getSweepHistory, type SweepRecord } from "@/lib/sweepHistory";
import { ACCOUNTS_PER_TX } from "@/config/sweep";
import { confirmTransactionWithTimeout } from "@/utils/transaction";
import { fetchAllTokenAccounts, type TokenAccountInfo } from "@/lib/tokenAccounts";
import { useSwapMode } from "@/hooks/useSwapMode";
import { getSwapQuote } from "@/lib/jupiterSwap";
import { useReferral } from "@/hooks/useReferral";
import { updateSweepStats } from "@/lib/supabase";

const RENT_PER_ACCOUNT = 0.002042; // SOL per closed account (~2,039,280 lamports)
const TOKEN_ICONS = ["🪙", "🐶", "🌙", "💀", "🐕", "🧹", "💨", "🐱", "🦊", "🐸"];

const Dashboard = () => {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { user, season } = useReferral(publicKey?.toBase58() ?? null);

  const [tokenAccounts, setTokenAccounts] = useState<TokenAccountInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [sweeping, setSweeping] = useState(false);
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

  const { tokenModes, toggleMode, resetModes } = useSwapMode();
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
    const fetchQuotes = async () => {
      const swapTokens = tokenAccounts.filter(
        (a) =>
          a.isSweepable &&
          a.hasLiquidityPool &&
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
      sweepableAccounts.map((a, i) => ({
        id: a.pubkey.toBase58(),
        name: `Token ${a.mint.toBase58().slice(0, 4)}...`,
        mint: a.mint.toBase58(),
        balance: "0",
        rentRefundable: RENT_PER_ACCOUNT,
        icon: TOKEN_ICONS[i % TOKEN_ICONS.length],
      })),
    [sweepableAccounts]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === tokens.length ? new Set() : new Set(tokens.map((t) => t.id))
    );
  }, [tokens]);

  const totalSol = selectedIds.size * RENT_PER_ACCOUNT;

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
    if (!publicKey || !anchorWallet || selectedIds.size === 0 || sweeping) return;

    const program = getProgram(anchorWallet);
    const TREASURY = new PublicKey("J7ApX8Y3vp6WcsGD99kyTTQyLuxxhsT8zBfNTqcFW9qi");

    setSweeping(true);
    setSweepProgress(null);

    try {
      const selectedAccounts = tokenAccounts.filter(
        (a) => a.isSweepable && selectedIds.has(a.pubkey.toBase58())
      );

      // Batch: max ACCOUNTS_PER_TX per transaction
      const batches: typeof selectedAccounts[] = [];
      for (let i = 0; i < selectedAccounts.length; i += ACCOUNTS_PER_TX) {
        batches.push(selectedAccounts.slice(i, i + ACCOUNTS_PER_TX));
      }

      setSweepProgress({ currentBatch: 0, totalBatches: batches.length });
      let lastSignature: string | undefined;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        setSweepProgress({
          currentBatch: batchIndex + 1,
          totalBatches: batches.length,
          confirmingSlow: false,
        });

        // Build one ix per account via Anchor program
        // Each ix routes through on-chain fee logic (treasury validated)
        const ixs = await Promise.all(
          batch.map((account) =>
            program.methods
              .closeEmptyAccount()
              .accounts({
                user: publicKey,
                tokenAccount: account.pubkey,
                treasury: TREASURY,
              })
              .instruction()
          )
        );

        const tx = new Transaction().add(...ixs);
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;

        const sig = await sendTransaction(tx, connection, {
          skipPreflight: false,
          preflightCommitment: "confirmed",
          maxRetries: 3,
        });
        lastSignature = sig;

        await confirmTransactionWithTimeout(
          connection,
          sig,
          blockhash,
          lastValidBlockHeight,
          () =>
            setSweepProgress((p) =>
              p ? { ...p, confirmingSlow: true } : null
            )
        );
      }

      // Success
      setSweepProgress(null);
      const closedIds = new Set(selectedAccounts.map((a) => a.pubkey.toBase58()));
      const count = closedIds.size;
      const sol = selectedIds.size * RENT_PER_ACCOUNT;

      setSelectedIds(new Set());
      setTokenAccounts((prev) =>
        prev.filter((a) => !closedIds.has(a.pubkey.toBase58()))
      );
      setSuccessModal({ open: true, count, totalSol: sol, signature: lastSignature });

      const saved = saveSweepRecord({
        walletAddress: publicKey.toBase58(),
        timestamp: Date.now(),
        accountsClosed: count,
        totalSolReclaimed: sol,
        signature: lastSignature,
        network: NETWORK,
      });
      setSweepHistory((prev) => [saved, ...prev]);

      if (season) {
        await updateSweepStats(
          publicKey.toBase58(),
          season.id,
          count,
          sol
        );
      }

      toast.success(`🎉 Swept ${count} accounts, reclaimed ${sol.toFixed(5)} SOL!`, {
        duration: 8000,
        action: lastSignature
          ? {
              label: "View on Solscan",
              onClick: () =>
                window.open(EXPLORER_TX_URL(lastSignature!), "_blank"),
            }
          : undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Arsweep] Sweep failed:", err);
      toast.error(`Sweep failed: ${msg}`);
    } finally {
      setSweeping(false);
      setSweepProgress(null);
    }
  }, [publicKey, anchorWallet, connection, sendTransaction, tokenAccounts, selectedIds, sweeping]);

  // Not connected
  if (!connected) {
    return (
      <div className="relative min-h-screen bg-background overflow-hidden">
        <div className="orb w-[600px] h-[600px] bg-primary/10 top-1/3 -right-60 animate-float" />
        <div className="orb w-[500px] h-[500px] bg-secondary/10 bottom-0 -left-40 animate-float" style={{ animationDelay: "3s" }} />
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[70vh] px-4"
        >
          <div className="glass rounded-3xl p-10 max-w-lg w-full text-center border border-border/50">
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Wallet className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-extrabold text-foreground mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              Scan your Solana wallet for empty token accounts and reclaim locked SOL — takes under 5 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">🔒 Read-only scan</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">✅ Non-custodial</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50">⚡ Free to scan</span>
            </div>
            <WalletMultiButton className="!bg-primary !text-primary-foreground !rounded-2xl !px-8 !py-4 !text-lg !font-semibold hover:!opacity-90 !transition-opacity !w-full !justify-center" />
            <p className="text-xs text-muted-foreground mt-4">
              Supports Phantom, Solflare, Backpack & more
            </p>
          </div>
        </motion.div>
        <PremiumFooter />
        <ChatWidget />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="orb w-[600px] h-[600px] bg-primary/10 top-1/3 -right-60 animate-float" />
      <div className="orb w-[500px] h-[500px] bg-secondary/10 bottom-0 -left-40 animate-float" style={{ animationDelay: "3s" }} />

      <Header />
      <Hero scanning={scanning} scanned={scanned} onScan={handleScan} onRescan={handleRescan} sweeping={sweeping} accountsFound={sweepableAccounts.length} />
      <StatsBar
        totalDust={tokens.length}
        potentialRefund={totalSol}
        accountsToClose={selectedIds.size}
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
        totalSol={totalSol}
        onSweep={handleSweep}
        sweeping={sweeping}
        sweepProgress={sweepProgress}
      />
      <SweepSuccessModal
        open={successModal.open}
        onOpenChange={(open) => setSuccessModal((prev) => ({ ...prev, open }))}
        count={successModal.count}
        totalSol={successModal.totalSol}
        signature={successModal.signature}
      />
      <PremiumFooter />
      <ChatWidget />
    </div>
  );
};

export default Dashboard;
