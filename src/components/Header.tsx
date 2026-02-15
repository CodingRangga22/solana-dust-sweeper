import ArsweepLogo from "./ArsweepLogo";
import { Wallet } from "lucide-react";

const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ArsweepLogo className="w-8 h-8" />
        <span className="text-xl font-bold gradient-text">Arsweep</span>
      </div>
      <button className="glass glass-hover flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground transition-all duration-200 hover:glow-primary">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
    </div>
  </header>
);

export default Header;
