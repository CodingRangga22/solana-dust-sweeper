import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, ComputeBudgetProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from "@solana/spl-token";
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
import PremiumFooter from "@/components/PremiumFooter";

import { EXPLORER_TX_URL } from "@/config/env";
import { ACCOUNTS_PER_TX, RENT_LAMPORTS_PER_ACCOUNT } from "@/config/sweep";
import { confirmTransactionWithTimeout } from "@/utils/transaction";

const RENT_PER_ACCOUNT = 0.002042; // SOL per closed account (~2,039,280 lamports)
const FEE_PERCENT = 0.015; // 1.5% platform fee
const TREASURY_WALLET = "J7ApX8Y3vp6WcsGD99kyTTQyLuxxhsT8zBfNTqcFW9qi";
const DUST_THRESHOLD = 0.000001;
const TOKEN_ICONS = ["🪙", "🐶", "🌙", "💀", "🐕", "🧹", "💨", "🐱", "🦊", "🐸"];

async function fetchTokenAccounts(
  connection: import("@solana/web3.js").Connection,
  publicKey: PublicKey
): Promise<Token[]> {
  const parsedAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
    programId: TOKEN_PROGRAM_ID,
  });

  const dustTokens: Token[] = [];
  for (let i = 0; i < parsedAccounts.value.length; i++) {
    const { pubkey, account } = parsedAccounts.value[i];
    const info = account.data.parsed?.info;
    if (!info) continue;

    const mint = info.mint as string;
    const tokenAmount = info.tokenAmount;
    const amount = tokenAmount?.amount ? BigInt(tokenAmount.amount) : BigInt(0);
    const uiAmount = tokenAmount?.uiAmount ?? 0;
    const uiAmountString = tokenAmount?.uiAmountString ?? "0";

    const isDust =
      amount === BigInt(0) || (typeof uiAmount === "number" && uiAmount < DUST_THRESHOLD);

    if (isDust) {
      dustTokens.push({
        id: pubkey.toBase58(),
        name: `Token ${mint.slice(0, 4)}...`,
        mint,
        balance: uiAmountString,
        rentRefundable: RENT_PER_ACCOUNT,
        icon: TOKEN_ICONS[i % TOKEN_ICONS.length],
      });
    }
  }
  return dustTokens;
}

const Dashboard = () => {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  const [tokens, setTokens] = useState<Token[]>([]);
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

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === tokens.length ? new Set() : new Set(tokens.map((t) => t.id))
    );
  }, [tokens]);

  const totalSol = selectedIds.size * RENT_PER_ACCOUNT;

  const handleScan = useCallback(async () => {
    if (!publicKey || scanning || scanned) return;

    setScanning(true);

    await new Promise((r) => setTimeout(r, 2000));

    try {
      const dustTokens = await fetchTokenAccounts(connection, publicKey);
      setTokens(dustTokens);
      setSelectedIds(new Set(dustTokens.map((t) => t.id)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      console.error("[Arsweep] Scan failed:", {
        error: err,
        message: errorMessage,
        stack: errorStack,
      });
      toast.error(`Failed to scan wallet: ${errorMessage}`);
      setTokens([]);
    } finally {
      setScanning(false);
      setScanned(true);
    }
  }, [publicKey, connection, scanning, scanned]);

  const handleSweep = useCallback(async () => {
    if (!publicKey || selectedIds.size === 0 || sweeping) return;

    const selectedTokens = tokens.filter((t) => selectedIds.has(t.id));
    if (selectedTokens.length === 0) return;

    setSweeping(true);
    setSweepProgress(null);

    try {
      const accountPubkeys = selectedTokens.map((t) => new PublicKey(t.id));
      const treasuryPubkey = new PublicKey(TREASURY_WALLET);

      // Auto-batching: split into chunks of max ACCOUNTS_PER_TX
      const batches: PublicKey[][] = [];
      for (let i = 0; i < accountPubkeys.length; i += ACCOUNTS_PER_TX) {
        batches.push(accountPubkeys.slice(i, i + ACCOUNTS_PER_TX));
      }

      setSweepProgress({ currentBatch: 0, totalBatches: batches.length });

      let lastSignature: string | undefined;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        setSweepProgress({ currentBatch: batchIndex + 1, totalBatches: batches.length, confirmingSlow: false });
        const tx = new Transaction();

        // Compute budget protection (prepend to every batch)
        tx.add(
          ComputeBudgetProgram.setComputeUnitLimit({ units: 1_000_000 }),
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 })
        );

        // Fee: 1.5% of rent lamports per account (~0.00204 SOL per account)
        const feePerAccount = Math.floor(RENT_LAMPORTS_PER_ACCOUNT * FEE_PERCENT);
        const totalFeeLamports = feePerAccount * batch.length;

        // Close: Return rent to user's wallet (must happen first so user receives lamports)
        for (const accountPubkey of batch) {
          tx.add(
            createCloseAccountInstruction(
              accountPubkey,
              publicKey, // destination: rent goes to user
              publicKey, // authority: user owns the account
              [],
              TOKEN_PROGRAM_ID
            )
          );
        }

        // Transfer: Send 1.5% platform fee to treasury (user pays from rent just received)
        tx.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: treasuryPubkey,
            lamports: totalFeeLamports,
          })
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;

        const sig = await sendTransaction(
          tx,
          connection,
          {
            skipPreflight: false,
            preflightCommitment: "confirmed",
            maxRetries: 3,
          }
        );
        lastSignature = sig;

        await confirmTransactionWithTimeout(
          connection,
          sig,
          blockhash,
          lastValidBlockHeight,
          () => setSweepProgress((p) => (p ? { ...p, confirmingSlow: true } : null))
        );
      }

      setSweepProgress(null);

      const closedIds = new Set(selectedTokens.map((t) => t.id));
      const count = closedIds.size;
      const sol = totalSol;
      setSelectedIds(new Set());
      setTokens((prev) => prev.filter((t) => !closedIds.has(t.id)));
      setSuccessModal({ open: true, count, totalSol: sol, signature: lastSignature });

      const explorerUrl = lastSignature ? EXPLORER_TX_URL(lastSignature) : undefined;
      toast.success(
        `🎉 Swept ${count} accounts, reclaimed ${sol.toFixed(5)} SOL!`,
        explorerUrl
          ? {
              duration: 8000,
              action: {
                label: "View on Solscan",
                onClick: () => window.open(explorerUrl, "_blank"),
              },
            }
          : { duration: 6000 }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[Arsweep] Sweep failed:", { error: err, message: errorMessage });
      toast.error(`Sweep failed: ${errorMessage}`);
    } finally {
      setSweeping(false);
      setSweepProgress(null);
    }
  }, [publicKey, connection, sendTransaction, selectedIds, tokens, totalSol, sweeping]);

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
          <div className="glass rounded-3xl p-12 max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Please Connect Wallet</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Connect your Solana wallet to scan for dust token accounts and reclaim your rent deposits.
            </p>
            <WalletMultiButton className="!bg-primary !text-primary-foreground !rounded-2xl !px-8 !py-4 !text-lg !font-semibold hover:!opacity-90 !transition-opacity !w-full !justify-center" />
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
      <Hero scanning={scanning} scanned={scanned} onScan={handleScan} sweeping={sweeping} />
      <StatsBar
        totalDust={tokens.length}
        potentialRefund={totalSol}
        accountsToClose={selectedIds.size}
      />
      <TokenList
        tokens={tokens}
        selectedIds={selectedIds}
        onToggle={handleToggle}
        onSelectAll={handleSelectAll}
        loading={scanning}
        disabled={sweeping}
      />
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
