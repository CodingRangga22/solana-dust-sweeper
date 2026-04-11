import { useState, useRef, useEffect } from 'react';
import { X, Send, Layers, Loader2, Bell, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePrivySolanaPublicKey } from '@/hooks/usePrivySolanaPublicKey';
import { useArsweepChat } from '@/hooks/useArsweepChat';
import { NotificationSettings } from './NotificationSettings';
import { X402PaymentModal } from './X402PaymentModal';

interface AIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAgentModal({ isOpen, onClose }: AIAgentModalProps) {
  const { publicKey } = usePrivySolanaPublicKey();
  const userId = publicKey?.toString() || 'anonymous-' + Date.now();
  const { messages, isLoading, error, sendMessage } = useArsweepChat(userId);
  
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'analyze' | 'report'>('analyze');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const quickActions = [
    { icon: '🔍', label: 'Analyze my wallet', action: 'analyze' },
    { icon: '⚠️', label: 'Check for scam tokens', action: 'scam-check' },
    { icon: '🔔', label: 'Enable notifications', action: 'notifications' }
  ];

  const handleQuickAction = async (action: string) => {
    if (action === 'analyze') {
      setInput('Analyze my wallet');
    } else if (action === 'scam-check') {
      await handleSendMessage('How can I check if a token is a scam?');
    } else if (action === 'notifications') {
      setActiveTab('notifications');
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setInput('');
    try {
      await sendMessage(text, publicKey?.toString());
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[440px] h-[680px] p-0 gap-0 flex flex-col">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 flex items-center gap-3 rounded-t-lg">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-base">Arsy AI Agent</h3>
            <p className="text-white/80 text-xs">Powered by api.arsweep.fun</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="chat" className="flex-1 gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col m-0 data-[state=inactive]:hidden">
            <ScrollArea className="flex-1 p-5 bg-muted/30" ref={scrollRef}>
              <div className="space-y-4">
                
                {messages.length === 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground px-1">Premium Features</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => { setPaymentType('analyze'); setShowPayment(true); }}
                        className="h-auto py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-col gap-1"
                      >
                        <span className="text-sm font-semibold">AI Analysis</span>
                        <span className="text-xs opacity-90">$0.10 USDC</span>
                      </Button>
                      <Button
                        onClick={() => { setPaymentType('report'); setShowPayment(true); }}
                        className="h-auto py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 flex-col gap-1"
                      >
                        <span className="text-sm font-semibold">Sweep Report</span>
                        <span className="text-xs opacity-90">$0.05 USDC</span>
                      </Button>
                    </div>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                      <Layers className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex flex-col max-w-[75%]">
                      <div className="rounded-xl px-4 py-2.5 text-sm bg-background border border-border">
                        Hi! I'm Arsy, your AI wallet assistant. I can help you analyze wallets, identify dust tokens, and answer Solana questions. How can I help?
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <Layers className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : ''} max-w-[75%]`}>
                      <div
                        className={`rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-background border border-border'
                        }`}
                      >
                        {message.content}
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-background border border-border rounded-xl px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                
                {messages.length === 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground px-1">Premium Features</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => { setPaymentType('analyze'); setShowPayment(true); }}
                        className="h-auto py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-col gap-1"
                      >
                        <span className="text-sm font-semibold">AI Analysis</span>
                        <span className="text-xs opacity-90">$0.10 USDC</span>
                      </Button>
                      <Button
                        onClick={() => { setPaymentType('report'); setShowPayment(true); }}
                        className="h-auto py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 flex-col gap-1"
                      >
                        <span className="text-sm font-semibold">Sweep Report</span>
                        <span className="text-xs opacity-90">$0.05 USDC</span>
                      </Button>
                    </div>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs font-medium text-muted-foreground px-1">Quick actions</p>
                    {quickActions.map((action, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleQuickAction(action.action)}
                        variant="outline"
                        className="w-full justify-start text-sm h-auto py-2.5 px-3 gap-2"
                      >
                        <span className="text-base">{action.icon}</span>
                        <span>{action.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
              <div className="flex gap-2 items-center">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your wallet..."
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-9 w-9 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Powered by api.arsweep.fun • Real-time AI
              </p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="flex-1 m-0 overflow-auto data-[state=inactive]:hidden">
            <div className="p-5">
              <NotificationSettings />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      <X402PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        serviceType={paymentType}
      />
    </Dialog>
  );
}
