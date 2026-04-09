import { Connection, PublicKey } from '@solana/web3.js';

/** USDC (legacy SPL) mint — Solana mainnet (sama dengan pembayaran x402 produksi). */
export const USDC_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

/** RPC mainnet untuk cek saldo premium (terpisah dari cluster devnet app jika perlu). */
export function getPremiumMainnetConnection(): Connection {
  const url =
    import.meta.env.VITE_HELIUS_RPC_URL?.trim() ||
    import.meta.env.VITE_RPC_ENDPOINT?.trim() ||
    import.meta.env.NEXT_PUBLIC_RPC_URL?.trim() ||
    'https://api.mainnet-beta.solana.com';
  return new Connection(url, 'confirmed');
}

/** Total USDC (human, 6 decimals) untuk mint tertentu. */
export async function getUsdcLikeUiAmount(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
): Promise<number> {
  const resp = await connection.getParsedTokenAccountsByOwner(owner, { mint });
  let raw = 0n;
  const mintStr = mint.toBase58();
  for (const { account } of resp.value) {
    const data = account.data;
    if (!('parsed' in data)) continue;
    const info = data.parsed.info as { mint?: string; tokenAmount?: { amount?: string } };
    if (info.mint !== mintStr) continue;
    const amt = info.tokenAmount?.amount;
    if (amt) raw += BigInt(amt);
  }
  return Number(raw) / 1e6;
}

export async function getMainnetUsdcUiAmount(connection: Connection, owner: PublicKey): Promise<number> {
  return getUsdcLikeUiAmount(connection, owner, USDC_MINT_MAINNET);
}

export async function getSolBalanceLamports(connection: Connection, owner: PublicKey): Promise<number> {
  return connection.getBalance(owner, 'confirmed');
}

/** Cadangan biaya transaksi (lamports) di mainnet sebelum user menandatangani pembayaran USDC. */
export const PREMIUM_MIN_SOL_LAMPORTS = 50_000;
