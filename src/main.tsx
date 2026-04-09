import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import App from "./App.tsx";
import "./index.css";

const privyAppId =
  (import.meta.env.VITE_PRIVY_APP_ID as string | undefined)?.trim() ||
  (import.meta.env.NEXT_PUBLIC_PRIVY_APP_ID as string | undefined)?.trim();
const requirePrivyAuth =
  String((import.meta.env.REQUIRE_PRIVY_AUTH as string | undefined) ?? "").toLowerCase() === "true";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error('Missing root element: #root');

if (requirePrivyAuth && !privyAppId) {
  throw new Error(
    `[Privy] REQUIRE_PRIVY_AUTH=true but VITE_PRIVY_APP_ID is missing/empty for origin ${window.location.origin}. ` +
      `Set VITE_PRIVY_APP_ID in .env and restart the dev server.`,
  );
}

const app = privyAppId ? (
  <PrivyProvider
    appId={privyAppId}
    config={{
      // Multichain login (EVM + Solana) + email.
      // Note: Arsweep's sweep + x402 flows are still Solana-only and require a Solana wallet-adapter connection.
      loginMethods: ["wallet", "email"],
      appearance: {
        walletChainType: "ethereum-and-solana",
        showWalletLoginFirst: true,
        // Keep ordering opinionated; detected_* entries fill in the rest.
        walletList: [
          "phantom",
          "solflare",
          "metamask",
          "okx_wallet",
          "detected_solana_wallets",
          "detected_ethereum_wallets",
          "wallet_connect_qr",
        ],
      },
      externalWallets: {
        solana: {
          connectors: toSolanaWalletConnectors(),
        },
      },
    }}
  >
    <App />
  </PrivyProvider>
) : (
  <App />
);

if (!privyAppId) {
  console.warn(
    "[Privy] Missing VITE_PRIVY_APP_ID (or NEXT_PUBLIC_PRIVY_APP_ID). Running without PrivyProvider.",
  );
}

createRoot(rootEl).render(app);
