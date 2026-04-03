import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FlaskConical } from "lucide-react";
import ArsweepLogo from "./ArsweepLogo";
import ThemeToggle from "./ThemeToggle";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const SIDEBAR_WIDTH = 240;

const SidebarContent = () => {
  const location = useLocation();
  const isApp = location.pathname === "/app";
  const isSimulation = location.pathname === "/simulation";

  const navItems = [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard },
    { to: "/simulation", label: "Simulation", icon: FlaskConical },
  ];

  return (
    <>
      <Link
        to="/"
        className="flex items-center gap-3 px-4 py-4 border-b border-border hover:opacity-90 transition-opacity"
        translate="no"
      >
        <ArsweepLogo className="w-8 h-8 shrink-0" />
        <span className="text-lg font-bold gradient-text notranslate">Arsweep</span>
      </Link>
      <nav className="flex-1 flex flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = (to === "/app" && isApp) || (to === "/simulation" && isSimulation);
          return (
            <Link
              key={label}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <ThemeToggle />
      </div>
    </>
  );
};

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bannerHeight: number;
}

export const SIDEBAR_WIDTH_PX = SIDEBAR_WIDTH;

export default function AppSidebar({ open, onOpenChange, bannerHeight }: AppSidebarProps) {
  return (
    <>
      {/* Desktop: fixed left sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 z-40 w-[240px] glass border-r border-border bg-background/95"
        style={{ top: bannerHeight, height: `calc(100vh - ${bannerHeight}px)` }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile: drawer from left */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
