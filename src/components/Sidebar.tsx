import { Link, useLocation } from "react-router-dom";
import { Github, BookOpen, Trophy, X, FlaskConical } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useSidebar } from "./SidebarContext";

const Sidebar = () => {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  if (location.pathname.startsWith("/docs") || location.pathname.startsWith("/app")) return null;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}
      <div className={`fixed top-0 left-0 h-full w-64 z-[100] bg-background border-r border-border flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          <Link to="/leaderboard" onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === "/leaderboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
          <Link
            to="/simulation"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === "/simulation" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
          >
            <FlaskConical className="w-4 h-4" />
            Simulation
          </Link>
          <a href="/docs" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <BookOpen className="w-4 h-4" />
            Docs
          </a>
          <a href="https://discord.gg/D2rtvK3fBs" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </nav>
        <div className="px-5 py-5 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
