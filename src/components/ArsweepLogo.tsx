const ArsweepLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14F195" />
        <stop offset="100%" stopColor="#9945FF" />
      </linearGradient>
    </defs>
    {/* Broom head */}
    <path d="M8 28L14 22L20 28L26 22L32 28L30 32H10L8 28Z" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    {/* Handle with S-wave */}
    <path d="M20 22C20 22 16 18 20 14C24 10 20 6 20 6" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Sparkles */}
    <circle cx="10" cy="14" r="1" fill="#14F195" opacity="0.7" />
    <circle cx="30" cy="10" r="1.2" fill="#9945FF" opacity="0.7" />
    <circle cx="28" cy="18" r="0.8" fill="#14F195" opacity="0.5" />
  </svg>
);

export default ArsweepLogo;
