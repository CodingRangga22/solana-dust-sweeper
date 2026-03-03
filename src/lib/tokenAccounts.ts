import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

// ── Thresholds (mirror on-chain constants) ────────────────────────────
const DUST_AMOUNT_THRESHOLD = BigInt(1_000);      // raw token units
const DUST_USD_THRESHOLD_CENTS = 100;              // $1.00
export const INACTIVITY_DAYS = 90;                 // days (used in UI labels)
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
  // ── NEW ──
  eligibilityReasons: EligibilityReason[];
  usdValueCents: number;        // from Jupiter price API
  hasLiquidityPool: boolean;    // from Jupiter quote API
  lastActivityMs: number | null; // null = no PDA activity record yet
  criteriaMetCount: number;     // how many of 4 criteria passed
}

// ── Jupiter Price API ─────────────────────────────────────────────────
async function fetchUsdValueCents(mint: string): Promise<number> {
  try {
    const res = await fetch(
      `https://price.jup.ag/v6/price?ids=${mint}`
    );
    const json = await res.json();
    const price: number = json?.data?.[mint]?.price ?? 0;
    return Math.floor(price * 100); // convert to cents
  } catch {
    return 0; // treat as $0 if fetch fails
  }
}

// ── Jupiter Quote API (liquidity check) ──────────────────────────────
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

async function checkHasLiquidity(mint: string): Promise<boolean> {
  // Skip check for known no-value tokens (amount = 0)
  try {
    const res = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${mint}&outputMint=${USDC_MINT}&amount=1000000&slippageBps=5000`
    );
    const json = await res.json();
    // If Jupiter returns a valid route, token has liquidity
    return !json?.error && !!json?.routePlan?.length;
  } catch {
    return false;
  }
}

// ── Main fetch function ───────────────────────────────────────────────
export async function fetchAllTokenAccounts(
  connection: Connection,
  owner: PublicKey
): Promise<TokenAccountInfo[]> {
  const accounts = await connection.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  // Batch all async calls in parallel for performance
  const results = await Promise.all(
    accounts.value.map(async ({ pubkey, account }) => {
      const parsed = account.data.parsed.info;
      const amount = BigInt(parsed.tokenAmount?.amount ?? 0);
      const rentLamports = account.lamports;
      const mintStr = parsed.mint as string;

      // ── Parallel: fetch price + liquidity ──────────────────────────
      const [usdValueCents, hasLiquidityPool] = await Promise.all([
        fetchUsdValueCents(mintStr),
        // Only check liquidity if amount > 0 (no point for empty accounts)
        amount > BigInt(0) ? checkHasLiquidity(mintStr) : Promise.resolve(false),
      ]);

      // ── Eligibility Scoring ────────────────────────────────────────
      const reasons: EligibilityReason[] = [];

      // Criteria 1: zero balance (strongest signal)
      if (amount === BigInt(0)) {
        reasons.push("zero_balance");
      }

      // Criteria 2: dust amount (very small but non-zero)
      if (amount > BigInt(0) && amount <= DUST_AMOUNT_THRESHOLD) {
        reasons.push("dust_amount");
      }

      // Criteria 3: no liquidity pool
      if (!hasLiquidityPool) {
        reasons.push("no_liquidity");
      }

      // Criteria 4: low USD value
      if (usdValueCents < DUST_USD_THRESHOLD_CENTS) {
        reasons.push("low_usd_value");
      }

      // Criteria 5: inactivity (placeholder — needs PDA data)
      // Will be populated after registerActivity ix is added
      const lastActivityMs: number | null = null;
      if (lastActivityMs !== null) {
        const inactiveMs = Date.now() - lastActivityMs;
        if (inactiveMs >= INACTIVITY_MS) reasons.push("inactive");
      }

      const criteriaMetCount = reasons.length;

      // ── Final Sweepable Decision ───────────────────────────────────
      // Must meet AT LEAST 2 criteria (mirrors on-chain logic)
      // Exception: zero_balance alone = always sweepable (safe, no value lost)
      const isSweepable =
        reasons.includes("zero_balance") ||
        criteriaMetCount >= 2;

      return {
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
      };
    })
  );

  // Sort: sweepable first, then by rent lamports desc
  return results.sort((a, b) => {
    if (a.isSweepable !== b.isSweepable) return a.isSweepable ? -1 : 1;
    return b.rentLamports - a.rentLamports;
  });
}