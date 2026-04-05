import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "scroll-reveal-style";
    if (!document.getElementById("scroll-reveal-style")) {
      style.textContent = `
        .sr { opacity: 0; transform: translateY(28px); transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1); }
        .sr.on { opacity: 1 !important; transform: none !important; }
      `;
      document.head.appendChild(style);
    }

    const t = setTimeout(() => {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("on"); obs.unobserve(e.target); }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

      document.querySelectorAll("h1, h2, h3, p, .ar-fade-in").forEach((el, i) => {
        if (!el.classList.contains("sr")) {
          el.classList.add("sr");
          (el as HTMLElement).style.transitionDelay = `${(i % 5) * 0.1}s`;
        }
        obs.observe(el);
      });
    }, 400);

    return () => clearTimeout(t);
  }, []);
}
