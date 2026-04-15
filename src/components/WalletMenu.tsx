import { useState, useRef, useEffect, useMemo, type CSSProperties } from "react";
import { useLogout } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { PublicKey } from "@solana/web3.js";
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
import { useArsweepWalletAuthUi } from "@/hooks/useArsweepWalletAuthUi";

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
  const { logout } = useLogout();
  const {
    ready,
    authenticated,
    login,
    connectSolana,
    showSwitchFromEvmHint,
    needsPrivySolanaWallet,
  } = useArsweepWalletAuthUi();

  const { ready: walletsReady, wallets: privySolanaWallets } = useWallets();
  const displayPublicKey = useMemo(() => {
    const addr = privySolanaWallets[0]?.address;
    return addr ? new PublicKey(addr) : null;
  }, [privySolanaWallets]);

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectBusy, setConnectBusy] = useState(false);
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
    "arsweep-wallet-button inline-flex items-center justify-center gap-2 font-medium transition-all shadow-none whitespace-nowrap",
    variant === "hero" &&
      "!rounded-2xl !px-8 !py-[1.125rem] !w-full !border-0 !shadow-none hover:!brightness-[1.03] active:!scale-[0.99]",
    variant === "compact" && "!rounded-xl !px-4 !py-2 !text-sm",
    variant === "header" && "!rounded-lg !px-3 !py-2 !text-xs",
  );

  const primaryStyle: CSSProperties =
    variant === "hero"
      ? {
          background: "linear-gradient(180deg, #ffffff 0%, #f0f9fb 100%)",
          color: "#070b10",
          fontFamily: "var(--font-landing-section)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
        }
      : {};

  if (!ready) {
    return (
      <button
        type="button"
        disabled
        className={cn(baseBtn, "cursor-not-allowed opacity-60")}
        style={primaryStyle}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className={variant === "hero" ? "font-sans text-[15px] font-semibold" : "font-mono"}>Loading…</span>
      </button>
    );
  }

  if (!authenticated) {
    return (
      <button
        type="button"
        onClick={() => login()}
        className={baseBtn}
        style={primaryStyle}
      >
        <span className={variant === "hero" ? "font-sans text-[15px] font-semibold" : "font-mono"}>Log in</span>
      </button>
    );
  }

  if (needsPrivySolanaWallet) {
    return (
      <div
        className={cn(
          "flex flex-col gap-2",
          variant === "hero" ? "w-full" : "items-stretch",
        )}
      >
        {showSwitchFromEvmHint ? (
          <p
            className={cn(
              "text-center text-[11px] leading-snug text-amber-200/90",
              variant === "hero" ? "px-1" : "max-w-[220px]",
            )}
          >
            Arsweep memakai <strong className="font-semibold">Solana</strong>. Hubungkan
            wallet Solana (Phantom, Solflare, …). Wallet EVM tidak dipakai untuk transaksi
            on-chain di sini.
          </p>
        ) : null}
        <button
          type="button"
          disabled={connectBusy}
          onClick={() => {
            setConnectBusy(true);
            void connectSolana().finally(() => setConnectBusy(false));
          }}
          className={cn(
            baseBtn,
            connectBusy && "cursor-wait opacity-80",
          )}
          style={primaryStyle}
        >
          {connectBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          <span className={variant === "hero" ? "font-sans text-[15px] font-semibold" : "font-mono"}>
            {connectBusy ? "Membuka Privy…" : "Hubungkan wallet Solana"}
          </span>
        </button>
      </div>
    );
  }

  if (!walletsReady || !displayPublicKey) {
    return (
      <button
        type="button"
        disabled
        className={cn(baseBtn, "cursor-wait opacity-70")}
        style={primaryStyle}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className={variant === "hero" ? "font-sans text-[15px] font-semibold" : "font-mono"}>Menyiapkan wallet…</span>
      </button>
    );
  }

  const address = displayPublicKey.toBase58();
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
      if (authenticated) {
        try {
          await logout();
        } catch {
          /* Session may already be invalid (403) — local disconnect is enough */
        }
      }
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
          title="Akun wallet berbeda dari sesi terkunci"
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
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          color: "hsl(var(--foreground))",
          fontFamily: "IBM Plex Mono, monospace",
        }}
      >
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
