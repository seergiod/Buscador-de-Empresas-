import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const pos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (matchMedia("(max-width: 768px)").matches) return;
    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
      }
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const clickable = t.closest("a, button, [role='button'], input, textarea, select, label[for]");
      if (ring.current) {
        ring.current.style.transform += ` scale(${clickable ? 1.6 : 1})`;
        ring.current.dataset.hover = clickable ? "1" : "0";
      }
    };
    let raf = 0;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;
      if (ring.current) {
        const scale = ring.current.dataset.hover === "1" ? 1.7 : 1;
        ring.current.style.transform = `translate(${pos.current.x - 16}px, ${pos.current.y - 16}px) scale(${scale})`;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden md:block"
        style={{
          width: 6, height: 6, borderRadius: 999,
          background: "var(--neon)",
          boxShadow: "0 0 12px var(--neon)",
          willChange: "transform",
        }}
      />
      <div
        ref={ring}
        className="pointer-events-none fixed top-0 left-0 z-[9998] hidden md:block transition-[border-color] duration-200"
        style={{
          width: 32, height: 32, borderRadius: 999,
          border: "1.5px solid color-mix(in oklab, var(--neon) 70%, transparent)",
          willChange: "transform",
        }}
      />
    </>
  );
}