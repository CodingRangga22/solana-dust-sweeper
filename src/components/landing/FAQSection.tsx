import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is this safe?",
    a: "Yes. Ars​weep only closes empty token accounts (zero balance). We use the official SPL Token CloseAccount instruction. Your tokens are never touched—only empty accounts that hold rent are closed. Always verify your selection before sweeping.",
  },
  {
    q: "Do you access my private key?",
    a: "Never. Ars​weep is non-custodial. Your wallet stays in your control. Every action requires your explicit signature via Phantom or your connected wallet. We never request, store, or transmit private keys.",
  },
  {
    q: "What network are you on?",
    a: "We're live on Solana Mainnet. Real SOL is involved in all transactions. You can also try our Simulation mode first — no wallet needed.",
  },
  {
    q: "Will this work on Mainnet?",
    a: "Yes. Ars​weep will support Mainnet when ready. The flow is identical—connect, scan, sweep—but transactions will involve real SOL. We'll announce Mainnet launch prominently.",
  },
  {
    q: "Is there a fee?",
    a: "A 1.5% platform fee is deducted from reclaimed rent. The remaining 98.5% goes directly to your wallet. Network gas fees also apply. You always see the breakdown before confirming.",
  },
  {
    q: "What is Solana rent?",
    a: "Solana uses a rent mechanism to keep accounts on-chain. When you create a token account, you pay a one-time deposit (~0.002 SOL). This stays locked until you close the account. Ars​weep helps you reclaim that locked SOL from empty accounts.",
  },
];

const FAQSection = () => {
  useEffect(() => {
    const el = document.getElementById('yr-questions');
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      el.style.color = entry.isIntersecting ? 'var(--ar-yellow)' : '#FFFFFF';
    }, { threshold: 0.5, rootMargin: '0px 0px -80px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
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
        <h2 className="ar-landing-section-title" style={{ fontSize: "clamp(28px,4vw,44px)", marginBottom: 12 }}>
          Frequently Asked <span id="yr-questions" style={{color:"#FFFFFF",transition:"color 0.6s ease"}}>Questions</span>
        </h2>
        <p className="text-muted-foreground">
          Quick answers to common questions.
        </p>
      </div>

      <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,overflow:"hidden"}}>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} style={{borderColor:"rgba(255,255,255,0.08)"}} className="px-6">
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
};

export default FAQSection;
