/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK?: "devnet" | "mainnet";
  readonly NEXT_PUBLIC_NETWORK?: "devnet" | "mainnet";
  readonly VITE_RPC_ENDPOINT?: string;
  readonly NEXT_PUBLIC_RPC_URL?: string;
  /** Helius (or other) Solana HTTP RPC — used by x402 client and wallet reads */
  readonly VITE_HELIUS_RPC_URL?: string;
  readonly VITE_JUPITER_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
