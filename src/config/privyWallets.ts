/**
 * Urutan opsi di modal Privy — Phantom dulu (login lewat extension Phantom).
 * Jangan tambahkan PhantomWalletAdapter di WalletProvider: Phantom sudah lewat Wallet Standard + Privy.
 */
export const PRIVY_SOLANA_WALLET_LIST = [
  "phantom",
  "solflare",
  "okx_wallet",
  "detected_solana_wallets",
  "wallet_connect_qr",
] as const;
