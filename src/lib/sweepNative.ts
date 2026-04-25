import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import {
  createCloseAccountInstruction,
  createBurnInstruction,
} from "@solana/spl-token";

const DEFAULT_TREASURY = "BfqfpTe6yv5TTTGrcNVRPVfQ3h6FwzhC78LGbGAN5NkT";
const treasuryFromEnv = (import.meta.env.VITE_TREASURY_ADDRESS ?? "").toString().trim();

export const TREASURY = (() => {
  const candidate = treasuryFromEnv || DEFAULT_TREASURY;
  try {
    return new PublicKey(candidate);
  } catch {
    // Fail loudly in dev to avoid silently sending fees somewhere unexpected.
    if ((import.meta.env.DEV ?? false) === true) {
      throw new Error(
        `Invalid VITE_TREASURY_ADDRESS: "${candidate}". Please set a valid base58 public key.`,
      );
    }
    return new PublicKey(DEFAULT_TREASURY);
  }
})();

const FEE_BPS = 150;
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export interface SweepAccount {
  pubkey: PublicKey;
  mint: PublicKey;
  programId: PublicKey;
  amount: bigint;
  rentLamports: number;
  hasLiquidityPool: boolean;
  usdValueCents: number;
}

export interface SweepBatchResult {
  signature: string;
  accountsClosed: number;
  rentReclaimed: number;
}

export interface SweepProgress {
  currentBatch: number;
  totalBatches: number;
  confirmingSlow?: boolean;
}

/**
 * Burns and closes token accounts that are confirmed worthless.
 *
 * 3-LAYER PROTECTION enforced here:
 *   1. liquidity > 0  → BLOCK (throw)
 *   2. price/value > 0 → BLOCK (throw)
 *   3. Burn allowed ONLY when value == 0 AND liquidity == 0
 */
export async function executeSweepNative(
  connection: Connection,
  wallet: {
    publicKey: PublicKey;
    sendTransaction: (tx: Transaction, connection: Connection, options?: any) => Promise<string>;
  },
  accounts: SweepAccount[],
  onProgress?: (progress: SweepProgress) => void,
  batchSize = 7,
): Promise<SweepBatchResult[]> {
  const results: SweepBatchResult[] = [];
  const batches: SweepAccount[][] = [];

  for (let i = 0; i < accounts.length; i += batchSize) {
    batches.push(accounts.slice(i, i + batchSize));
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    onProgress?.({ currentBatch: i + 1, totalBatches: batches.length });

    const tx = new Transaction();
    let totalRent = 0;

    for (const acc of batch) {
      if (acc.amount > BigInt(0)) {
        // ── Protection 1: liquidity > 0 → BLOCK ──
        if (acc.hasLiquidityPool) {
          throw new Error(
            `PROTECTION 1: ${acc.mint.toBase58()} has active liquidity pool. Cannot burn. Use swap instead.`
          );
        }

        // ── Protection 2: value > 0 → BLOCK ──
        if (acc.usdValueCents > 0) {
          throw new Error(
            `PROTECTION 2: ${acc.mint.toBase58()} has USD value ($${(acc.usdValueCents / 100).toFixed(2)}). Cannot burn. Try swap first.`
          );
        }

        // ── Burn allowed: value == 0 AND liquidity == 0 ──
        console.log(
          `[Arsweep] BURN APPROVED: ${acc.mint.toBase58()} — value=$0, liquidity=none`
        );
        tx.add(
          createBurnInstruction(
            acc.pubkey,
            acc.mint,
            wallet.publicKey,
            acc.amount,
            [],
            acc.programId,
          )
        );
      }

      tx.add(
        createCloseAccountInstruction(
          acc.pubkey,
          wallet.publicKey,
          wallet.publicKey,
          [],
          acc.programId,
        )
      );
      totalRent += acc.rentLamports;
    }

    const fee = Math.floor(totalRent * FEE_BPS / 10000);
    if (fee > 0) {
      tx.add(
        new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(`Arsweep service fee: ${fee} lamports (1.5%)`),
        })
      );
      tx.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: TREASURY,
          lamports: fee,
        })
      );
    }

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = wallet.publicKey;

    const signature = await wallet.sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    let confirmed = false;
    const start = Date.now();
    while (!confirmed && Date.now() - start < 60000) {
      try {
        const status = await connection.getSignatureStatus(signature);
        if (status?.value?.err) {
          console.error(`[Arsweep] Batch ${i + 1} tx error:`, status.value.err);
          throw new Error(
            `Transaction failed on-chain: ${JSON.stringify(status.value.err)}`
          );
        }
        if (
          status?.value?.confirmationStatus === "confirmed" ||
          status?.value?.confirmationStatus === "finalized"
        ) {
          confirmed = true;
        } else if (Date.now() - start > 20000) {
          onProgress?.({ currentBatch: i + 1, totalBatches: batches.length, confirmingSlow: true });
        }
      } catch (err: any) {
        if (err?.message?.startsWith("Transaction failed") ||
            err?.message?.startsWith("PROTECTION")) throw err;
      }
      if (!confirmed) await new Promise((r) => setTimeout(r, 2000));
    }

    if (!confirmed) throw new Error(`Batch ${i + 1} confirmation timeout`);

    results.push({ signature, accountsClosed: batch.length, rentReclaimed: totalRent });
  }

  return results;
}
