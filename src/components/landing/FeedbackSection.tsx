import { motion } from "framer-motion";
import { MessageCircle, Bug, Lightbulb } from "lucide-react";

const feedbackActions = [
  {
    icon: MessageCircle,
    label: "Join Discord",
    description: "Chat with the team and community",
    href: "https://discord.gg/D2rtvK3fBs",
    target: "_blank",
  },
  {
    icon: Bug,
    label: "Report Bug",
    description: "Help us fix issues on Devnet",
    href: "#",
  },
  {
    icon: Lightbulb,
    label: "Suggest Feature",
    description: "Share ideas for improvement",
    href: "#",
  },
];

const FeedbackSection = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="py-24 px-4 relative"
  >
    <div className="container mx-auto max-w-4xl">
      <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
        <div className="orb w-40 h-40 bg-primary/20 -top-20 -right-20" />
        <div className="orb w-32 h-32 bg-secondary/20 -bottom-16 -left-16" />

        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-foreground relative z-10">
          Help Us Improve <span className="gradient-text" translate="no"><span translate="no">Arsweep</span></span>
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto relative z-10">
          We&apos;re on Devnet and need your feedback. Join the conversation, report bugs, or suggest features.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          {feedbackActions.map((action, i) => (
            <motion.a
              key={action.label}
              href={action.href}
              target={action.target || "_self"}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03, boxShadow: "0 0 24px hsla(162, 93%, 51%, 0.2)" }}
              whileTap={{ scale: 0.97 }}
              className="glass glass-hover flex flex-col items-center gap-2 px-8 py-6 rounded-2xl border border-border hover:border-primary/30 transition-colors min-w-[160px]"
            >
              <action.icon className="w-8 h-8 text-primary" />
              <span className="font-semibold text-foreground">{action.label}</span>
              <span className="text-xs text-muted-foreground">{action.description}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  </motion.section>
);

export default FeedbackSection;
