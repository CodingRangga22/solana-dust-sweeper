export type IntegrationMarqueeItem = {
  label: string;
  sublabel?: string;
};

/**
 * Keep this list STRICTLY to integrations that are actually wired in the codebase.
 * (So the bottom dock never claims support prematurely.)
 */
export const INTEGRATION_MARQUEE_ITEMS: IntegrationMarqueeItem[] = [
  { label: "Solana", sublabel: "SVM" },
  { label: "Privy", sublabel: "Auth" },
  { label: "Helius", sublabel: "RPC" },
  { label: "Jupiter", sublabel: "Swap" },
  { label: "x402", sublabel: "Payments" },
  { label: "Pay AI", sublabel: "Facilitator" },
  { label: "Supabase", sublabel: "Stats" },
];

