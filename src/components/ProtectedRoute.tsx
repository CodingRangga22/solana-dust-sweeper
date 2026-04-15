import { Loader2, ArrowRight } from "lucide-react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import ConnectWalletGate from "@/components/ConnectWalletGate";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * When false, children render after Privy is ready without forcing login first.
   * Use when the page implements its own connect UX (e.g. Dashboard at /app).
   */
  requirePrivyLogin?: boolean;
}

const ProtectedRoute = ({ children, requirePrivyLogin = true }: ProtectedRouteProps) => {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin();

  if (!ready) {
    return (
      <div className="relative min-h-screen bg-[#040506]">
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-3 text-white/60">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-mono">Loading…</p>
        </div>
      </div>
    );
  }

  if (requirePrivyLogin && !authenticated) {
    return (
      <ConnectWalletGate
        cta={
          <button
            type="button"
            onClick={() => login()}
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-white to-white/90 px-6 font-semibold text-[#05080d] shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/15 transition-transform active:scale-[0.99]"
            style={{ fontFamily: "var(--font-landing-section)" }}
          >
            <span>Connect Wallet</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        }
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
