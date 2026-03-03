import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Phase = "scan" | "detect" | "sweep" | "confirm" | "complete";

const accounts = [
  "9sk3...LpQz",
  "4Gh2...Xk92",
  "8Ls1...TqP3",
  "2Kd9...AsL1",
  "7Zp3...QwL9",
];

export default function HeroDemo() {
  const [phase, setPhase] = useState<Phase>("scan");
  const [index, setIndex] = useState(-1);
  const [closed, setClosed] = useState(0);
  const [total, setTotal] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const rent = 0.00203928;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    switch (phase) {
      case "scan":
        setLogs(["Connecting to RPC…"]);
        timer = setTimeout(() => {
          setLogs((l) => [...l, "Scanning wallet token accounts…"]);
          setPhase("detect");
        }, 1000);
        break;

      case "detect":
        if (index < accounts.length - 1) {
          timer = setTimeout(() => {
            setIndex((i) => i + 1);
            setLogs((l) => [...l, `Empty account detected: ${accounts[index + 1]}`]);
          }, 600);
        } else {
          timer = setTimeout(() => setPhase("sweep"), 800);
        }
        break;

      case "sweep":
        if (closed < accounts.length) {
          timer = setTimeout(() => {
            setClosed((c) => c + 1);
            setTotal((t) => t + rent);
            setLogs((l) => [...l, `Closing account ${accounts[closed]}…`]);
          }, 700);
        } else {
          timer = setTimeout(() => setPhase("confirm"), 1000);
        }
        break;

      case "confirm":
        setLogs((l) => [...l, "Transaction submitted to Solana network…"]);
        timer = setTimeout(() => setPhase("complete"), 1500);
        break;

      case "complete":
        setLogs((l) => [...l, "Sweep successful ✓ Rent reclaimed."]);
        timer = setTimeout(() => {
          setPhase("scan");
          setIndex(-1);
          setClosed(0);
          setTotal(0);
          setLogs([]);
        }, 5000);
        break;
    }

    return () => clearTimeout(timer);
  }, [phase, index, closed]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-2xl bg-black/70 backdrop-blur-2xl border border-white/10 shadow-[0_0_60px_rgba(0,255,200,0.08)] p-6">

        {/* Header */}
        <div className="flex justify-between mb-6">
          <div>
            <div className="text-xs text-white/40">Wallet</div>
            <div className="text-sm text-emerald-400">7Gh3...X9kL</div>
          </div>

          <motion.div
            key={total}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold text-emerald-400"
          >
            +{total.toFixed(5)} SOL
          </motion.div>
        </div>

        {/* Accounts */}
        <div className="space-y-2 mb-6">
          {accounts.map((acc, i) => {
            const detected = i <= index;
            const closedAcc = i < closed;

            return (
              <div
                key={i}
                className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <span className="text-sm text-white">{acc}</span>

                {closedAcc && (
                  <span className="text-xs text-black bg-emerald-400 px-3 py-1 rounded-full">
                    Closed
                  </span>
                )}

                {!closedAcc && detected && (
                  <span className="text-xs text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
                    Closing…
                  </span>
                )}

                {!detected && (
                  <span className="text-xs text-white/30 bg-white/10 px-3 py-1 rounded-full">
                    Pending
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* RPC Log Feed */}
        <div className="bg-black/60 rounded-xl p-4 h-40 overflow-hidden border border-white/10">
          <div className="text-xs text-white/40 mb-2">Execution Log</div>
          <div className="space-y-1 text-xs font-mono text-white/70">
            {logs.slice(-6).map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {log}
              </motion.div>
            ))}
          </div>
        </div>

        {phase === "complete" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-emerald-400 font-semibold"
          >
            Sweep Completed ✓
          </motion.div>
        )}
      </div>
    </div>
  );
}