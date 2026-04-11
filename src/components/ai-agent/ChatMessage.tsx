import { useState } from 'react';
import { Copy, Check, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import ArsweepLogo from '@/components/ArsweepLogo';
import { WalletScanCard } from './WalletScanCard';
import { PremiumResultRich } from './PremiumResultRich';
import type { PremiumServiceType } from '@/hooks/useArsweepChat';

interface WalletScanResult {
  address: string;
  solBalance: number;
  solValue: number;
  tokens: any[];
  totalValue: number;
  tokenCount: number;
  nftCount: number;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  walletAddress?: string;
  walletScan?: WalletScanResult;
  onPremiumAnalysis?: () => void;
  /** Tool names from agent (assistant only). */
  toolsUsed?: string[];
  /** Use Arsweep logo as assistant avatar (agent page). */
  assistantUseArsweepLogo?: boolean;
  /** `agent` = white/10 bubble; default = light neutral user bubble. */
  userBubbleVariant?: 'default' | 'agent';
  premiumResult?: { serviceType: PremiumServiceType; payload: unknown };
}

export function ChatMessage({
  role,
  content,
  timestamp,
  walletAddress,
  walletScan,
  onPremiumAnalysis,
  toolsUsed,
  assistantUseArsweepLogo,
  userBubbleVariant = 'default',
  premiumResult,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 group ${role === 'user' ? 'justify-end' : ''}`}>
      {/* Avatar */}
      {role === 'assistant' && (
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border ${
            assistantUseArsweepLogo
              ? 'border-cyan-500/20 bg-gradient-to-br from-white/[0.12] to-white/[0.04] shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/15'
              : 'border-white/15 bg-white/10'
          }`}
        >
          {assistantUseArsweepLogo ? (
            <ArsweepLogo className="h-5 w-5 drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]" />
          ) : (
            <Sparkles className="h-4 w-4 text-white" />
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col ${role === 'user' ? 'items-end' : ''} ${
          role === 'assistant' && premiumResult ? 'max-w-[min(96vw,52rem)]' : 'max-w-[80%]'
        }`}
      >
        {role === 'assistant' && toolsUsed && toolsUsed.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {toolsUsed.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-md border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wide text-cyan-300/90"
              >
                🔧 TOOL USED: {name}
              </span>
            ))}
          </div>
        )}
        <div
          className={`relative rounded-2xl px-4 py-3 ${
            role === 'user'
              ? userBubbleVariant === 'agent'
                ? 'border border-white/12 bg-gradient-to-br from-white/[0.12] to-white/[0.05] text-white/92 shadow-md shadow-black/20'
                : 'bg-slate-200 text-slate-900'
              : assistantUseArsweepLogo
                ? 'border border-white/[0.1] bg-gradient-to-br from-white/[0.09] to-white/[0.03] text-white/92 shadow-lg shadow-black/25'
                : 'border border-white/10 bg-white/5 text-white/90'
          }`}
        >
          {/* Copy Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={`absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
              role === 'user'
                ? userBubbleVariant === 'agent'
                  ? 'bg-white/10 hover:bg-white/15'
                  : 'bg-white/20 hover:bg-white/30'
                : 'bg-white/10 hover:bg-white/15'
            }`}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>

          {/* Message Text */}
          {role === 'assistant' && premiumResult ? (
            <PremiumResultRich serviceType={premiumResult.serviceType} payload={premiumResult.payload} />
          ) : role === 'assistant' ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg !my-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-white/10 px-1.5 py-0.5 rounded text-white/80 font-mono text-xs" {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  a: ({ children, href }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}
        </div>

        {/* Wallet Scan Card - Outside message bubble */}
        {walletScan && (
          <div className="mt-3 w-full">
            <WalletScanCard 
              result={walletScan} 
              onPremiumAnalysis={onPremiumAnalysis}
            />
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* User Avatar */}
      {role === 'user' && (
        <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
          {walletAddress ? (
            <span className="text-xs font-semibold">
              {walletAddress.slice(0, 2).toUpperCase()}
            </span>
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  );
}
