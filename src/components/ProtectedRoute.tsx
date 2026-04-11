import { Loader2 } from "lucide-react";
import { usePrivy, useLogin } from "@privy-io/react-auth";

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-mono">Loading...</p>
      </div>
    );
  }

  if (requirePrivyLogin && !authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
        <p className="text-sm font-mono text-muted-foreground">Connect your wallet to continue</p>
        <button
          onClick={() => login()}
          style={{
            background: "#FFFFFF",
            color: "#0B0F14",
            fontFamily: "var(--font-mono)",
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            fontWeight: 500,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
