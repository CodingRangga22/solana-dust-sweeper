import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import BrandWordmark from "@/components/BrandWordmark";
const M: React.CSSProperties = { fontFamily: "var(--font-mono)" };
export default function DocsLayout(_props?: { children?: React.ReactNode }) {
  useScrollReveal();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);
  const navLinks = [
    { to: "/docs", label: "Overview" },
    { to: "/docs/technical", label: "Technical" },
    { to: "/docs/security", label: "Security" },
    { to: "/docs/fees", label: "Fee Model" },
    { to: "/docs/faq", label: "FAQ" },
  ];
  const SidebarContent = () => (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <BrandWordmark size="sm">ARSWEEP DOCS</BrandWordmark>
        <button onClick={closeDrawer} className="md:hidden" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 4 }}>
          <X size={18} />
        </button>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/" style={{ ...M, fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >← Back</Link>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to} onClick={closeDrawer}
            style={{ ...M, fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", padding: "8px 12px", borderRadius: 8, transition: "color 0.2s, background 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >{label}</Link>
        ))}
      </nav>
    </>
  );
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--ar-base)",
        backgroundImage: "var(--ar-ambient-gradients)",
        color: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Mobile Header */}
      <div className="md:hidden" style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "rgba(2,6,15,0.96)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <ArsweepLogo className="w-6 h-6" />
          <span style={{ ...M, fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>DOCS</span>
        </Link>
        <button onClick={() => setDrawerOpen(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 8 }}>
          <Menu size={20} />
        </button>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Mobile Overlay */}
        {drawerOpen && (
          <div onClick={closeDrawer} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)" }} />
        )}

        {/* Mobile Drawer */}
        <aside className="md:hidden" style={{
          position: "fixed", left: drawerOpen ? 0 : -260, top: 0, bottom: 0, zIndex: 50,
          width: 240, background: "rgba(2,6,15,0.99)", borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 24px", transition: "left 0.3s ease", overflowY: "auto",
        }}>
          <SidebarContent />
        </aside>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex" style={{
          width: 240, flexShrink: 0, flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(2,6,15,0.92)", padding: "32px 24px",
          position: "sticky", top: 0, height: "100vh", overflowY: "auto",
        }}>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, minWidth: 0, padding: "clamp(24px, 5vw, 64px)", overflowY: "auto" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
