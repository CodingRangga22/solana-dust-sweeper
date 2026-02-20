import type { Connection } from "@solana/web3.js";

const CONFIRMATION_TIMEOUT_MS = 30_000;

/**
 * Confirms a transaction with timeout handling.
 * After 30 seconds, onSlowConfirm is called (e.g. to show "Still confirming on network...").
 * The confirmation continues until completion regardless.
 */
export async function confirmTransactionWithTimeout(
  connection: Connection,
  signature: string,
  blockhash: string,
  lastValidBlockHeight: number,
  onSlowConfirm?: () => void
): Promise<void> {
  let slowNotifyFired = false;

  const confirmPromise = connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  const timeout = setTimeout(() => {
    if (!slowNotifyFired) {
      slowNotifyFired = true;
      onSlowConfirm?.();
    }
  }, CONFIRMATION_TIMEOUT_MS);

  try {
    await confirmPromise;
  } finally {
    clearTimeout(timeout);
  }
}
