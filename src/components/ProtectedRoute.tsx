import { Loader2 } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallet } from "@solana/wallet-adapter-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { ready, authenticated } = usePrivy();
  const { connected } = useWallet();

  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-mono">Loading...</p>
      </div>
    );
  }

  if (!connected && !authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
        <p className="text-sm font-mono">Connect your wallet to continue</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
