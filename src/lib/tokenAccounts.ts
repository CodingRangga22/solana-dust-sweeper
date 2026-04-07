import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { NETWORK } from "@/config/env";

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

export interface TokenMetadata {
  name: string;
  symbol: string;
  logoURI: string | null;
}

export interface MintFlags {
  freezeAuthority: string | null;
  mintAuthority: string | null;
}

export interface TokenAccountInfo {
  pubkey: PublicKey;
  mint: PublicKey;
  programId: PublicKey;
  amount: bigint;
  decimals: number;
  rentLamports: number;
  isSweepable: boolean;
  hasValueWarning: boolean;
  eligibilityReasons: EligibilityReason[];
  usdValueCents: number;
  hasLiquidityPool: boolean;
  lastActivityMs: number | null;
  criteriaMetCount: number;
  metadata: TokenMetadata;
  mintFlags: MintFlags;
}

// ── Jupiter Auth Header ───────────────────────────────────────────────
function jupiterHeaders(): Record<string, string> {
  const key = import.meta.env.VITE_JUPITER_API_KEY;
  return key ? { "x-api-key": key } : {};
}

// ── Token Price (Dexscreener) ─────────────────────────────────────────
async function fetchTokenPriceUsd(mint: string): Promise<number> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mint}`
    );
    const json = await res.json();
    return json?.pairs?.[0]?.priceUsd
      ? parseFloat(json.pairs[0].priceUsd)
      : 0;
  } catch {
    return 0;
  }
}

function pow10BigInt(exp: number): bigint {
  if (exp <= 0) return BigInt(1);
  // Prevent absurd exponent causing runaway memory/time.
  const safeExp = Math.min(exp, 30);
  return BigInt("1" + "0".repeat(safeExp));
}

function computeTotalUsdCents(
  pricePerToken: number,
  rawAmount: bigint,
  decimals: number,
): number {
  if (!Number.isFinite(pricePerToken) || pricePerToken <= 0) return 0;
  if (rawAmount <= BigInt(0)) return 0;

  // Convert price to fixed-point micro-dollars to keep bigint math stable.
  const priceMicros = BigInt(Math.floor(pricePerToken * 1_000_000));
  if (priceMicros <= BigInt(0)) return 0;

  const denom = pow10BigInt(decimals) * BigInt(1_000_000);
  const cents = (rawAmount * priceMicros * BigInt(100)) / denom;

  // Clamp to safe JS number range for downstream UI (protect against overflow).
  const maxSafe = BigInt(Number.MAX_SAFE_INTEGER);
  if (cents > maxSafe) return Number.MAX_SAFE_INTEGER;
  return Number(cents);
}

// ── Jupiter Quote API (liquidity check) ──────────────────────────────
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

async function checkHasLiquidity(mint: string, decimals: number): Promise<boolean> {
  try {
    // Jupiter "amount" is in input-mint base units, so we must respect decimals.
    const oneTokenBaseUnits = pow10BigInt(Math.max(0, decimals));

    // Try a few increasing amounts (some routes require minimum trade size).
    const attempts = [
      oneTokenBaseUnits,
      oneTokenBaseUnits * BigInt(10),
      oneTokenBaseUnits * BigInt(100),
    ].map((a) => (a > BigInt("1000000000000") ? BigInt("1000000000000") : a)); // cap at 1e12

    for (const amt of attempts) {
      const res = await fetch(
        `https://api.jup.ag/swap/v1/quote?inputMint=${mint}&outputMint=${USDC_MINT}&amount=${amt.toString()}&slippageBps=5000`,
        { headers: jupiterHeaders() }
      );
      const json = await res.json();
      if (!json?.error && !!json?.routePlan?.length) return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ── Token Metadata (Helius DAS API) ──────────────────────────────────
const metadataCache = new Map<string, TokenMetadata>();

async function fetchTokenMetadata(mint: string): Promise<TokenMetadata> {
  const cached = metadataCache.get(mint);
  if (cached) return cached;

  const fallback: TokenMetadata = {
    name: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
    symbol: mint.slice(0, 6),
    logoURI: null,
  };

  try {
    const apiKey =
      import.meta.env.VITE_HELIUS_API_KEY ??
      import.meta.env.VITE_HELIUS_RPC_URL?.split("api-key=")[1] ??
      "";
    const heliusCluster = NETWORK === "devnet" ? "devnet" : "mainnet";
    const res = await fetch(
      `https://${heliusCluster}.helius-rpc.com/?api-key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "getAsset",
          params: { id: mint },
        }),
      },
    );
    const json = await res.json();
    const result = json?.result;
    const metadata = result?.content?.metadata;
    const links = result?.content?.links;
    const meta: TokenMetadata = {
      name: metadata?.name || fallback.name,
      symbol: metadata?.symbol || fallback.symbol,
      logoURI: links?.image || null,
    };
    metadataCache.set(mint, meta);
    return meta;
  } catch {
    metadataCache.set(mint, fallback);
    return fallback;
  }
}

// ── Mint Flags (freeze/mint authority) ────────────────────────────────
async function fetchMintFlags(
  connection: Connection,
  mintAddress: string,
): Promise<MintFlags> {
  const fallback: MintFlags = { freezeAuthority: null, mintAuthority: null };
  try {
    const info = await connection.getParsedAccountInfo(new PublicKey(mintAddress));
    const data = (info?.value?.data as any)?.parsed?.info;
    if (!data) return fallback;
    return {
      freezeAuthority: data.freezeAuthority ?? null,
      mintAuthority: data.mintAuthority ?? null,
    };
  } catch {
    return fallback;
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

  const taggedSpl = splAccounts.value.map((a) => ({ ...a, tokenProgramId: TOKEN_PROGRAM_ID }));
  const tagged2022 = token2022Accounts.value.map((a) => ({ ...a, tokenProgramId: TOKEN_2022_PROGRAM_ID }));
  const allAccounts = [...taggedSpl, ...tagged2022];

  const results: TokenAccountInfo[] = [];
  console.log(
    `[Arsweep] Token accounts found — SPL: ${splAccounts.value.length}, Token-2022: ${token2022Accounts.value.length}, Total: ${allAccounts.length}`
  );

  for (const { pubkey, account, tokenProgramId } of allAccounts) {
    const parsed = account.data.parsed.info;
    const amount = BigInt(parsed.tokenAmount?.amount ?? 0);
    const decimals: number = parsed.tokenAmount?.decimals ?? 0;
    const rentLamports = account.lamports;
    const mintStr = parsed.mint as string;

    const [pricePerToken, hasLiquidityPool, metadata, mintFlags] = await Promise.all([
      fetchTokenPriceUsd(mintStr),
      amount > BigInt(0) ? checkHasLiquidity(mintStr, decimals) : Promise.resolve(false),
      fetchTokenMetadata(mintStr),
      fetchMintFlags(connection, mintStr),
    ]);

    const usdValueCents = computeTotalUsdCents(pricePerToken, amount, decimals);

    // ── Eligibility Scoring ──────────────────────────────────────────
    const reasons: EligibilityReason[] = [];

    if (amount === BigInt(0)) reasons.push("zero_balance");
    if (amount > BigInt(0) && amount <= DUST_AMOUNT_THRESHOLD) reasons.push("dust_amount");
    if (amount > BigInt(0) && !hasLiquidityPool) reasons.push("no_liquidity");
    if (usdValueCents <= DUST_USD_THRESHOLD_CENTS) reasons.push("low_usd_value");

    const lastActivityMs: number | null = null;
    if (lastActivityMs !== null) {
      if (Date.now() - lastActivityMs >= INACTIVITY_MS) reasons.push("inactive");
    }

    const criteriaMetCount = reasons.length;

    const isSweepable =
      reasons.includes("zero_balance") ||
      usdValueCents <= DUST_USD_THRESHOLD_CENTS ||
      criteriaMetCount >= 2;

    const hasValueWarning =
      amount > BigInt(0) &&
      usdValueCents > 0 &&
      usdValueCents <= DUST_USD_THRESHOLD_CENTS;

    // Avoid Number(bigint) overflow in logs; keep it readable.
    const humanAmountApprox =
      amount > BigInt("9007199254740991000000") ? ">=9e21" : (Number(amount) / Math.pow(10, decimals)).toString();
    const scamFlags = [
      mintFlags.freezeAuthority ? "FREEZABLE" : "",
      mintFlags.mintAuthority ? "MINTABLE" : "",
    ].filter(Boolean).join(", ");
    console.log(
      `[Arsweep] ${metadata.symbol} (${mintStr.slice(0,8)}...): raw=${amount}, decimals=${decimals}, human≈${humanAmountApprox}, price=$${pricePerToken}, totalUsd=$${(usdValueCents/100).toFixed(2)}, liquidity=${hasLiquidityPool}, sweepable=${isSweepable}${scamFlags ? `, flags=[${scamFlags}]` : ""}`
    );

    results.push({
      pubkey,
      mint: new PublicKey(mintStr),
      programId: tokenProgramId,
      amount,
      decimals,
      rentLamports,
      isSweepable,
      hasValueWarning,
      eligibilityReasons: reasons,
      usdValueCents,
      hasLiquidityPool,
      lastActivityMs,
      criteriaMetCount,
      metadata,
      mintFlags,
    });

    await delay(200);
  }

  // Sort: sweepable first, then by rent lamports desc
  return results.sort((a, b) => {
    if (a.isSweepable !== b.isSweepable) return a.isSweepable ? -1 : 1;
    return b.rentLamports - a.rentLamports;
  });
}// rebuild Sun Mar  8 21:11:54 +07 2026
