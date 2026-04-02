import { useState } from 'react';
import { Copy, Check, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { WalletScanCard } from './WalletScanCard';

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
}

export function ChatMessage({ role, content, timestamp, walletAddress, walletScan, onPremiumAnalysis }: ChatMessageProps) {
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
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-[80%] ${role === 'user' ? 'items-end' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 relative ${
            role === 'user'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-muted border border-border'
          }`}
        >
          {/* Copy Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={`absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${
              role === 'user' ? 'bg-white/20 hover:bg-white/30' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>

          {/* Message Text */}
          {role === 'assistant' ? (
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
                      <code className="bg-purple-600/10 px-1.5 py-0.5 rounded text-purple-600 font-mono text-xs" {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  a: ({ children, href }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
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
