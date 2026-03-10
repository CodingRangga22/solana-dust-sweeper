import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Zap, Shield, Coins } from "lucide-react";

const Demo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/20 mb-4">
            <Play className="w-3 h-3" />
            Live Demo
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-3">See Arsweep in Action</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Watch how Arsweep scans your wallet, finds dust tokens, and reclaims your locked SOL in seconds.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-border/50 shadow-2xl mb-10">
          <video src="/demo.mp4" controls className="w-full">
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="glass rounded-xl p-5 border border-border/50 text-center">
            <Zap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-foreground mb-1">Fast Scan</h3>
            <p className="text-muted-foreground text-xs">Scans your entire wallet in under 5 seconds</p>
          </div>
          <div className="glass rounded-xl p-5 border border-border/50 text-center">
            <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-foreground mb-1">Non-Custodial</h3>
            <p className="text-muted-foreground text-xs">Your keys, your SOL. We never hold your funds</p>
          </div>
          <div className="glass rounded-xl p-5 border border-border/50 text-center">
            <Coins className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-foreground mb-1">Instant Refund</h3>
            <p className="text-muted-foreground text-xs">SOL returned to your wallet immediately</p>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={() => navigate("/app")}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Try Arsweep Now →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Demo;