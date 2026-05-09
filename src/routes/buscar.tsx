import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";

export const Route = createFileRoute("/buscar")({
  component: BuscarPage,
  head: () => ({ meta: [{ title: "Buscar negocios · LeadMapper" }] }),
});

function BuscarPage() {
  return (
    <div className="min-h-screen bg-deep">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[var(--neon)]" />
            <span style={{ fontFamily: "var(--font-display)" }}>LeadMapper</span>
          </Link>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Iniciar sesión</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-luxe rounded-2xl p-12 text-center">
          <Search className="w-12 h-12 text-[var(--neon)] mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-3">Búsqueda de negocios</h1>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            La búsqueda en mapa con Google Places llegará en la próxima fase. Por ahora, crea tu cuenta para guardar leads desde el dashboard.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/registro" className="px-5 py-2.5 rounded-full bg-[var(--neon)] text-[#04140b] font-semibold">Crear cuenta</Link>
            <Link to="/dashboard" className="px-5 py-2.5 rounded-full border border-border hover:border-[var(--neon)] transition inline-flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Ir al dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}