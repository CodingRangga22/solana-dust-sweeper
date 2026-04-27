import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, createRevokeInstruction } from "@solana/spl-token";
import { toast } from "sonner";
import { ShieldAlert, RefreshCw, Trash2, ExternalLink, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import PremiumFooter from "@/components/PremiumFooter";
import ConnectWalletGate from "@/components/ConnectWalletGate";
import WalletMenu from "@/components/WalletMenu";
import ChangeWalletInstructionModal from "@/components/ChangeWalletInstructionModal";
import RevokeSuccessModal from "@/components/RevokeSuccessModal";
import { useWalletSession } from "@/hooks/useWalletSession";
import { EXPLORER_TX_URL } from "@/config/env";
import { fetchHeliusTokenMetadataBatch } from "@/lib/heliusDas";
import type { TokenMetadata } from "@/lib/tokenAccounts";
import { fetchMaliciousDelegateLabels, isKnownMaliciousDelegate, type MaliciousDelegateLabel } from "@/lib/maliciousDelegates";
import { fetchLastRevoke, logRevoke } from "@/lib/revokeHistory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DelegateApproval = {
  id: string; // tokenAccount base58
  programId: "spl-token" | "token-2022";
  tokenAccount: string;
  mint: string;
  delegate: string;
  delegatedAmountUi: string;
  tokenMeta?: TokenMetadata;
};

function short(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function formatAgo(iso: string): string {
  const ts = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function RevokePage() {
  const { connection } = useConnection();
  const {
    lockedPublicKey,
    sessionActive,
    walletMismatch,
    sendTransaction,
    handleChangeWallet,
    handleDisconnect,
    handleDisconnectAndReconnect,
    showChangeWalletModal,
    setShowChangeWalletModal,
  } = useWalletSession();

  const owner = lockedPublicKey;

  const [loading, setLoading] = useState(false);
  const [approvals, setApprovals] = useState<DelegateApproval[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingSig, setPendingSig] = useState<string | null>(null);
  const [delegateLabels, setDelegateLabels] = useState<Record<string, MaliciousDelegateLabel>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"selected" | "single">("selected");
  const [confirmSingleId, setConfirmSingleId] = useState<string | null>(null);
  const [preferSingleTx, setPreferSingleTx] = useState(true);
  const [lastRevoke, setLastRevoke] = useState<{ at: string; sig: string; count: number } | null>(null);
  const [success, setSuccess] = useState<{ open: boolean; sig: string; count: number } | null>(null);

  const lastScanRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;
    void fetchMaliciousDelegateLabels().then((m) => {
      if (mounted) setDelegateLabels(m);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!owner) return;
    void fetchLastRevoke(owner.toBase58()).then((row) => {
      if (!mounted || !row) return;
      setLastRevoke({ at: row.created_at, sig: row.tx_signature, count: row.approval_count });
    });
    return () => {
      mounted = false;
    };
  }, [owner]);

  const scan = useCallback(async () => {
    if (!owner) return;
    const now = Date.now();
    if (now - lastScanRef.current < 1200) return;
    lastScanRef.current = now;

    setLoading(true);
    try {
      const [spl, t22] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID }),
        connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_2022_PROGRAM_ID }),
      ]);

      const parse = (rows: typeof spl.value, programId: DelegateApproval["programId"]) => {
        const out: DelegateApproval[] = [];
        for (const r of rows) {
          const info: any = (r.account.data as any)?.parsed?.info;
          const delegate: string | undefined = info?.delegate;
          const delegatedAmount = info?.delegatedAmount;
          const mint: string | undefined = info?.mint;
          if (!delegate || !mint || !delegatedAmount) continue;

          // delegatedAmount can be:
          // - { amount: "0", decimals: 6, uiAmountString: "0" }
          // - "0" (rare)
          const ui =
            typeof delegatedAmount === "string"
              ? delegatedAmount
              : delegatedAmount?.uiAmountString ?? delegatedAmount?.amount ?? "0";
          if (!ui || ui === "0" || ui === "0.0" || ui === "0.00") continue;

          const tokenAccount = r.pubkey.toBase58();
          out.push({
            id: tokenAccount,
            programId,
            tokenAccount,
            mint,
            delegate,
            delegatedAmountUi: ui,
          });
        }
        return out;
      };

      const list = [...parse(spl.value, "spl-token"), ...parse(t22.value, "token-2022")];

      // Token metadata (Helius DAS) so users see what token has approvals.
      const metaByMint = await fetchHeliusTokenMetadataBatch(list.map((a) => a.mint));
      const enriched = list.map((a) => ({ ...a, tokenMeta: metaByMint[a.mint] }));

      setApprovals(enriched);
      setSelected(new Set(list.map((a) => a.id)));
      toast.success(`Found ${list.length} delegate approval${list.length === 1 ? "" : "s"}.`);
    } catch (e: any) {
      console.error("[Revoke] Scan failed", e);
      toast.error(e?.message ?? "Failed to scan approvals");
    } finally {
      setLoading(false);
    }
  }, [connection, owner]);

  const grouped = useMemo(() => {
    const m = new Map<string, { delegate: string; approvals: DelegateApproval[] }>();
    for (const a of approvals) {
      const k = a.delegate;
      if (!m.has(k)) m.set(k, { delegate: k, approvals: [] });
      m.get(k)!.approvals.push(a);
    }
    return [...m.values()].sort((a, b) => b.approvals.length - a.approvals.length);
  }, [approvals]);

  const selectedApprovals = useMemo(() => approvals.filter((a) => selected.has(a.id)), [approvals, selected]);

  const selectAll = useCallback(() => {
    if (selected.size === approvals.length) setSelected(new Set());
    else setSelected(new Set(approvals.map((a) => a.id)));
  }, [approvals, selected.size]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const doRevoke = useCallback(async (items: DelegateApproval[], opts?: { forceSingleTx?: boolean }) => {
    if (!owner || !sendTransaction) return;
    if (walletMismatch) {
      toast.error('Wallet mismatch. Click "Change Wallet" first.');
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const forceSingleTx = !!opts?.forceSingleTx;

      // ── Try single transaction (best-effort). If too large, fall back to chunking.
      const trySingle = forceSingleTx || (preferSingleTx && items.length <= 22);
      let lastSig: string | null = null;

      const sendBatch = async (batch: DelegateApproval[]) => {
        const tx = new Transaction();
        for (const a of batch) {
          const tokenAccountPk = new PublicKey(a.tokenAccount);
          const ownerPk = owner;
          const pid = a.programId === "token-2022" ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;
          tx.add(createRevokeInstruction(tokenAccountPk, ownerPk, [], pid));
        }
        const { blockhash } = await connection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = blockhash;
        tx.feePayer = owner;
        const sig = await sendTransaction(tx, connection, { preflightCommitment: "confirmed" });
        setPendingSig(sig);
        await connection.confirmTransaction(sig, "confirmed");
        lastSig = sig;
        // UI cleanup
        const revokedIds = new Set(batch.map((b) => b.id));
        setApprovals((prev) => prev.filter((p) => !revokedIds.has(p.id)));
        setSelected((prev) => {
          const next = new Set(prev);
          for (const id of revokedIds) next.delete(id);
          return next;
        });
        // log to Supabase (optional)
        void logRevoke(owner.toBase58(), batch.length, sig);
        setLastRevoke({ at: new Date().toISOString(), sig, count: batch.length });
        setSuccess({ open: true, sig, count: batch.length });
      };

      if (trySingle) {
        try {
          await sendBatch(items);
          setPendingSig(null);
          toast.success("Revoke complete (single transaction).");
          return;
        } catch (e: any) {
          // fallback for tx-size / compute issues
          const msg = String(e?.message ?? e);
          console.warn("[Revoke] Single-tx revoke failed, falling back.", msg);
        }
      }

      // Fallback chunking (still batched; fewer txs than 1-by-1).
      const BATCH = 10;
      for (let i = 0; i < items.length; i += BATCH) {
        const batch = items.slice(i, i + BATCH);
        await sendBatch(batch);
      }

      setPendingSig(null);
      toast.success("Revoke complete.");
      if (lastSig) toast.message("Last transaction", { description: lastSig });
    } catch (e: any) {
      console.error("[Revoke] Revoke failed", e);
      toast.error(e?.message ?? "Revoke failed");
    } finally {
      setLoading(false);
      setPendingSig(null);
    }
  }, [connection, owner, preferSingleTx, sendTransaction, walletMismatch]);

  const openConfirmSelected = useCallback(() => {
    setConfirmMode("selected");
    setConfirmSingleId(null);
    setConfirmOpen(true);
  }, []);

  const openConfirmSingle = useCallback((id: string) => {
    setConfirmMode("single");
    setConfirmSingleId(id);
    setConfirmOpen(true);
  }, []);

  const confirmItems = useMemo(() => {
    if (confirmMode === "single" && confirmSingleId) {
      return approvals.filter((a) => a.id === confirmSingleId);
    }
    return selectedApprovals;
  }, [approvals, confirmMode, confirmSingleId, selectedApprovals]);

  const shareScanUrl = useMemo(() => {
    const approvalsCount = approvals.length;
    const delegates = new Set(approvals.map((a) => a.delegate)).size;
    const flagged = approvals.filter((a) => isKnownMaliciousDelegate(a.delegate, delegateLabels)).length;
    const wallet = owner ? short(owner.toBase58()) : "my wallet";
    const text = encodeURIComponent(
      `🔐 Just scanned delegate approvals on Solana with Arsweep Revoke.\n\nWallet: ${wallet}\nApprovals: ${approvalsCount}\nDelegates: ${delegates}\nFlagged: ${flagged}\n\nRevoke approvals: arsweep.fun/revoke\n\n#Solana #WalletSecurity @Arsweep_Agent`
    );
    return `https://x.com/intent/tweet?text=${text}`;
  }, [approvals, delegateLabels, owner]);

  const exportJson = useCallback(async () => {
    const payload = {
      wallet: owner?.toBase58() ?? null,
      scannedAt: new Date().toISOString(),
      approvals: approvals.map((a) => ({
        tokenAccount: a.tokenAccount,
        mint: a.mint,
        tokenName: a.tokenMeta?.name ?? null,
        tokenSymbol: a.tokenMeta?.symbol ?? null,
        logoURI: a.tokenMeta?.logoURI ?? null,
        delegate: a.delegate,
        delegatedAmountUi: a.delegatedAmountUi,
        programId: a.programId,
        flagged: !!isKnownMaliciousDelegate(a.delegate, delegateLabels),
      })),
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      toast.success("Copied scan results as JSON");
    } catch {
      toast.error("Failed to copy JSON");
    }
  }, [approvals, delegateLabels, owner]);

  // Gate
  if (!sessionActive) {
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
        helperText="Connect your Solana wallet to scan and revoke delegate approvals."
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden arsweep-bg-ambient bg-background">
      <Header onChangeWallet={handleChangeWallet} onDisconnect={handleDisconnect} walletMismatch={walletMismatch} />

      <main
        className="relative z-[2] pb-24 pt-24"
        style={{
          display: "block",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {/* Hard width guard: prevents min-content collapse in some webviews */}
        <div
          className="mx-auto flex w-full max-w-[1024px] flex-col gap-6"
        >
          <div className="flex w-full flex-col gap-4">
            <div className="w-full min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Security · Delegate approvals
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Revoke Delegate Authority
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Finds SPL Token delegate approvals (token account delegates) that can let a program spend tokens without asking again.
                Revoke the approvals you don’t recognize.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {owner ? `Wallet: ${short(owner.toBase58())}` : "Wallet: —"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {approvals.length} approvals found
                </span>
                {lastRevoke ? (
                  <a
                    href={EXPLORER_TX_URL(lastRevoke.sig)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-muted-foreground hover:text-foreground"
                    title={new Date(lastRevoke.at).toLocaleString()}
                  >
                    Last revoked: {formatAgo(lastRevoke.at)}
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2">
              <button type="button" onClick={() => void scan()} className="ar-btn-secondary" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Scan approvals
              </button>

              <button
                type="button"
                onClick={openConfirmSelected}
                className="ar-btn-primary"
                disabled={loading || selectedApprovals.length === 0}
                title={selectedApprovals.length === 0 ? "Select at least 1 approval" : undefined}
              >
                <Trash2 className="h-4 w-4" />
                Revoke selected ({selectedApprovals.length})
              </button>

              <label className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono text-muted-foreground">
                <input
                  type="checkbox"
                  checked={preferSingleTx}
                  onChange={(e) => setPreferSingleTx(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-muted text-primary focus:ring-primary focus:ring-offset-0"
                />
                Single transaction (best-effort)
              </label>

              <a href={shareScanUrl} target="_blank" rel="noopener noreferrer" className="ar-btn-secondary" title="Share scan summary on X">
                Share scan
              </a>
              <button type="button" onClick={() => void exportJson()} className="ar-btn-secondary" title="Copy scan results as JSON" disabled={approvals.length === 0}>
                Export JSON
              </button>
            </div>
          </div>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm revoke</AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmItems.length === 1 ? (
                    <>
                      You are about to revoke delegate authority for{" "}
                      <span className="font-semibold text-foreground">
                        {confirmItems[0].tokenMeta?.symbol ?? short(confirmItems[0].mint)}
                      </span>{" "}
                      ({confirmItems[0].tokenMeta?.name ?? "token"}). This will remove the approval and may break that dApp’s ability to move tokens.
                    </>
                  ) : (
                    <>
                      You are about to revoke{" "}
                      <span className="font-semibold text-foreground">{confirmItems.length}</span> delegate approval
                      {confirmItems.length === 1 ? "" : "s"}. This will remove permissions from one or more delegate addresses.
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="max-h-56 overflow-auto rounded-lg border border-border bg-muted/30 p-3">
                <div className="space-y-2">
                  {confirmItems.slice(0, 12).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-foreground">
                          {a.tokenMeta?.symbol ?? short(a.mint)} · {short(a.tokenAccount)}
                        </p>
                        <p className="truncate font-mono text-muted-foreground">
                          Delegate: {short(a.delegate)} · Amount: {a.delegatedAmountUi}
                        </p>
                      </div>
                      {isKnownMaliciousDelegate(a.delegate, delegateLabels) ? (
                        <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-red-600 dark:text-red-300">
                          flagged
                        </span>
                      ) : null}
                    </div>
                  ))}
                  {confirmItems.length > 12 ? (
                    <p className="pt-1 text-[11px] text-muted-foreground">+ {confirmItems.length - 12} more…</p>
                  ) : null}
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setConfirmOpen(false);
                    void doRevoke(confirmItems, { forceSingleTx: preferSingleTx });
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Revoke now
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {pendingSig ? (
            <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4 text-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Revoking approvals… transaction pending
                </div>
                <a
                  href={EXPLORER_TX_URL(pendingSig)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground"
                >
                  View on Explorer <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur">
            <div className="flex items-center justify-between gap-3 bg-muted/30 px-4 py-3">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs font-mono text-muted-foreground hover:text-foreground"
                disabled={approvals.length === 0}
              >
                {selected.size === approvals.length && approvals.length > 0 ? "Clear selection" : "Select all"}
              </button>
              <span className="text-xs font-mono text-muted-foreground">
                Showing {approvals.length} approval{approvals.length === 1 ? "" : "s"}
              </span>
            </div>

            {approvals.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-semibold text-foreground">No delegate approvals found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click “Scan approvals”. If you’ve used DEXes, airdrop claimers, or bots before, you may have approvals.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {grouped.map((g) => (
                  <div key={g.delegate} className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-muted-foreground">Delegate</p>
                        <p className="mt-1 truncate font-mono text-sm text-foreground" title={g.delegate}>
                          {g.delegate}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {g.approvals.length} token account approval{g.approvals.length === 1 ? "" : "s"}
                        </p>
                        {(() => {
                          const hit = isKnownMaliciousDelegate(g.delegate, delegateLabels);
                          if (!hit) return null;
                          return (
                            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-300">
                              Known malicious: {hit.label}
                              {hit.source ? <span className="font-mono text-[10px] opacity-70">({hit.source})</span> : null}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2">
                      {g.approvals.map((a) => {
                        const checked = selected.has(a.id);
                        const hit = isKnownMaliciousDelegate(a.delegate, delegateLabels);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggle(a.id)}
                            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                              checked ? "border-foreground/20 bg-muted/40" : "border-border bg-background hover:bg-muted/30"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-3">
                                {a.tokenMeta?.logoURI ? (
                                  <img
                                    src={a.tokenMeta.logoURI}
                                    alt={a.tokenMeta.symbol}
                                    className="h-7 w-7 shrink-0 rounded-full border border-border bg-muted object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="h-7 w-7 shrink-0 rounded-full border border-border bg-muted" />
                                )}
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {a.tokenMeta?.name ?? short(a.mint)}
                                  </p>
                                  <p className="truncate text-xs font-mono text-muted-foreground">
                                    {a.tokenMeta?.symbol ?? short(a.mint)} · Delegated {a.delegatedAmountUi}
                                    {hit ? <span className="ml-2 text-red-600 dark:text-red-300">· flagged</span> : null}
                                  </p>
                                </div>
                              </div>
                              <p className="mt-2 truncate text-xs text-muted-foreground">
                                Mint: <span className="font-mono text-foreground/80">{short(a.mint)}</span> · Account:{" "}
                                <span className="font-mono text-foreground/80">{short(a.tokenAccount)}</span>
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span className="text-xs font-mono text-muted-foreground">{checked ? "Selected" : "Tap to select"}</span>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openConfirmSingle(a.id);
                                }}
                                className="inline-flex items-center rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-mono text-foreground/80 hover:bg-muted"
                                role="button"
                                tabIndex={0}
                              >
                                Revoke
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Blowfish risk scoring (optional)</p>
            <p className="mt-1">
              I can add risk scoring per delegate address, but Blowfish docs are currently access-controlled. If you provide the exact API endpoint + auth
              scheme (or an internal proxy), I’ll wire it in and show a risk badge per delegate.
            </p>
          </div>
        </div>
      </main>

      <ChangeWalletInstructionModal
        open={showChangeWalletModal}
        onOpenChange={setShowChangeWalletModal}
        onDisconnect={handleDisconnectAndReconnect}
      />

      {owner && success ? (
        <RevokeSuccessModal
          open={success.open}
          onOpenChange={(open) => setSuccess((prev) => (prev ? { ...prev, open } : prev))}
          walletAddress={owner.toBase58()}
          approvalsRevoked={success.count}
          signature={success.sig}
        />
      ) : null}

      <PremiumFooter />
    </div>
  );
}

