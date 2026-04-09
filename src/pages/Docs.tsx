import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Shield,
  BookOpen,
  Cpu,
  HelpCircle,
  Percent,
  FileWarning,
  ShieldCheck,
} from "lucide-react";
import ArsweepLogo from "@/components/ArsweepLogo";
import PremiumFooter from "@/components/PremiumFooter";
import DocsLayout from "@/layouts/DocsLayout";

import overview from "@/docs/overview.md?raw";
import architecture from "@/docs/architecture.md?raw";
import security from "@/docs/security.md?raw";
import tokenomics from "@/docs/tokenomics.md?raw";
import roadmap from "@/docs/roadmap.md?raw";
import faq from "@/docs/faq.md?raw";

const markdownComponents = {
  pre: (props: React.ComponentPropsWithoutRef<"pre"> & { node?: unknown }) => {
    const { node: _node, ...preProps } = props;
    return <pre {...preProps} className={(preProps.className ?? "") + " overflow-x-auto"} />;
  },
};

const SIDEBAR_ITEMS = [
  { id: "intro", title: "Introduction", icon: BookOpen },
  { id: "technical", title: "Technical Specs", icon: Cpu },
  { id: "security", title: "Security", icon: Shield },
  { id: "security-audit", title: "Security Audit", icon: ShieldCheck },
  { id: "fees", title: "Fees", icon: Percent },
  { id: "faq", title: "FAQ", icon: HelpCircle },
  { id: "disclaimer", title: "Disclaimer", icon: FileWarning },
];

const SIDEBAR_GROUPS = [
  {
    label: "Getting Started",
    items: [
      { id: "intro", title: "Introduction", icon: BookOpen },
      { id: "technical", title: "Technical Specs", icon: Cpu },
    ],
  },
  {
    label: "Security",
    items: [
      { id: "security", title: "Security", icon: Shield },
      { id: "security-audit", title: "Security Audit", icon: ShieldCheck },
    ],
  },
  {
    label: "Product",
    items: [{ id: "fees", title: "Fees", icon: Percent }],
  },
  {
    label: "Help",
    items: [{ id: "faq", title: "FAQ", icon: HelpCircle }],
  },
  {
    label: "Legal",
    items: [{ id: "disclaimer", title: "Disclaimer", icon: FileWarning }],
  },
];

const Docs = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && contentRef.current) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  return (
    <DocsLayout>
      {/* Top Docs Navbar — docs identity (Syra-style) */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <ArsweepLogo className="w-6 h-6" />
            <span className="font-semibold">Docs</span>
          </Link>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/app" className="hover:text-foreground transition-colors">
            App
          </Link>
          <a href="https://t.me/arsweepalert" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
            Telegram
          </a>
        </div>
      </header>

      {/* Main layout: sidebar + content */}
      <div className="flex flex-1 min-h-0 pb-20">
        {/* Left sidebar - Syra-style structured nav */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-border bg-background sticky top-0 h-[calc(100vh-3.5rem)] overflow-y-auto p-6">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* Center content */}
        <div className="flex-1 min-w-0 px-4 lg:px-8 py-6">
          <main ref={contentRef} className="max-w-3xl mx-auto">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {overview}
              </ReactMarkdown>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {architecture}
              </ReactMarkdown>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {security}
              </ReactMarkdown>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {tokenomics}
              </ReactMarkdown>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {roadmap}
              </ReactMarkdown>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {faq}
              </ReactMarkdown>
            </div>
          </main>
        </div>

        {/* Right TOC — section anchors (enterprise docs style) */}
        <aside className="hidden xl:block w-48 shrink-0 text-xs sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-6 pl-4 border-l border-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-medium">
            On this page
          </p>
          <nav className="space-y-1.5">
            {SIDEBAR_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block text-muted-foreground hover:text-primary transition-colors py-0.5"
              >
                {item.title}
              </a>
            ))}
          </nav>
        </aside>
      </div>

      <PremiumFooter />
    </DocsLayout>
  );
};

export default Docs;
