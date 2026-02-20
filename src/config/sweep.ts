/**
 * Sweep/batching configuration for MVP production readiness.
 * Limits transaction size to avoid compute and serialization failures.
 */

/** Max accounts per transaction. Solana tx size ~1232 bytes; each CloseAccount adds ~100+ bytes. */
export const ACCOUNTS_PER_TX = 10;

/** Rent lamports per standard SPL token account (~0.00203928 SOL) */
export const RENT_LAMPORTS_PER_ACCOUNT = 2_039_280;
