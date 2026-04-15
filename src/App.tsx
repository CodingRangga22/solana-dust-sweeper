import { useEffect, useMemo } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { RPC_ENDPOINT, isDevnet, isMainnet, isDocsSubdomain } from "@/config/env";
import { BannerProvider, useBanner } from "./components/BannerProvider";
import DevnetBanner, { MainnetBanner } from "./components/DevnetBanner";
import { TwaBanner } from "./components/TwaBanner";
import { TwaWalletGuide } from "./components/TwaWalletGuide";
import { useTelegramWebApp } from "./hooks/useTelegramWebApp";
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
import AgentArsweep from "./pages/AgentArsweep";
import Demo from "./pages/Demo";
import Sidebar from "./components/Sidebar";
import { SidebarProvider } from "./components/SidebarContext";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ProtectedRoute from "./components/ProtectedRoute";
import { usePrivyWalletSync } from "./hooks/usePrivyWalletSync";
import TokenPage from "./pages/Token";
import X402Resources from "./pages/X402Resources";
import BottomMarqueeDock from "./components/BottomMarqueeDock";

const queryClient = new QueryClient();

const App = () => {
  const endpoint = useMemo(() => RPC_ENDPOINT, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="arsweep-theme">
      <BannerProvider initialHeight={isDevnet || isMainnet ? 44 : 0}>
        <DevnetBanner />
        <MainnetBanner />
        <AppContent endpoint={endpoint} />
      </BannerProvider>
    </ThemeProvider>
  );
};


const WalletSyncInner = () => {
  usePrivyWalletSync();
  return null;
};

const BannerRouteSync = () => {
  const { pathname } = useLocation();
  const { setNetworkBannerHiddenForRoute } = useBanner();
  useEffect(() => {
    const path = pathname.replace(/\/$/, "") || "/";
    setNetworkBannerHiddenForRoute(path === "/app" || path === "/agent");
  }, [pathname, setNetworkBannerHiddenForRoute]);
  return null;
};

const AppContent = ({
  endpoint,
}: {
  endpoint: string;
}) => {
  const { bannerHeight } = useBanner();
  const { isInTelegram, actionFromTwa, expand } = useTelegramWebApp();

  useEffect(() => {
    if (!isInTelegram) return;
    expand();
    if (actionFromTwa === "sweep" && window.location.pathname === "/") {
      window.location.replace("/app");
    }
  }, [isInTelegram, actionFromTwa]);

  const RouteAwareShell = () => {
    const { pathname } = useLocation();
    const path = pathname.replace(/\/$/, "") || "/";
    const showDock = path !== "/agent";
    const paddingBottom = showDock ? "var(--arsweep-dock-safe)" : 0;

    return (
      <div
        style={{ paddingTop: bannerHeight, paddingBottom }}
        className="min-h-screen transition-[padding] duration-200"
      >
        <TwaBanner />
        <TwaWalletGuide />

        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={[]} autoConnect={false}>
            <WalletSyncInner />
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <SidebarProvider>
                  <BannerRouteSync />
                  <Routes>
                    <Route
                      path="/"
                      element={
                        isDocsSubdomain() ? (
                          <Navigate to="/docs" replace />
                        ) : isInTelegram ? (
                          <Navigate to="/app" replace />
                        ) : (
                          <Landing />
                        )
                      }
                    />
                    <Route
                      path="/app"
                      element={
                        <ProtectedRoute requirePrivyLogin={false}>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/leaderboard" element={<Navigate to="/" replace />} />
                    <Route path="/simulation" element={<Simulation />} />
                    <Route
                      path="/agent"
                      element={
                        <ProtectedRoute>
                          <AgentArsweep />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                    <Route path="/docs" element={<DocsLayout />}>
                      <Route index element={<Overview />} />
                      <Route path="technical" element={<Technical />} />
                      <Route path="security" element={<Security />} />
                      <Route path="fees" element={<Fees />} />
                      <Route path="faq" element={<FAQ />} />
                    </Route>
                    <Route path="/token" element={<TokenPage />} />
                    <Route path="/x402" element={<X402Resources />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Sidebar />
                </SidebarProvider>
              </TooltipProvider>
            </QueryClientProvider>
          </WalletProvider>
        </ConnectionProvider>

        {showDock ? <BottomMarqueeDock /> : null}
      </div>
    );
  };

  return (
    <BrowserRouter>
      <RouteAwareShell />
    </BrowserRouter>
  );
};

export default App;
