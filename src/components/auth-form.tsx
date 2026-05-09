import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Loader } from "./loader";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      toast.error("Email válido y contraseña de al menos 6 caracteres");
      return;
    }
    setLoading(true);
    const fn = isSignup ? signUp : signIn;
    const { error } = await fn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(isSignup ? "Cuenta creada. Revisa tu email." : "Bienvenido de vuelta");
    if (!isSignup) nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative w-full max-w-md card-luxe rounded-2xl p-8"
      >
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-[var(--neon)]" />
          <span style={{ fontFamily: "var(--font-display)" }} className="font-semibold">LeadMapper</span>
        </Link>
        <h1 className="text-3xl font-bold mb-1">
          {isSignup ? "Crea tu cuenta" : "Inicia sesión"}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {isSignup ? "Empieza a encontrar negocios sin web hoy mismo." : "Accede a tus búsquedas guardadas."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="mt-1 w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground outline-none focus:border-[var(--neon)] transition"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Contraseña</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" minLength={6}
              className="mt-1 w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground outline-none focus:border-[var(--neon)] transition"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-[var(--neon)] text-[#04140b] font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader /> : (isSignup ? "Crear cuenta" : "Entrar")}
          </button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          {isSignup ? (
            <>¿Ya tienes cuenta? <Link to="/login" className="text-[var(--neon)] hover:underline">Inicia sesión</Link></>
          ) : (
            <>¿No tienes cuenta? <Link to="/registro" className="text-[var(--neon)] hover:underline">Regístrate</Link></>
          )}
        </p>
      </motion.div>
    </div>
  );
}