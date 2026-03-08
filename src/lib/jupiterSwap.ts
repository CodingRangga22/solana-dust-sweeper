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
}

export async function getSwapQuote(
  mintAddress: string,
  amount: bigint,
): Promise<SwapQuote | null> {
  if (amount <= BigInt(0)) return null;

  try {
    const res = await fetch(
      `https://api.jup.ag/swap/v1/quote?inputMint=${mintAddress}&outputMint=${SOL_MINT}&amount=${amount.toString()}&slippageBps=100`,
      { headers: jupiterHeaders() },
    );
    const json = await res.json();
    if (json?.error || !json?.outAmount) return null;

    return {
      inputMint: mintAddress,
      outputMint: SOL_MINT,
      inAmount: json.inAmount,
      outAmount: json.outAmount,
      outAmountSol: Number(json.outAmount) / 1e9,
      priceImpactPct: parseFloat(json.priceImpactPct ?? "0"),
      routePlan: json.routePlan ?? [],
    };
  } catch {
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
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: "auto",
      }),
    });
    const json = await res.json();
    return json?.swapTransaction ?? null;
  } catch {
    return null;
  }
}
