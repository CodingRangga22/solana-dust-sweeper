import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

const AnimatedCounter = ({ value, className = "" }: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    // Check if value is purely numeric
    const numMatch = value.match(/^([\d.]+)(.*)$/);
    if (!numMatch) {
      setDisplay(value);
      return;
    }

    const target = parseFloat(numMatch[1]);
    const suffix = numMatch[2] || "";
    const isDecimal = numMatch[1].includes(".");
    const decimalPlaces = isDecimal ? (numMatch[1].split(".")[1]?.length || 0) : 0;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      if (isDecimal) {
        setDisplay(current.toFixed(decimalPlaces) + suffix);
      } else {
        setDisplay(Math.round(current).toString() + suffix);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [isInView, value]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      {display}
    </motion.span>
  );
};

export default AnimatedCounter;
