import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";

const milestones = [
  { label: "Devnet Testing", status: "current", desc: "Current" },
  { label: "Smart Contract Audit", status: "upcoming", desc: "Next" },
  { label: "Mainnet Launch", status: "upcoming", desc: "Planned" },
  { label: "Advanced Batch Automation", status: "upcoming", desc: "Roadmap" },
  { label: "API Access", status: "upcoming", desc: "Future" },
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
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-foreground">
          Product <span className="gradient-text">Roadmap</span>
        </h2>
        <p className="text-muted-foreground">
          Our path to mainnet and beyond.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />
        <div className="space-y-0">
          {milestones.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative flex items-start gap-4 pl-12 pb-8 last:pb-0"
            >
              <div
                className={`absolute left-2 w-4 h-4 rounded-full flex items-center justify-center ${
                  m.status === "current"
                    ? "gradient-bg ring-4 ring-primary/20"
                    : "bg-muted border-2 border-border"
                }`}
              >
                {m.status === "current" ? (
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                ) : (
                  <Circle className="w-2 h-2 text-muted-foreground" />
                )}
              </div>
              <div className="glass rounded-xl p-4 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">{m.label}</h3>
                  {m.status === "current" && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {m.desc}
                    </span>
                  )}
                </div>
                {m.status !== "current" && (
                  <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </motion.section>
);

export default RoadmapSection;
