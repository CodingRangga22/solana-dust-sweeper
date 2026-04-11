import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "./SidebarContext";
import ArsweepLogo from "./ArsweepLogo";
import { Menu, X } from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname.replace(/\/$/, "") || "/";
  const isApp = path === "/app";

  return (
    <header style={{
      position: "fixed", left: 0, right: 0, zIndex: 50, top: bannerHeight,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(11,15,20,0.88)",
      backdropFilter: "blur(20px)",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left — Hamburger (mobile) + Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Hamburger: /app pakai Sidebar, landing pakai mobileOpen */}
          <button
            onClick={() => isApp ? setOpen(true) : setMobileOpen(p => !p)}
            className="sm:hidden"
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 6 }}
          >
            {mobileOpen && !isApp ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <ArsweepLogo className="w-6 h-6" />
            <span style={{ ...M, fontSize: 14, fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.06em", textTransform: "uppercase" }}>ARSWEEP</span>
          </Link>
        </div>



        {/* Center — Nav desktop */}
        <div className="hidden sm:flex" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", alignItems: "center", gap: 28 }}>
          {[["Docs","/docs"],["$ASWP","/token"],["Agent","/agent"]].map(([l,p])=>(
            <Link key={p} to={p}
              style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e=>(e.currentTarget.style.color="#FFFFFF")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.5)")}
            >{l}</Link>
          ))}
        </div>

        {/* Right — Wallet + Theme (desktop), Wallet only (mobile) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="hidden sm:block"><ThemeToggle /></div>
          {onChangeWallet && onDisconnect ? (
            <WalletMenu onChangeWallet={onChangeWallet} onDisconnect={onDisconnect} walletMismatch={walletMismatch} />
          ) : (
            <WalletMenu onChangeWallet={() => {}} onDisconnect={() => {}} walletMismatch={false} />
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown (landing only) */}
      {mobileOpen && !isApp && (
        <div className="sm:hidden" style={{
          background: "rgba(11,15,20,0.98)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "8px 20px 20px",
        }}>
          {[["Docs","/docs"],["$ASWP","/token"],["Agent","/agent"]].map(([l,p])=>(
            <Link key={p} to={p} onClick={() => setMobileOpen(false)}
              style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "12px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "block" }}
            >{l}</Link>
          ))}
          <a href="https://discord.gg/D2rtvK3fBs" target="_blank" rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", textDecoration: "none", padding: "12px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "block" }}
          >Discord</a>
          <div style={{ paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
