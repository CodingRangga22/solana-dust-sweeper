import { useMemo } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { WalletAdapter } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { RPC_ENDPOINT, isDevnet, isMainnet, isDocsSubdomain } from "@/config/env";
import { BannerProvider, useBanner } from "./components/BannerProvider";
import DevnetBanner, { MainnetBanner } from "./components/DevnetBanner";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DocsLayout from "@/layouts/DocsLayout";
import Overview from "@/pages/docs/Overview";
import Technical from "@/pages/docs/Technical";
import Security from "@/pages/docs/Security";
import Fees from "@/pages/docs/Fees";
import FAQ from "@/pages/docs/FAQ";
import Leaderboard from "./pages/Leaderboard";
import Simulation from "./pages/Simulation";
import Demo from "./pages/Demo";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import "@solana/wallet-adapter-react-ui/styles.css";

const queryClient = new QueryClient();

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

const App = () => {
  const endpoint = useMemo(() => RPC_ENDPOINT, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="arsweep-theme">
      <BannerProvider initialHeight={isDevnet || isMainnet ? 44 : 0}>
        <DevnetBanner />
        <MainnetBanner />
        <AppContent endpoint={endpoint} wallets={wallets} />
      </BannerProvider>
    </ThemeProvider>
  );
};

const AppContent = ({
  endpoint,
  wallets,
}: {
  endpoint: string;
  wallets: WalletAdapter[];
}) => {
  const { bannerHeight } = useBanner();

  return (
    <div style={{ paddingTop: bannerHeight }} className="min-h-screen transition-[padding] duration-200">
      <ConnectionProvider endpoint={endpoint}>
       <WalletProvider wallets={wallets} autoConnect={true}>
          <WalletModalProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                <Routes>
                  <Route
                    path="/"
                    element={
                      isDocsSubdomain() ? (
                        <Navigate to="/docs" replace />
                      ) : (
                        <Landing />
                      )
                    }
                  />
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/simulation" element={<Simulation />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                  <Route path="/docs" element={<DocsLayout />}>
                    <Route index element={<Overview />} />
                    <Route path="technical" element={<Technical />} />
                    <Route path="security" element={<Security />} />
                    <Route path="fees" element={<Fees />} />
                    <Route path="faq" element={<FAQ />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </QueryClientProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};

export default App;
