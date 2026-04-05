import React from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "./SidebarContext";
import ArsweepLogo from "./ArsweepLogo";
import { Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useBanner } from "./BannerProvider";
import WalletMenu from "./WalletMenu";

interface HeaderProps {
  onChangeWallet?: () => void;
  onDisconnect?: () => void;
  walletMismatch?: boolean;
}

const M: React.CSSProperties = { fontFamily: "var(--font-mono)" };

const Header = ({ onChangeWallet, onDisconnect, walletMismatch }: HeaderProps) => {
  const { bannerHeight } = useBanner();
  const { setOpen } = useSidebar();

  return (
    <header style={{
      position: "fixed", left: 0, right: 0, zIndex: 50, top: 0,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(11,15,20,0.88)",
      backdropFilter: "blur(20px)",
      transition: "top 0.2s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Left — Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 8 }} className="sm:hidden">
            <Menu size={20} />
          </button>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <ArsweepLogo className="w-6 h-6" />
            <span style={{ ...M, fontSize: 14, fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.06em", textTransform: "uppercase" }}>ARSWEEP</span>
          </Link>
        </div>

        {/* Center — Nav links */}
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 28 }} className="hidden sm:flex">
          {[["Docs","/docs"],["$ARSWP","/token"],["Agent","/agent"]].map(([l,p])=>(
            <Link key={p} to={p}
              style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e=>(e.currentTarget.style.color="#FFFFFF")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.5)")}
            >{l}</Link>
          ))}
        </div>

        {/* Right — Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          {onChangeWallet && onDisconnect ? (
            <WalletMenu onChangeWallet={onChangeWallet} onDisconnect={onDisconnect} walletMismatch={walletMismatch} />
          ) : (
            <WalletMenu onChangeWallet={() => {}} onDisconnect={() => {}} walletMismatch={false} />
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
