import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

/**
 * Privy recommends `config.solana.rpcs` for Solana wallet flows (see Privy Solana guide).
 * Both mainnet and devnet are registered so Phantom / WC can complete SIWS-style handshakes.
 */
export const privySolanaConfig = {
  rpcs: {
    "solana:mainnet": {
      rpc: createSolanaRpc("https://api.mainnet-beta.solana.com"),
      rpcSubscriptions: createSolanaRpcSubscriptions("wss://api.mainnet-beta.solana.com"),
    },
    "solana:devnet": {
      rpc: createSolanaRpc("https://api.devnet.solana.com"),
      rpcSubscriptions: createSolanaRpcSubscriptions("wss://api.devnet.solana.com"),
    },
  },
};
