import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import ArsweepLogo from "./ArsweepLogo";

const FAQ_ITEMS = [
  { label: "How it works?", answer: "Connect your wallet, we scan for empty token accounts and scam airdrops, then you close them to reclaim your SOL rent deposits — all in one click!" },
  { label: "Is it safe?", answer: "Absolutely! Arsweep only requires read-only access to scan your wallet. We never ask for private keys. The code is fully open source and community-audited." },
  { label: "What are the fees?", answer: "You receive your gross refund (0.00204 SOL per account) minus the Solana network gas fee and a 1% Arsweep service fee. The exact breakdown is shown before you confirm." },
];

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: "Hi! 👋 I'm the Arsweep Assistant. How can I help you clean your wallet today?" },
  ]);

  const handleFaq = (item: typeof FAQ_ITEMS[number]) => {
    setMessages((prev) => [
      ...prev,
      { from: "user", text: item.label },
      { from: "bot", text: item.answer },
    ]);
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-bg shadow-lg flex items-center justify-center text-primary-foreground hover:shadow-[0_0_30px_hsla(162,93%,51%,0.3)] transition-shadow duration-300"
        aria-label="Customer Support"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-destructive border-2 border-background animate-pulse" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 glass rounded-2xl overflow-hidden shadow-[0_8px_32px_hsla(0,0%,0%,0.5)]"
          >
            {/* Header */}
            <div className="gradient-bg px-5 py-4 flex items-center gap-3">
              <ArsweepLogo className="w-7 h-7 text-primary-foreground" />
              <div>
                <p className="text-sm font-bold text-primary-foreground">Arsweep Assistant</p>
                <p className="text-xs text-primary-foreground/70">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 h-64 overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-sm px-4 py-3 rounded-xl max-w-[85%] ${
                    msg.from === "bot"
                      ? "glass rounded-tl-none text-foreground"
                      : "ml-auto gradient-bg rounded-tr-none text-primary-foreground"
                  }`}
                >
                  {msg.text}
                </div>
              ))}

              {/* FAQ Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {FAQ_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleFaq(item)}
                    className="text-xs glass glass-hover px-3 py-1.5 rounded-full text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border px-4 py-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                disabled
              />
              <button
                disabled
                className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-primary-foreground opacity-50 cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
