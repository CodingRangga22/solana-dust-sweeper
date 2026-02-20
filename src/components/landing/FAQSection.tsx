import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is this safe?",
    a: "Yes. Arsweep only closes empty token accounts (zero balance). We use the official SPL Token CloseAccount instruction. Your tokens are never touched—only empty accounts that hold rent are closed. Always verify your selection before sweeping.",
  },
  {
    q: "Do you access my private key?",
    a: "Never. Arsweep is non-custodial. Your wallet stays in your control. Every action requires your explicit signature via Phantom or your connected wallet. We never request, store, or transmit private keys.",
  },
  {
    q: "What network are you on?",
    a: "We're currently on Solana Devnet for testing. No real funds are involved. You can get free Devnet SOL from the Solana faucet. Mainnet support is coming after audit completion.",
  },
  {
    q: "Will this work on Mainnet?",
    a: "Yes. Arsweep will support Mainnet when ready. The flow is identical—connect, scan, sweep—but transactions will involve real SOL. We'll announce Mainnet launch prominently.",
  },
  {
    q: "Is there a fee?",
    a: "A 1.5% platform fee is deducted from reclaimed rent. The remaining 98.5% goes directly to your wallet. Network gas fees also apply. You always see the breakdown before confirming.",
  },
  {
    q: "What is Solana rent?",
    a: "Solana uses a rent mechanism to keep accounts on-chain. When you create a token account, you pay a one-time deposit (~0.002 SOL). This stays locked until you close the account. Arsweep helps you reclaim that locked SOL from empty accounts.",
  },
];

const FAQSection = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    id="faq"
    className="py-24 px-4 relative scroll-mt-24"
  >
    <div className="container mx-auto max-w-2xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <p className="text-muted-foreground">
          Quick answers to common questions.
        </p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border px-6">
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold text-foreground pr-2">{faq.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </motion.section>
);

export default FAQSection;
