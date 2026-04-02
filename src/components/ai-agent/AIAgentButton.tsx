import { MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIAgentButtonProps {
  variant?: 'hero' | 'navbar';
  className?: string;
}

export function AIAgentButton({ variant = 'navbar', className = '' }: AIAgentButtonProps) {
  const handleClick = () => {
    window.open('/agent', '_blank');
  };

  if (variant === 'hero') {
    return (
      <Button
        onClick={handleClick}
        className={`relative overflow-hidden group h-auto ${className}`}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-100 group-hover:opacity-90 transition-opacity" />
        <span className="relative flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5" />
          Ask AI Agent
        </span>
      </Button>
    );
  }

  // Navbar variant
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`relative border-purple-600/30 hover:border-purple-600/50 hover:bg-purple-600/5 transition-all ${className}`}
      size="sm"
    >
      <span className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-purple-600" />
        <span className="hidden sm:inline">AI Agent</span>
      </span>
      <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
    </Button>
  );
}
