import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedScrambleTextProps = {
  text: string;
  className?: string;
  /**
   * Total duration for the reveal (ms).
   * Keep <= 1200 for snappy UI.
   */
  durationMs?: number;
  /** Delay before starting (ms). */
  delayMs?: number;
  /** Characters used while scrambling. */
  glyphs?: string;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export default function AnimatedScrambleText({
  text,
  className,
  durationMs = 900,
  delayMs = 0,
  glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-=_+*/~",
}: AnimatedScrambleTextProps) {
  const [out, setOut] = useState(text);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setOut(text);
      return;
    }

    const safeText = text ?? "";
    const letters = safeText.split("");

    // Start from fully scrambled (same length).
    const randChar = () => glyphs[Math.floor(Math.random() * glyphs.length)] ?? "·";
    setOut(letters.map((c) => (c === " " ? " " : randChar())).join(""));

    const tick = (t: number) => {
      if (startRef.current == null) startRef.current = t + delayMs;
      const startAt = startRef.current;
      const elapsed = t - startAt;
      const p = clamp01(elapsed / durationMs);

      // Reveal characters progressively (slightly eased).
      const eased = 1 - Math.pow(1 - p, 2.2);
      const revealCount = Math.floor(eased * letters.length);

      const next = letters
        .map((c, i) => {
          if (c === " ") return " ";
          if (i < revealCount) return c;
          // Keep scrambling the rest.
          return randChar();
        })
        .join("");

      setOut(next);

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setOut(safeText);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
    };
  }, [text, durationMs, delayMs, glyphs, reducedMotion]);

  return <span className={className}>{out}</span>;
}

