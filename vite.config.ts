import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => ({
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
    proxy: {
      /**
       * Syra x402 endpoints often don't expose payment headers to arbitrary browser origins.
       * Proxying through Vite makes the request same-origin (localhost) so the x402 client can
       * read 402 requirements + retry with proof.
       */
      "/syra": {
        target: "https://api.syraa.fun",
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/syra/, ""),
      },
    },
  },
  plugins: [
    nodePolyfills({
      include: ["buffer", "process"],
      globals: { Buffer: true, process: true, global: true },
    }),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    rollupOptions: {
      // Filter Rollup warnings from misplaced #__PURE__ markers in node_modules (Privy, ox, WalletConnect).
      onwarn(warning, defaultHandler) {
        const msg = String(warning.message ?? "");
        if (
          msg.includes("PURE") &&
          msg.includes("Rollup cannot interpret")
        ) {
          return;
        }
        defaultHandler(warning);
      },
    },
  },
}));
