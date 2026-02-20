import { useMemo } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { RPC_ENDPOINT, isDevnet } from "@/config/env";
import { BannerProvider, useBanner } from "./components/BannerProvider";
import DevnetBanner from "./components/DevnetBanner";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import "@solana/wallet-adapter-react-ui/styles.css";

const queryClient = new QueryClient();

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

const App = () => {
  const endpoint = useMemo(() => RPC_ENDPOINT, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="arsweep-theme">
      <BannerProvider initialHeight={isDevnet ? 44 : 0}>
        <DevnetBanner />
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
  wallets: ReturnType<typeof PhantomWalletAdapter>[];
}) => {
  const { bannerHeight } = useBanner();

  return (
    <div style={{ paddingTop: bannerHeight }} className="min-h-screen transition-[padding] duration-200">
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                  <Route path="/docs" element={<Docs />} />
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
