import { Link, useLocation } from "react-router-dom";
import ArsweepLogo from "./ArsweepLogo";
import { Github, BookOpen } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ThemeToggle from "./ThemeToggle";
import { useBanner } from "./BannerProvider";

const Header = () => {
  const location = useLocation();
  const isDocs = location.pathname === "/docs";
  const { bannerHeight } = useBanner();

  return (
  <header
    className="fixed left-0 right-0 z-50 glass border-b border-border transition-[top] duration-200"
    style={{ top: bannerHeight }}
  >
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <ArsweepLogo className="w-8 h-8" />
          <span className="text-xl font-bold gradient-text">Arsweep</span>
        </Link>
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-primary/30 text-primary bg-primary/5">
          Open Source
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors duration-200 ${
            isDocs ? "text-primary" : "text-muted-foreground hover:text-primary glass glass-hover"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Docs</span>
        </a>
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
        <WalletMultiButton className="!bg-primary !text-primary-foreground !rounded-xl !px-4 !py-2.5 !text-sm !font-medium hover:!opacity-90 !transition-opacity" />
      </div>
    </div>
  </header>
  );
};

export default Header;
