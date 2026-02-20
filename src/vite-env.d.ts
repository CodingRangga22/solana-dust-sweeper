/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK?: "devnet" | "mainnet";
  readonly NEXT_PUBLIC_NETWORK?: "devnet" | "mainnet";
  readonly VITE_RPC_ENDPOINT?: string;
  readonly NEXT_PUBLIC_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
