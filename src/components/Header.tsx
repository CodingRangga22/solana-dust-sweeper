import ArsweepLogo from "./ArsweepLogo";
import { Wallet, Github } from "lucide-react";

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ArsweepLogo className="w-8 h-8" />
        <span className="text-xl font-bold gradient-text">Arsweep</span>
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-primary/30 text-primary bg-primary/5">
          Open Source
        </span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="glass glass-hover flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
          aria-label="GitHub"
        >
          <Github className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">GitHub</span>
        </a>
        <button className="glass glass-hover flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground transition-all duration-200 hover:glow-primary">
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      </div>
    </div>
  </header>
);

export default Header;
