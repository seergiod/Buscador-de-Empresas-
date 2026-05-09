import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Trash2, Download, ExternalLink, Copy, Check, Plus, Inbox, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard-shell";
import { FullLoader, Loader } from "@/components/loader";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard · LeadMapper" }] }),
});

type SavedSearch = {
  id: string;
  name: string;
  location_label: string | null;
  filters: any;
  created_at: string;
  results_count?: number;
};

type Result = {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  rating: number | null;
  contacted: boolean;
};

function DashboardPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [searches, setSearches] = useState<SavedSearch[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("searches")
        .select("id, name, location_label, filters, created_at, search_results(count)")
        .order("created_at", { ascending: false });
      if (error) { toast.error(error.message); return; }
      const mapped = (data ?? []).map((s: any) => ({
        ...s, results_count: s.search_results?.[0]?.count ?? 0,
      }));
      setSearches(mapped);
    })();
  }, [user]);

  const seedDemo = async () => {
    if (!user) return;
    const { data: s, error } = await supabase
      .from("searches")
      .insert({
        user_id: user.id,
        name: "Restaurantes en Valencia · 5km",
        location_label: "Valencia, España",
        filters: { radius: 5000, types: ["restaurante"], minRating: 3 },
      })
      .select()
      .single();
    if (error || !s) { toast.error(error?.message ?? "Error"); return; }
    const samples = [
      { name: "Bar El Rincón", category: "Restaurante", address: "C/ Sorní 12, Valencia", phone: "+34 961 23 45 67", email: null, rating: 4.4 },
      { name: "Taller Mecánico Pepe", category: "Taller", address: "Av. del Cid 78, Valencia", phone: "+34 963 11 22 33", email: "pepe@example.com", rating: 4.8 },
      { name: "Peluquería Carmen", category: "Belleza", address: "C/ Colón 5, Valencia", phone: "+34 962 99 88 77", email: null, rating: 4.2 },
      { name: "Panadería La Espiga", category: "Tienda", address: "C/ Játiva 22, Valencia", phone: "+34 961 55 44 33", email: null, rating: 4.6 },
    ];
    await supabase.from("search_results").insert(
      samples.map((r) => ({ search_id: s.id, ...r, contacted: false, raw_data: null }))
    );
    toast.success("Búsqueda demo creada");
    setSearches((prev) => [{ ...s, results_count: samples.length } as SavedSearch, ...(prev ?? [])]);
    setOpenId(s.id);
  };

  const removeSearch = async (id: string) => {
    if (!confirm("¿Eliminar esta búsqueda y sus resultados?")) return;
    const { error } = await supabase.from("searches").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setSearches((prev) => (prev ?? []).filter((s) => s.id !== id));
    toast.success("Búsqueda eliminada");
  };

  if (loading || !user) return <FullLoader />;

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mis búsquedas</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona tus leads de negocios sin web</p>
          </div>
          <div className="flex gap-2">
            <button onClick={seedDemo} className="text-sm inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-[var(--neon)] transition">
              <Sparkles className="w-4 h-4" /> Crear demo
            </button>
            <Link to="/buscar" className="text-sm inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--neon)] text-[#04140b] font-semibold">
              <Plus className="w-4 h-4" /> Nueva búsqueda
            </Link>
          </div>
        </div>

        {searches === null ? (
          <Loader label="Cargando búsquedas..." />
        ) : searches.length === 0 ? (
          <EmptyState onSeed={seedDemo} />
        ) : (
          <motion.div
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="space-y-3"
          >
            {searches.map((s) => (
              <SearchAccordion
                key={s.id} search={s} open={openId === s.id}
                onToggle={() => setOpenId(openId === s.id ? null : s.id)}
                onDelete={() => removeSearch(s.id)}
              />
            ))}
          </motion.div>
        )}
      </div>
    </DashboardShell>
  );
}

function EmptyState({ onSeed }: { onSeed: () => void }) {
  return (
    <div className="card-luxe rounded-2xl p-16 text-center">
      <Inbox className="w-12 h-12 text-[var(--neon)] mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Aún no tienes búsquedas</h3>
      <p className="text-sm text-muted-foreground mb-6">Empieza creando una búsqueda de demostración o ve a buscar negocios.</p>
      <button onClick={onSeed} className="px-5 py-2.5 rounded-full bg-[var(--neon)] text-[#04140b] font-semibold inline-flex items-center gap-2">
        <Sparkles className="w-4 h-4" /> Crear búsqueda demo
      </button>
    </div>
  );
}

const itemFade: any = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function SearchAccordion({ search, open, onToggle, onDelete }: {
  search: SavedSearch; open: boolean; onToggle: () => void; onDelete: () => void;
}) {
  const [results, setResults] = useState<Result[] | null>(null);
  const [sortKey, setSortKey] = useState<keyof Result>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open || results) return;
    (async () => {
      const { data } = await supabase
        .from("search_results")
        .select("id, name, category, address, phone, email, rating, contacted")
        .eq("search_id", search.id);
      setResults(data ?? []);
    })();
  }, [open, results, search.id]);

  const filtered = useMemo(() => {
    if (!results) return [];
    const q = query.toLowerCase();
    const filt = q ? results.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q))) : results;
    return [...filt].sort((a, b) => {
      const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [results, sortKey, sortAsc, query]);

  const toggleContacted = async (id: string, current: boolean) => {
    await supabase.from("search_results").update({ contacted: !current }).eq("id", id);
    setResults((prev) => prev?.map((r) => r.id === id ? { ...r, contacted: !current } : r) ?? null);
  };

  const exportCsv = () => {
    if (!results) return;
    const headers = ["Nombre", "Categoría", "Dirección", "Teléfono", "Email", "Valoración", "Contactado"];
    const rows = results.map((r) => [r.name, r.category, r.address, r.phone, r.email, r.rating, r.contacted ? "sí" : "no"]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${search.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const sort = (k: keyof Result) => { sortKey === k ? setSortAsc(!sortAsc) : (setSortKey(k), setSortAsc(true)); };

  const labels: Record<string, string> = { name: "Nombre", category: "Categoría", address: "Dirección", phone: "Teléfono", email: "Email", rating: "⭐" };

  return (
    <motion.div variants={itemFade} className="card-luxe rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left">
        <div className="min-w-0">
          <div className="font-semibold truncate">{search.name}</div>
          <div className="flex flex-wrap gap-2 mt-2 items-center text-xs text-muted-foreground">
            <span>{new Date(search.created_at).toLocaleDateString("es-ES")}</span>
            <span>·</span>
            <span>{search.results_count ?? 0} resultados</span>
            {search.location_label && (<><span>·</span><span>{search.location_label}</span></>)}
            {search.filters?.types?.map((t: string) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-secondary border border-border">{t}</span>
            ))}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }} className="overflow-hidden"
          >
            <div className="border-t border-border p-5">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <input
                  placeholder="Buscar en resultados..." value={query} onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-input border border-border text-sm outline-none focus:border-[var(--neon)]"
                />
                <button onClick={exportCsv} className="px-3 py-2 rounded-lg border border-border hover:border-[var(--neon)] text-sm inline-flex items-center gap-2">
                  <Download className="w-4 h-4" /> CSV
                </button>
                <button onClick={onDelete} className="px-3 py-2 rounded-lg border border-border hover:border-destructive text-sm inline-flex items-center gap-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>

              {results === null ? (
                <Loader label="Cargando resultados..." />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary text-xs text-muted-foreground">
                      <tr>
                        {(["name", "category", "address", "phone", "email", "rating"] as (keyof Result)[]).map((k) => (
                          <th key={k as string} onClick={() => sort(k)} className="text-left px-4 py-3 font-medium cursor-pointer select-none whitespace-nowrap">
                            {labels[k as string]}
                            {sortKey === k && <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>}
                          </th>
                        ))}
                        <th className="text-left px-4 py-3 font-medium">Web</th>
                        <th className="text-left px-4 py-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                        <tr key={r.id} className="border-t border-border hover:bg-secondary/50">
                          <td className="px-4 py-3 font-medium whitespace-nowrap">{r.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{r.category ?? "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{r.address ?? "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.phone ?? "—"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{r.email ?? <span className="opacity-50">No disponible</span>}</td>
                          <td className="px-4 py-3">{r.rating ?? "—"}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-xs whitespace-nowrap">Sin web</span></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <a target="_blank" rel="noreferrer" href={`https://maps.google.com/?q=${encodeURIComponent(r.name + " " + (r.address ?? ""))}`} title="Ver en Maps" className="text-muted-foreground hover:text-[var(--neon)]"><ExternalLink className="w-4 h-4" /></a>
                              <button onClick={() => { navigator.clipboard.writeText([r.name, r.address, r.phone, r.email].filter(Boolean).join(" · ")); toast.success("Copiado"); }} title="Copiar" className="text-muted-foreground hover:text-foreground"><Copy className="w-4 h-4" /></button>
                              <button onClick={() => toggleContacted(r.id, r.contacted)} title="Marcar contactado" className={`${r.contacted ? "text-[var(--neon)]" : "text-muted-foreground hover:text-foreground"}`}><Check className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-sm">Sin resultados</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}