import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link, Outlet } from "react-router-dom";
import { X } from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import BrandWordmark from "@/components/BrandWordmark";
import ThemeToggle from "@/components/ThemeToggle";
const M: React.CSSProperties = { fontFamily: "var(--font-mono)" };
export default function DocsLayout(_props?: { children?: React.ReactNode }) {
  useScrollReveal();
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
        <span className="md:hidden" aria-hidden>
          <X size={18} style={{ opacity: 0 }} />
        </span>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/"
          style={{ ...M, fontSize: 12, color: "hsl(var(--muted-foreground))", textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
        >← Back</Link>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {navLinks.map(({ to, label }) => (
          <Link key={to} to={to}
            style={{
              ...M,
              fontSize: 13,
              color: "hsl(var(--muted-foreground))",
              textDecoration: "none",
              padding: "8px 12px",
              borderRadius: 8,
              transition: "color 0.2s, background 0.2s, border-color 0.2s",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground))";
              (e.currentTarget as HTMLElement).style.background = "hsl(var(--muted))";
              (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "hsl(var(--muted-foreground))";
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            }}
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
        backgroundColor: "hsl(var(--background))",
        backgroundImage: "none",
        color: "hsl(var(--foreground))",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          background: "color-mix(in oklab, hsl(var(--background)) 92%, transparent)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid hsl(var(--border))",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <ArsweepLogo className="w-6 h-6" />
          <span style={{ ...M, fontSize: 13, fontWeight: 700, color: "hsl(var(--foreground))" }}>DOCS</span>
        </Link>
        <ThemeToggle />
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex" style={{
          width: 240, flexShrink: 0, flexDirection: "column",
          borderRight: "1px solid hsl(var(--border))",
          background: "color-mix(in oklab, hsl(var(--background)) 92%, black 8%)",
          padding: "32px 24px",
          position: "sticky", top: 0, height: "100vh", overflowY: "auto",
        }}>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, minWidth: 0, padding: "clamp(24px, 5vw, 64px)", overflowY: "auto", position: "relative" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
