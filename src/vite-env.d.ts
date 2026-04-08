/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK?: "devnet" | "mainnet";
  readonly NEXT_PUBLIC_NETWORK?: "devnet" | "mainnet";
  readonly VITE_RPC_ENDPOINT?: string;
  readonly NEXT_PUBLIC_RPC_URL?: string;
  /** Helius (or other) Solana HTTP RPC — wallet, x402 client, premium USDC balance */
  readonly VITE_HELIUS_RPC_URL?: string;
  /** Helius API key (optional if key is only embedded in VITE_HELIUS_RPC_URL) */
  readonly VITE_HELIUS_API_KEY?: string;
  /** Override API root (default https://api.arsweep.fun/v1) */
  readonly VITE_ARSWEEP_API_BASE?: string;
  /** x402 paid path prefix (default /x402). Must match API e.g. POST /v1/x402/report */
  readonly VITE_ARSWEEP_X402_PATH_PREFIX?: string;
  readonly VITE_JUPITER_API_KEY?: string;
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_DISCORD_SWEEP_WEBHOOK?: string;
  readonly VITE_TELEGRAM_ALERT_BOT_USERNAME?: string;
  readonly VITE_DOCS_HOST?: string;
  readonly VITE_APP_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
