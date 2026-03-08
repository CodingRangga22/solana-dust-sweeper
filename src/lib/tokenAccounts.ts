import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

// ── Thresholds ────────────────────────────────────────────────────────
const DUST_AMOUNT_THRESHOLD = BigInt(1_000);
const DUST_USD_THRESHOLD_CENTS = 100; // $1.00
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
  hasValueWarning: boolean;
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
      `https://api.dexscreener.com/latest/dex/tokens/${mint}`
    );
    const json = await res.json();
    const price: number = json?.pairs?.[0]?.priceUsd
      ? parseFloat(json.pairs[0].priceUsd)
      : 0;
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
      `https://api.jup.ag/swap/v1/quote?inputMint=${mint}&outputMint=${USDC_MINT}&amount=1000000&slippageBps=5000`,
      { headers: jupiterHeaders() }
    );
    const json = await res.json();
    return !json?.error && !!json?.routePlan?.length;
  } catch {
    return false;
  }
}

// ── Rate limit helper ─────────────────────────────────────────────────
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ── Main fetch function ───────────────────────────────────────────────
export async function fetchAllTokenAccounts(
  connection: Connection,
  owner: PublicKey
): Promise<TokenAccountInfo[]> {
  const [splAccounts, token2022Accounts] = await Promise.all([
    connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    }),
    connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_2022_PROGRAM_ID,
    }),
  ]);

  const allAccounts = [...splAccounts.value, ...token2022Accounts.value];

  const results: TokenAccountInfo[] = [];
  console.log(
    `[Arsweep] Token accounts found — SPL: ${splAccounts.value.length}, Token-2022: ${token2022Accounts.value.length}, Total: ${allAccounts.length}`
  );

  for (const { pubkey, account } of allAccounts) {
    const parsed = account.data.parsed.info;
    const amount = BigInt(parsed.tokenAmount?.amount ?? 0);
    const rentLamports = account.lamports;
    const mintStr = parsed.mint as string;

    const [usdValueCents, hasLiquidityPool] = await Promise.all([
      fetchUsdValueCents(mintStr),
      amount > BigInt(0) ? checkHasLiquidity(mintStr) : Promise.resolve(false),
    ]);

    // ── Eligibility Scoring ──────────────────────────────────────────
    const reasons: EligibilityReason[] = [];

    if (amount === BigInt(0)) reasons.push("zero_balance");
    if (amount > BigInt(0) && amount <= DUST_AMOUNT_THRESHOLD) reasons.push("dust_amount");
    if (!hasLiquidityPool) reasons.push("no_liquidity");
    if (usdValueCents <= DUST_USD_THRESHOLD_CENTS) reasons.push("low_usd_value");

    const lastActivityMs: number | null = null;
    if (lastActivityMs !== null) {
      if (Date.now() - lastActivityMs >= INACTIVITY_MS) reasons.push("inactive");
    }

    const criteriaMetCount = reasons.length;

    // Sweepable jika zero balance ATAU USD <= $1 ATAU 2+ kriteria
    const isSweepable =
      reasons.includes("zero_balance") ||
      usdValueCents <= DUST_USD_THRESHOLD_CENTS ||
      criteriaMetCount >= 2;

    // Warning jika token masih punya balance dan nilai USD > $0
    const hasValueWarning =
      amount > BigInt(0) &&
      usdValueCents > 0 &&
      usdValueCents <= DUST_USD_THRESHOLD_CENTS;
      console.log(`Token ${mintStr}: amount=${amount}, usd=${usdValueCents}, liquidity=${hasLiquidityPool}, reasons=[${reasons.join(',')}], sweepable=${isSweepable}`);

    results.push({
      pubkey,
      mint: new PublicKey(mintStr),
      amount,
      rentLamports,
      isSweepable,
      hasValueWarning,
      eligibilityReasons: reasons,
      usdValueCents,
      hasLiquidityPool,
      lastActivityMs,
      criteriaMetCount,
    });

    await delay(200);
  }

  // Sort: sweepable first, then by rent lamports desc
  return results.sort((a, b) => {
    if (a.isSweepable !== b.isSweepable) return a.isSweepable ? -1 : 1;
    return b.rentLamports - a.rentLamports;
  });
}// rebuild Sun Mar  8 21:11:54 +07 2026
