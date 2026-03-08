// src/lib/sweepNative.ts
// Native SPL Token closeAccount — tidak butuh custom program
// Works on mainnet tanpa deploy, Phantom tidak blokir

import {
    Connection,
    PublicKey,
    Transaction,
    TransactionInstruction,
    SystemProgram,
  } from "@solana/web3.js";
  import {
    TOKEN_PROGRAM_ID,
    createCloseAccountInstruction,
  } from "@solana/spl-token";
  
  export const TREASURY = new PublicKey(
    "J7ApX8Y3vp6WcsGD99kyTTQyLuxxhsT8zBfNTqcFW9qi"
  );
  
  // Fee 1.5% ke treasury
  const FEE_BPS = 150; // 1.5%
  
  export interface SweepBatchResult {
    signature: string;
    accountsClosed: number;
    rentReclaimed: number; // lamports
  }
  
  export interface SweepProgress {
    currentBatch: number;
    totalBatches: number;
    confirmingSlow?: boolean;
  }
  
  // ── Build close transaction untuk satu batch ──────────────────────────
  export function buildCloseTransaction(
    accounts: Array<{ pubkey: PublicKey; rentLamports: number }>,
    owner: PublicKey,
    feePayer: PublicKey
  ): { tx: Transaction; totalRent: number; fee: number } {
    const tx = new Transaction();
    let totalRent = 0;
  
    for (const acc of accounts) {
      // Close token account → rent kembali ke owner
      tx.add(
        createCloseAccountInstruction(
          acc.pubkey,  // account to close
          owner,       // destination (rent goes here)
          owner,       // authority
          [],          // multisig signers
          TOKEN_PROGRAM_ID
        )
      );
      totalRent += acc.rentLamports;
    }
  
    // Transfer fee ke treasury
    const fee = Math.floor(totalRent * FEE_BPS / 10000);
    if (fee > 0) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: owner,
          toPubkey: TREASURY,
          lamports: fee,
        })
      );
    }
  
    return { tx, totalRent, fee };
  }
  
  // ── Execute sweep dengan batching ─────────────────────────────────────
  export async function executeSweepNative(
    connection: Connection,
    wallet: {
      publicKey: PublicKey;
      signTransaction: (tx: Transaction) => Promise<Transaction>;
    },
    accounts: Array<{ pubkey: PublicKey; rentLamports: number }>,
    onProgress?: (progress: SweepProgress) => void,
    batchSize = 10
  ): Promise<SweepBatchResult[]> {
    const results: SweepBatchResult[] = [];
    const batches: Array<typeof accounts> = [];
  
    // Split ke batches
    for (let i = 0; i < accounts.length; i += batchSize) {
      batches.push(accounts.slice(i, i + batchSize));
    }
  
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
  
      onProgress?.({
        currentBatch: i + 1,
        totalBatches: batches.length,
      });
  
      const { tx, totalRent } = buildCloseTransaction(
        batch,
        wallet.publicKey,
        wallet.publicKey
      );
  
      // Get fresh blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");
      tx.recentBlockhash = blockhash;
      tx.feePayer = wallet.publicKey;
  
      // Sign
      const signed = await wallet.signTransaction(tx);
  
      // Send
      const signature = await connection.sendRawTransaction(
        signed.serialize(),
        { skipPreflight: false, preflightCommitment: "confirmed" }
      );
  
      // Confirm dengan timeout
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
            onProgress?.({
              currentBatch: i + 1,
              totalBatches: batches.length,
              confirmingSlow: true,
            });
          }
        } catch {}
        if (!confirmed) await new Promise((r) => setTimeout(r, 2000));
      }
  
      if (!confirmed) {
        throw new Error(`Batch ${i + 1} confirmation timeout`);
      }
  
      results.push({
        signature,
        accountsClosed: batch.length,
        rentReclaimed: totalRent,
      });
    }
  
    return results;
  }