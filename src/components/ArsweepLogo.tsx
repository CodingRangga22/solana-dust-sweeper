const ArsweepLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <img 
    src="/logo.png" 
    alt="Arsweep" 
    className={className}
    style={{ objectFit: "contain", display: "block" }} 
  />
);

export default ArsweepLogo;
