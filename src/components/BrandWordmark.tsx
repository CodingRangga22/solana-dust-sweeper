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
      className={`inline-block font-sans font-extrabold uppercase leading-none tracking-[-0.03em] antialiased text-foreground dark:text-white ${sizeClass} ${className}`}
      style={{
        fontFamily: "var(--font-landing-section)",
        // Keep dark mode wordmark pure white; light mode gets subtle cyan sheen.
        textShadow: "0 1px 0 rgba(255,255,255,0.35), 0 0 18px hsla(220,9%,46%,0.18)",
      }}
    >
      {children}
    </span>
  );
}
