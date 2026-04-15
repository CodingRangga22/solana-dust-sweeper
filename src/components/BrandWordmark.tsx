import type { ReactNode } from "react";

type BrandWordmarkProps = {
  /** Default: "ARSWEEP" — pass e.g. "ARSWEEP DOCS" or a fragment for mixed content */
  children?: ReactNode;
  className?: string;
  /** `sm` for compact sidebars; `md` matches hero / main nav */
  size?: "sm" | "md";
};

/**
 * Same typographic voice as the Landing hero headline (Inter, 800, tight tracking).
 */
export default function BrandWordmark({ children = "ARSWEEP", className = "", size = "md" }: BrandWordmarkProps) {
  const sizeClass = size === "sm" ? "text-[13px] leading-tight" : "text-[15px] sm:text-[16px]";
  return (
    <span
      className={`inline-block font-sans font-extrabold uppercase leading-none tracking-[-0.03em] text-white antialiased ${sizeClass} ${className}`}
      style={{
        fontFamily: "var(--font-landing-section)",
        textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </span>
  );
}
