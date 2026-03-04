import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

// ── Thresholds ────────────────────────────────────────────────────────
const DUST_AMOUNT_THRESHOLD = BigInt(1_000);
const DUST_USD_THRESHOLD_CENTS = 100;
export const INACTIVITY_DAYS = 90;
const INACTIVITY_MS = INACTIVITY_DAYS * 86_400 * 1000;

export type EligibilityReason =
  | "zero_balance"
  | "dust_amount"
  | "no_liquidity"
  | "inactive"
  | "low_usd_value";

export interface TokenAccountInfo {
  pubkey: PublicKey;
  mint: PublicKey;
  amount: bigint;
  rentLamports: number;
  isSweepable: boolean;
  eligibilityReasons: EligibilityReason[];
  usdValueCents: number;
  hasLiquidityPool: boolean;
  lastActivityMs: number | null;
  criteriaMetCount: number;
}

// ── Jupiter Auth Header ───────────────────────────────────────────────
function jupiterHeaders(): Record<string, string> {
  const key = import.meta.env.VITE_JUPITER_API_KEY;
  return key ? { "x-api-key": key } : {};
}

// ── Jupiter Price API v2 ──────────────────────────────────────────────
async function fetchUsdValueCents(mint: string): Promise<number> {
  try {
    const res = await fetch(
      `https://api.jup.ag/price/v2?ids=${mint}`,
      { headers: jupiterHeaders() }
    );
    const json = await res.json();
    const price: number = json?.data?.[mint]?.price ?? 0;
    return Math.floor(price * 100);
  } catch {
    return 0;
  }
}

// ── Jupiter Quote API (liquidity check) ──────────────────────────────
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

async function checkHasLiquidity(mint: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.jup.ag/quote?inputMint=${mint}&outputMint=${USDC_MINT}&amount=1000000&slippageBps=5000`,
      { headers: jupiterHeaders() }
    );
    const json = await res.json();
    return !json?.error && !!json?.routePlan?.length;
  } catch {
    return false;
  }
}

// ── Rate limit helper (Basic = 1 RPS) ────────────────────────────────
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ── Main fetch function ───────────────────────────────────────────────
export async function fetchAllTokenAccounts(
  connection: Connection,
  owner: PublicKey
): Promise<TokenAccountInfo[]> {
  const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  const results: TokenAccountInfo[] = [];

  // ✅ Sequential loop untuk rate limiting (1 RPS)
  for (const { pubkey, account } of accounts.value) {
    const parsed = account.data.parsed.info;
    const amount = BigInt(parsed.tokenAmount?.amount ?? 0);
    const rentLamports = account.lamports;
    const mintStr = parsed.mint as string;

    // Parallel fetch price + liquidity untuk token yang sama (OK dalam 1 RPS window)
    const [usdValueCents, hasLiquidityPool] = await Promise.all([
      fetchUsdValueCents(mintStr),
      amount > BigInt(0) ? checkHasLiquidity(mintStr) : Promise.resolve(false),
    ]);

    // ── Eligibility Scoring ──────────────────────────────────────────
    const reasons: EligibilityReason[] = [];

    if (amount === BigInt(0)) reasons.push("zero_balance");
    if (amount > BigInt(0) && amount <= DUST_AMOUNT_THRESHOLD) reasons.push("dust_amount");
    if (!hasLiquidityPool) reasons.push("no_liquidity");
    if (usdValueCents < DUST_USD_THRESHOLD_CENTS) reasons.push("low_usd_value");

    const lastActivityMs: number | null = null;
    if (lastActivityMs !== null) {
      if (Date.now() - lastActivityMs >= INACTIVITY_MS) reasons.push("inactive");
    }

    const criteriaMetCount = reasons.length;
    const isSweepable =
      reasons.includes("zero_balance") || criteriaMetCount >= 2;

    results.push({
      pubkey,
      mint: new PublicKey(mintStr),
      amount,
      rentLamports,
      isSweepable,
      eligibilityReasons: reasons,
      usdValueCents,
      hasLiquidityPool,
      lastActivityMs,
      criteriaMetCount,
    });

    // ✅ 200ms delay antar token untuk respect 1 RPS limit
    await delay(200);
  }

  // Sort: sweepable first, then by rent lamports desc
  return results.sort((a, b) => {
    if (a.isSweepable !== b.isSweepable) return a.isSweepable ? -1 : 1;
    return b.rentLamports - a.rentLamports;
  });
}