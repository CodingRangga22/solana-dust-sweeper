import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function DocsLayout(_props?: { children?: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">

      {/* Mobile overlay — tap to close drawer */}
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeDrawer}
      />

      {/* Sidebar — drawer on mobile, fixed column on desktop */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-full max-w-[16rem] lg:max-w-none lg:w-64 border-r border-border bg-background p-6 flex flex-col transition-transform duration-200 ease-out ${drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Arsweep Docs</h2>
          <button
            type="button"
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-muted lg:hidden"
            onClick={closeDrawer}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-3 text-sm text-muted-foreground">
          <Link to="/docs" className="block hover:text-primary" onClick={closeDrawer}>Overview</Link>
          <Link to="/docs/technical" className="block hover:text-primary" onClick={closeDrawer}>Technical</Link>
          <Link to="/docs/security" className="block hover:text-primary" onClick={closeDrawer}>Security</Link>
          <Link to="/docs/fees" className="block hover:text-primary" onClick={closeDrawer}>Fee Model</Link>
          <Link to="/docs/faq" className="block hover:text-primary" onClick={closeDrawer}>FAQ</Link>
        </nav>

        <div className="mt-10 text-xs">
          <Link to="/" className="text-primary text-sm hover:underline" onClick={closeDrawer}>
            ← Back to Home
          </Link>
        </div>
      </aside>

      {/* Content + mobile menu button */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 md:px-8 lg:px-12 py-8 relative">
        <button
          type="button"
          aria-label="Open menu"
          className="lg:hidden absolute top-4 left-4 p-2 rounded-lg border border-border bg-background hover:bg-muted"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="pt-12 lg:pt-0">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
