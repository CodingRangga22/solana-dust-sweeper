import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "./SidebarContext";
import ArsweepLogo from "./ArsweepLogo";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useBanner } from "./BannerProvider";
import WalletMenu from "./WalletMenu";
import BrandWordmark from "./BrandWordmark";
interface HeaderProps {
  onChangeWallet?: () => void;
  onDisconnect?: () => void;
  walletMismatch?: boolean;
}
const Header = ({ onChangeWallet, onDisconnect, walletMismatch }: HeaderProps) => {
  const { bannerHeight } = useBanner();
  const { setOpen } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname.replace(/\/$/, "") || "/";
  const isApp = path === "/app";

  return (
    <header
      className="arsweep-premium-nav relative"
      style={{ position: "fixed", left: 0, right: 0, zIndex: 50, top: bannerHeight }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left — Hamburger (mobile) + Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Hamburger: /app pakai Sidebar, landing pakai mobileOpen */}
          <button
            onClick={() => isApp ? setOpen(true) : setMobileOpen(p => !p)}
            className="sm:hidden"
            style={{ background: "none", border: "none", color: "hsl(var(--muted-foreground))", cursor: "pointer", padding: 6 }}
          >
            {mobileOpen && !isApp ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="group flex items-center gap-2.5 no-underline sm:gap-3" style={{ textDecoration: "none" }}>
            <ArsweepLogo className="h-7 w-7 shrink-0 transition-transform duration-200 group-hover:scale-[1.03]" />
            <BrandWordmark />
          </Link>
        </div>



        {/* Center — Nav desktop */}
        <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-1" aria-label="Main">
          {[["Docs","/docs"],["Stats","/stats"],["Token","/token"],["Agent","/agent"],["x402","/x402"],["Revoke","/revoke"]].map(([l,p])=>(
            <Link key={p} to={p}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors duration-200"
              style={{ textDecoration: "none" }}
            >{l}</Link>
          ))}
        </nav>

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
        <div className="sm:hidden border-b border-border bg-background/90 backdrop-blur-xl shadow-premium-sm" style={{
          padding: "8px 20px 20px",
        }}>
          {[["Docs","/docs"],["Stats","/stats"],["Token","/token"],["Agent","/agent"],["x402","/x402"],["Revoke","/revoke"]].map(([l,p])=>(
            <Link key={p} to={p} onClick={() => setMobileOpen(false)}
              style={{ fontSize: 15, color: "hsl(var(--foreground))", textDecoration: "none", padding: "12px 8px", borderBottom: "1px solid hsl(var(--border))", display: "block" }}
            >{l}</Link>
          ))}
          <a href="https://discord.gg/D2rtvK3fBs" target="_blank" rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            style={{ fontSize: 15, color: "hsl(var(--foreground))", textDecoration: "none", padding: "12px 8px", borderBottom: "1px solid hsl(var(--border))", display: "block" }}
          >Discord</a>
          <div style={{ paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
};
export default Header;
