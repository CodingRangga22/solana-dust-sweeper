import { Buffer } from "buffer";
globalThis.Buffer = Buffer;

import { createRoot } from "react-dom/client";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { privySolanaConfig } from "@/config/privySolana";
import { PRIVY_SOLANA_WALLET_LIST } from "@/config/privyWallets";
import App from "./App.tsx";
import "./index.css";

/** Shown when the bundle was built without `VITE_PRIVY_APP_ID` (e.g. missing env on Vercel). Mounting `<App />` without `PrivyProvider` crashes any route that calls `usePrivy()`. */
function PrivyConfigMissing() {
  return (
    <div
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        background: "#0a0a0a",
        color: "#e5e5e5",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        maxWidth: "42rem",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem", fontWeight: 600 }}>
        Missing Privy app ID
      </h1>
      <p style={{ marginBottom: "0.75rem", lineHeight: 1.6 }}>
        Add{" "}
        <code style={{ color: "#fbbf24" }}>VITE_PRIVY_APP_ID</code> to your deployment environment (for
        example Vercel: Project → Settings → Environment Variables), ensure it applies to{" "}
        <strong>Production</strong>, then trigger a new deploy.
      </p>
      <p style={{ fontSize: "0.875rem", color: "#a3a3a3", lineHeight: 1.5 }}>
        Vite reads <code>VITE_*</code> variables at <strong>build</strong> time, not only at runtime.
      </p>
    </div>
  );
}

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
      // Required for reliable external Solana wallet connect (Privy Solana guide).
      solana: privySolanaConfig,
      // Privy login (email + Solana wallets via modal) — app-wide; wallet-adapter receives the linked Solana connection.
      loginMethods: ["wallet", "email"],
      appearance: {
        walletChainType: "solana-only",
        showWalletLoginFirst: true,
        // Phantom first — same order as connectWallet() calls (see privyWallets.ts).
        walletList: [...PRIVY_SOLANA_WALLET_LIST],
      },
      externalWallets: {
        solana: {
          // shouldAutoConnect: false avoids extension races with the Privy modal (Privy docs).
          connectors: toSolanaWalletConnectors({ shouldAutoConnect: false }),
        },
      },
    }}
  >
    <App />
  </PrivyProvider>
) : (
  <PrivyConfigMissing />
);

if (!privyAppId) {
  console.warn(
    "[Privy] Missing VITE_PRIVY_APP_ID (or NEXT_PUBLIC_PRIVY_APP_ID). Set it before build; see PrivyConfigMissing screen in production.",
  );
}

createRoot(rootEl).render(app);
