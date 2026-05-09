import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Search, Settings, LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const items = [
    { to: "/dashboard", label: "Búsquedas", icon: LayoutDashboard },
    { to: "/buscar", label: "Nueva búsqueda", icon: Search },
  ];

  const initials = user?.email?.[0]?.toUpperCase() ?? "?";

  const onSignOut = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    nav({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-deep flex">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-[oklch(0.135_0.012_155)] border-r border-border flex flex-col transform transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 px-6 flex items-center justify-between border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[var(--neon)]" />
            <span style={{ fontFamily: "var(--font-display)" }}>LeadMapper</span>
          </Link>
          <button onClick={() => setOpen(false)} className="md:hidden text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => {
            const active = path === it.to;
            return (
              <Link
                key={it.to} to={it.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active ? "bg-[oklch(0.88_0.24_152/0.12)] text-[var(--neon)]" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <it.icon className="w-4 h-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--neon)] text-[#04140b] flex items-center justify-center font-bold text-sm">{initials}</div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={onSignOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition">
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden h-14 px-4 flex items-center border-b border-border">
          <button onClick={() => setOpen(true)} className="text-foreground"><Menu className="w-5 h-5" /></button>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}