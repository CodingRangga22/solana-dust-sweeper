import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from "@solana/spl-token";

export const TREASURY = new PublicKey("J7ApX8Y3vp6WcsGD99kyTTQyLuxxhsT8zBfNTqcFW9qi");
const FEE_BPS = 150;

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

export async function executeSweepNative(
  connection: Connection,
  wallet: {
    publicKey: PublicKey;
    sendTransaction: (tx: Transaction, connection: Connection, options?: any) => Promise<string>;
  },
  accounts: Array<{ pubkey: PublicKey; rentLamports: number }>,
  onProgress?: (progress: SweepProgress) => void,
  batchSize = 10
): Promise<SweepBatchResult[]> {
  const results: SweepBatchResult[] = [];
  const batches: Array<typeof accounts> = [];

  for (let i = 0; i < accounts.length; i += batchSize) {
    batches.push(accounts.slice(i, i + batchSize));
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    onProgress?.({ currentBatch: i + 1, totalBatches: batches.length });

    const tx = new Transaction();
    let totalRent = 0;

    for (const acc of batch) {
      tx.add(
        createCloseAccountInstruction(
          acc.pubkey,
          wallet.publicKey,
          wallet.publicKey,
          [],
          TOKEN_PROGRAM_ID
        )
      );
      totalRent += acc.rentLamports;
    }

    const fee = Math.floor(totalRent * FEE_BPS / 10000);
    if (fee > 0) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: TREASURY,
          lamports: fee,
        })
      );
    }

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
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
        if (
          status?.value?.confirmationStatus === "confirmed" ||
          status?.value?.confirmationStatus === "finalized"
        ) {
          confirmed = true;
        } else if (Date.now() - start > 20000) {
          onProgress?.({ currentBatch: i + 1, totalBatches: batches.length, confirmingSlow: true });
        }
      } catch {}
      if (!confirmed) await new Promise((r) => setTimeout(r, 2000));
    }

    if (!confirmed) throw new Error(`Batch ${i + 1} confirmation timeout`);

    results.push({ signature, accountsClosed: batch.length, rentReclaimed: totalRent });
  }

  return results;
}
