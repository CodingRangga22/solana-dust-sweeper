import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";

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

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row", background: "#0B0F14", backgroundImage: "radial-gradient(ellipse at 25% 40%, rgba(255,215,0,0.05), transparent 45%), radial-gradient(ellipse at 75% 60%, rgba(255,120,73,0.05), transparent 50%)", color: "#FFFFFF", fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile overlay */}
      {drawerOpen && (
        <button type="button" aria-label="Close menu"
          onClick={closeDrawer}
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer" }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(11,15,20,0.98)",
        padding: "32px 24px",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <span style={{ ...M, fontSize: 13, fontWeight: 600, color: "#FFFFFF", letterSpacing: "0.06em" }}>
            ARSWEEP DOCS
          </span>
        </div>

                <div style={{ marginBottom: 24 }}>
          <Link to="/"
            style={{ ...M, fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
          >← Back to Home</Link>
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


      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, padding: "48px 64px", overflowY: "auto" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
