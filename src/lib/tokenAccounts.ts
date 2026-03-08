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

function computeTotalUsdCents(
  pricePerToken: number,
  rawAmount: bigint,
  decimals: number,
): number {
  if (pricePerToken === 0 || rawAmount === BigInt(0)) return 0;
  const humanAmount = Number(rawAmount) / Math.pow(10, decimals);
  return Math.floor(humanAmount * pricePerToken * 100);
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

// ── Token Metadata (Jupiter Token API) ────────────────────────────────
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
    const res = await fetch(`https://tokens.jup.ag/token/${mint}`);
    if (!res.ok) {
      metadataCache.set(mint, fallback);
      return fallback;
    }
    const json = await res.json();
    const meta: TokenMetadata = {
      name: json?.name || fallback.name,
      symbol: json?.symbol || fallback.symbol,
      logoURI: json?.logoURI || null,
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
      amount > BigInt(0) ? checkHasLiquidity(mintStr) : Promise.resolve(false),
      fetchTokenMetadata(mintStr),
      fetchMintFlags(connection, mintStr),
    ]);

    const usdValueCents = computeTotalUsdCents(pricePerToken, amount, decimals);

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

    const isSweepable =
      reasons.includes("zero_balance") ||
      usdValueCents <= DUST_USD_THRESHOLD_CENTS ||
      criteriaMetCount >= 2;

    const hasValueWarning =
      amount > BigInt(0) &&
      usdValueCents > 0 &&
      usdValueCents <= DUST_USD_THRESHOLD_CENTS;

    const humanAmount = Number(amount) / Math.pow(10, decimals);
    const scamFlags = [
      mintFlags.freezeAuthority ? "FREEZABLE" : "",
      mintFlags.mintAuthority ? "MINTABLE" : "",
    ].filter(Boolean).join(", ");
    console.log(
      `[Arsweep] ${metadata.symbol} (${mintStr.slice(0,8)}...): raw=${amount}, decimals=${decimals}, human=${humanAmount.toFixed(decimals)}, price=$${pricePerToken}, totalUsd=$${(usdValueCents/100).toFixed(2)}, liquidity=${hasLiquidityPool}, sweepable=${isSweepable}${scamFlags ? `, flags=[${scamFlags}]` : ""}`
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
