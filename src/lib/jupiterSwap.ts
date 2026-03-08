const SOL_MINT = "So11111111111111111111111111111111111111112";

function jupiterHeaders(): Record<string, string> {
  const key = import.meta.env.VITE_JUPITER_API_KEY;
  return key ? { "x-api-key": key } : {};
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  outAmountSol: number;
  priceImpactPct: number;
  routePlan: unknown[];
  /** Full raw response from Jupiter — required by the /swap endpoint */
  _raw: Record<string, unknown>;
}

export async function getSwapQuote(
  mintAddress: string,
  amount: bigint,
): Promise<SwapQuote | null> {
  if (amount <= BigInt(0)) return null;

  try {
    const res = await fetch(
      `https://api.jup.ag/swap/v1/quote?inputMint=${mintAddress}&outputMint=${SOL_MINT}&amount=${amount.toString()}&slippageBps=300&restrictIntermediateTokens=true`,
      { headers: jupiterHeaders() },
    );

    if (!res.ok) {
      console.warn(`[Jupiter] Quote ${res.status} for ${mintAddress}`);
      return null;
    }

    const json = await res.json();
    if (json?.error || !json?.outAmount) return null;

    const outAmountNum = Number(json.outAmount);
    if (!outAmountNum || outAmountNum <= 0) return null;
    if (!json.routePlan?.length) return null;

    return {
      inputMint: mintAddress,
      outputMint: SOL_MINT,
      inAmount: json.inAmount,
      outAmount: json.outAmount,
      outAmountSol: outAmountNum / 1e9,
      priceImpactPct: parseFloat(json.priceImpactPct ?? "0"),
      routePlan: json.routePlan,
      _raw: json,
    };
  } catch (err) {
    console.warn(`[Jupiter] Quote error for ${mintAddress}:`, err);
    return null;
  }
}

export async function getSwapTransaction(
  quote: SwapQuote,
  userPublicKey: string,
): Promise<string | null> {
  try {
    const res = await fetch("https://api.jup.ag/swap/v1/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...jupiterHeaders(),
      },
      body: JSON.stringify({
        quoteResponse: quote._raw,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`[Jupiter] Swap tx ${res.status}: ${errorBody}`);
      return null;
    }

    const json = await res.json();
    return json?.swapTransaction ?? null;
  } catch (err) {
    console.error("[Jupiter] Swap tx error:", err);
    return null;
  }
}
