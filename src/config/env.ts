/**
 * Environment configuration for Arsweep.
 * Mainnet-ready architecture - toggle via VITE_NETWORK env var.
 */

export type Network = "devnet" | "mainnet";

// Vite uses VITE_ prefix; Next.js would use NEXT_PUBLIC_NETWORK
const network = (import.meta.env.VITE_NETWORK ?? import.meta.env.NEXT_PUBLIC_NETWORK ?? "devnet") as Network;
const validNetworks: Network[] = ["devnet", "mainnet"];
export const NETWORK: Network = validNetworks.includes(network) ? network : "devnet";

export const isDevnet = NETWORK === "devnet";
export const isMainnet = NETWORK === "mainnet";

const customRpc =
  import.meta.env.VITE_RPC_ENDPOINT ?? import.meta.env.NEXT_PUBLIC_RPC_URL ?? "";

export const RPC_ENDPOINT =
  customRpc.trim() ||
  (isMainnet ? "https://api.mainnet-beta.solana.com" : "https://api.devnet.solana.com");

export const EXPLORER_BASE = isMainnet
  ? "https://explorer.solana.com"
  : "https://explorer.solana.com";

export const EXPLORER_TX_URL = (signature: string) =>
  `${EXPLORER_BASE}/tx/${signature}${isDevnet ? "?cluster=devnet" : ""}`;

export const EXPLORER_CLUSTER = isDevnet ? "devnet" : "mainnet-beta";

export const FAUCET_URL = "https://faucet.solana.com/";
