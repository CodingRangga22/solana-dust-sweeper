import { motion } from "framer-motion";
import { Check, Clock, Rocket, Zap, Code2, Globe } from "lucide-react";

const milestones = [
  {
    label: "Devnet Testing",
    status: "current",
    desc: "Live Now",
    detail: "Program deployed, sweep working end-to-end with Jupiter API integration.",
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Smart Contract Audit",
    status: "upcoming",
    desc: "Next",
    detail: "Third-party security audit before mainnet deployment.",
    icon: Check,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    label: "Mainnet Launch",
    status: "upcoming",
    desc: "Planned",
    detail: "Full mainnet deployment with real SOL. Announcement on X.",
    icon: Rocket,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    label: "Advanced Batch Automation",
    status: "upcoming",
    desc: "Roadmap",
    detail: "Sweep up to 20 accounts per transaction. Scheduled auto-sweep.",
    icon: Globe,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  {
    label: "API Access",
    status: "upcoming",
    desc: "Future",
    detail: "Public REST API for developers to integrate Arsweep into their apps.",
    icon: Code2,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
];

const RoadmapSection = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="py-24 px-4 relative"
  >
    <div className="container mx-auto max-w-3xl">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-4">
          <Rocket className="w-3 h-3" /> Roadmap
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
          Product <span className="gradient-text">Roadmap</span>
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Our path to mainnet and beyond.
        </p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-primary via-primary/30 to-transparent" />

        <div className="space-y-4">
          {milestones.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative flex items-start gap-5 pl-16"
              >
                {/* Icon dot */}
                <div className={`absolute left-2 w-8 h-8 rounded-full flex items-center justify-center ${m.bg} ${m.status === "current" ? "ring-4 ring-primary/20" : ""}`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>

                {/* Card */}
                <div className={`glass rounded-xl p-5 flex-1 border transition-all duration-200 ${
                  m.status === "current"
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/50 hover:border-border"
                }`}>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-foreground">{m.label}</h3>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      m.status === "current"
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {m.desc}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </motion.section>
);

export default RoadmapSection;
