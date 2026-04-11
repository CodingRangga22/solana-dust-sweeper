import { useState, useRef, useEffect, type CSSProperties } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePrivy, useLogin, useLogout } from "@privy-io/react-auth";
import {
  Copy,
  Check,
  RefreshCw,
  LogOut,
  ChevronDown,
  AlertTriangle,
  Loader2,
  Unplug,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WalletMenuProps {
  onChangeWallet: () => void;
  onDisconnect: () => void;
  walletMismatch?: boolean;
  /** header = default nav; hero = dashboard empty state CTA; compact = inline cards */
  variant?: "header" | "hero" | "compact";
}

const WalletMenu = ({
  onChangeWallet,
  onDisconnect,
  walletMismatch,
  variant = "header",
}: WalletMenuProps) => {
  const { authenticated } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

  const { publicKey, connected, wallet, connecting } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const baseBtn = cn(
    "arsweep-wallet-button inline-flex items-center justify-center gap-2 font-medium transition-opacity shadow-none whitespace-nowrap",
    variant === "hero" &&
      "!rounded-2xl !px-8 !py-4 !text-sm !w-full !border-0 !shadow-none",
    variant === "compact" && "!rounded-xl !px-4 !py-2 !text-sm",
    variant === "header" && "!rounded-lg !px-3 !py-2 !text-xs",
  );

  const primaryStyle: CSSProperties =
    variant === "hero"
      ? {
          background: "#FFFFFF",
          color: "#0B0F14",
          fontFamily: "var(--font-mono)",
        }
      : {};

  // Adapter is reconnecting (e.g. after refresh)
  if (connecting && !publicKey) {
    return (
      <button
        type="button"
        disabled
        className={cn(baseBtn, "opacity-70 cursor-wait")}
        style={primaryStyle}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="font-mono">Connecting wallet…</span>
      </button>
    );
  }

  if (!connected || !publicKey) {
    return (
      <div
        className={cn(
          variant === "hero" &&
            "flex w-full flex-col items-stretch gap-3",
          variant !== "hero" && "flex items-center gap-2",
        )}
      >
        <WalletMultiButton className={baseBtn} style={primaryStyle} />
        {!authenticated && variant === "hero" ? (
          <button
            type="button"
            onClick={() => login()}
            className="text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Sign in with email (optional)
          </button>
        ) : null}
      </div>
    );
  }

  const address = publicKey.toBase58();
  const short = `${address.slice(0, 4)}...${address.slice(-4)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  const handleSignOut = async () => {
    setOpen(false);
    try {
      await onDisconnect();
      if (authenticated) await logout();
      toast.success("Signed out");
    } catch {
      toast.error("Sign out failed");
    }
  };

  return (
    <div ref={menuRef} className="relative flex items-center gap-2">
      {walletMismatch && (
        <span
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
          title="Phantom account differs from locked session"
        >
          <AlertTriangle className="w-3 h-3" />
          Mismatch
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-lg text-xs font-medium transition-opacity",
          variant === "hero" ? "px-4 py-3" : "px-3 py-2",
        )}
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#FFFFFF",
          fontFamily: "IBM Plex Mono, monospace",
        }}
      >
        {wallet?.adapter.icon && (
          <img
            src={wallet.adapter.icon}
            alt=""
            className="w-4 h-4 rounded-sm"
          />
        )}
        <span className="font-mono text-xs">{short}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl glass border border-border shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <p className="px-4 py-2.5 text-[11px] text-muted-foreground font-mono border-b border-border truncate">
            {address}
          </p>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
            Copy Address
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onChangeWallet();
            }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            Change Wallet
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDisconnect();
            }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
          >
            <Unplug className="w-4 h-4 text-muted-foreground" />
            Disconnect wallet
          </button>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors border-t border-border"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletMenu;
