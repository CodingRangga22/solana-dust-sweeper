import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Copy,
  Check,
  RefreshCw,
  LogOut,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface WalletMenuProps {
  onChangeWallet: () => void;
  onDisconnect: () => void;
  walletMismatch?: boolean;
}

const WalletMenu = ({
  onChangeWallet,
  onDisconnect,
  walletMismatch,
}: WalletMenuProps) => {
  const { publicKey, connected, wallet } = useWallet();
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

  if (!connected || !publicKey) {
    return (
      <WalletMultiButton className="!bg-transparent !bg-none !rounded-xl !px-5 !py-2.5 !text-sm !font-semibold !text-white !transition-all !duration-200 !border-0 !shadow-none" style={{ background: "linear-gradient(135deg, hsl(162,93%,51%), hsl(271,100%,63%))" }} />
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
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
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
            onClick={() => {
              setOpen(false);
              onDisconnect();
            }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletMenu;
