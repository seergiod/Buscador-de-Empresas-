import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Search, MapPin, Sparkles, ArrowRight, Target, Database, Send } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let w = (c.width = c.offsetWidth);
    let h = (c.height = c.offsetHeight);
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
    }));
    const mouse = { x: -999, y: -999 };
    const onMove = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onResize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) { d.vx += (dx / dist) * 0.04; d.vy += (dy / dist) * 0.04; }
        d.vx *= 0.96; d.vy *= 0.96;
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = w; if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h; if (d.y > h) d.y = 0;
        ctx.fillStyle = "rgba(0,255,136,0.45)";
        ctx.beginPath(); ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function Index() {
  return (
    <div className="min-h-screen bg-deep text-foreground">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-[oklch(0.135_0.012_155/0.6)] border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[var(--neon)] shadow-[0_0_12px_var(--neon)]" />
            <span className="text-lg" style={{ fontFamily: "var(--font-display)" }}>LeadMapper</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link to="/buscar" className="text-muted-foreground hover:text-foreground transition">Buscar</Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition">Iniciar sesión</Link>
            <Link to="/registro" className="px-4 py-2 rounded-full bg-[var(--neon)] text-[#04140b] font-medium hover:opacity-90 transition">
              Empezar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
        <Particles />
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-8">
            <Sparkles className="w-3 h-3 text-[var(--neon)]" /> v1 · Encuentra antes que nadie
          </motion.div>
          <motion.h1
            initial="hidden" animate="show" variants={fadeUp}
            className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            Encuentra negocios <span className="text-[var(--neon)]">invisibles.</span><br/>
            Hazte indispensable.
          </motion.h1>
          <motion.p
            initial="hidden" animate="show" variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { delay: 0.15, duration: 0.6 } } }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Descubre los negocios locales sin presencia online y ofréceles servicios de diseño, desarrollo y marketing antes que tu competencia.
          </motion.p>
          <motion.div
            initial="hidden" animate="show" variants={{ ...fadeUp, show: { ...fadeUp.show, transition: { delay: 0.3, duration: 0.6 } } }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/registro" className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--neon)] text-[#04140b] font-semibold hover:opacity-90 transition">
              Empezar gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link to="/buscar" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border hover:border-[var(--neon)] transition">
              Probar sin cuenta
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="grid md:grid-cols-3 gap-6"
        >
          {[
            { icon: Search, title: "Búsqueda inteligente", desc: "Filtra por ubicación, categoría y radio. Solo negocios sin web." },
            { icon: Database, title: "Datos enriquecidos", desc: "Nombre, dirección, teléfono, email y valoraciones, listos para exportar." },
            { icon: Send, title: "Pipeline de outreach", desc: "Marca contactados, exporta a CSV y construye tu cartera de clientes." },
          ].map((f, i) => (
            <motion.div key={i} variants={fadeUp} className="card-luxe rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[oklch(0.88_0.24_152/0.12)] text-[var(--neon)] mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-4xl md:text-5xl font-bold text-center mb-16">
          Cómo funciona
        </motion.h2>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            { n: "01", icon: MapPin, t: "Define tu zona", d: "Elige ubicación, radio y tipo de negocio que buscas." },
            { n: "02", icon: Target, t: "Filtra los invisibles", d: "Activa el filtro 'sin web' y obtén una lista limpia de oportunidades." },
            { n: "03", icon: Send, t: "Contacta y cierra", d: "Guarda búsquedas, exporta datos y empieza tu campaña de outreach." },
          ].map((s) => (
            <motion.div key={s.n} variants={fadeUp} className="card-luxe rounded-2xl p-8">
              <div className="text-xs text-[var(--neon)] mb-3 font-mono">{s.n}</div>
              <s.icon className="w-6 h-6 mb-4 text-[var(--neon)]" />
              <h3 className="text-xl font-semibold mb-2">{s.t}</h3>
              <p className="text-sm text-muted-foreground">{s.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--neon)]" />
            LeadMapper © {new Date().getFullYear()}
          </div>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-foreground">Iniciar sesión</Link>
            <Link to="/registro" className="hover:text-foreground">Crear cuenta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
