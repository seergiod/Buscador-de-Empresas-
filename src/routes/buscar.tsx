/// <reference types="google.maps" />
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { ArrowLeft, Globe, Loader2, MapPin, Phone, Save, Search, Star } from "lucide-react";
import { getMapsConfig } from "@/lib/maps.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/buscar")({
  component: BuscarPage,
  head: () => ({
    meta: [
      { title: "Buscar negocios sin web · LeadMapper" },
      { name: "description", content: "Encuentra negocios locales sin presencia web con Google Places y guárdalos como leads." },
    ],
  }),
});

type Lead = {
  place_id: string;
  name: string;
  address?: string;
  category?: string;
  rating?: number;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
};

const CATEGORIES = [
  { value: "restaurant", label: "Restaurantes" },
  { value: "cafe", label: "Cafeterías" },
  { value: "bakery", label: "Panaderías" },
  { value: "beauty_salon", label: "Peluquerías" },
  { value: "gym", label: "Gimnasios" },
  { value: "store", label: "Tiendas" },
  { value: "lawyer", label: "Abogados" },
  { value: "dentist", label: "Dentistas" },
  { value: "plumber", label: "Fontaneros" },
  { value: "real_estate_agency", label: "Inmobiliarias" },
];

const NEON = "#00FF88";

function BuscarPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [query, setQuery] = useState("Madrid, España");
  const [category, setCategory] = useState("restaurant");
  const [radius, setRadius] = useState(2000);
  const [onlyNoWeb, setOnlyNoWeb] = useState(true);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Lead[]>([]);
  const [tab, setTab] = useState<"map" | "list">("map");
  const [saving, setSaving] = useState(false);

  // Init map
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { apiKey } = await getMapsConfig();
        setOptions({ key: apiKey, v: "weekly" });
        await importLibrary("maps");
        await importLibrary("places");
        if (cancelled || !mapRef.current) return;
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: 40.4168, lng: -3.7038 },
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          styles: DARK_MAP_STYLE,
        });
        placesService.current = new google.maps.places.PlacesService(mapInstance.current);
        geocoderRef.current = new google.maps.Geocoder();
        setMapReady(true);
      } catch (e: any) {
        setMapError(e?.message ?? "No se pudo cargar el mapa");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleResults = useMemo(
    () => (onlyNoWeb ? results.filter((r) => !r.website) : results),
    [results, onlyNoWeb],
  );

  // Render markers
  useEffect(() => {
    if (!mapInstance.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = visibleResults.map((r) => {
      const marker = new google.maps.Marker({
        position: { lat: r.lat, lng: r.lng },
        map: mapInstance.current!,
        title: r.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: r.website ? "#9aa39c" : NEON,
          fillOpacity: 1,
          strokeColor: "#04140b",
          strokeWeight: 2,
        },
      });
      const info = new google.maps.InfoWindow({
        content: `<div style="color:#04140b;font-family:DM Sans,sans-serif"><strong>${escape(r.name)}</strong><br/>${escape(r.address ?? "")}<br/>${r.website ? '<span style="color:#888">Tiene web</span>' : '<span style="color:#0a7a44;font-weight:600">Sin web ✓</span>'}</div>`,
      });
      marker.addListener("click", () => info.open(mapInstance.current!, marker));
      return marker;
    });
  }, [visibleResults]);

  async function handleSearch() {
    if (!mapInstance.current || !placesService.current || !geocoderRef.current) return;
    setSearching(true);
    setResults([]);
    try {
      const geo = await geocoderRef.current.geocode({ address: query });
      if (!geo.results.length) {
        toast.error("Ubicación no encontrada");
        return;
      }
      const loc = geo.results[0].geometry.location;
      mapInstance.current.setCenter(loc);
      mapInstance.current.setZoom(14);

      const nearby = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        placesService.current!.nearbySearch(
          { location: loc, radius, type: category },
          (res, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && res) resolve(res);
            else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) resolve([]);
            else reject(new Error(`Places error: ${status}`));
          },
        );
      });

      // Fetch details to get website + phone
      const detailed = await Promise.all(
        nearby.slice(0, 20).map(
          (p) =>
            new Promise<Lead | null>((resolve) => {
              if (!p.place_id) return resolve(null);
              placesService.current!.getDetails(
                { placeId: p.place_id, fields: ["name", "formatted_address", "website", "formatted_phone_number", "rating", "geometry", "types"] },
                (d, status) => {
                  if (status !== google.maps.places.PlacesServiceStatus.OK || !d || !d.geometry?.location) return resolve(null);
                  resolve({
                    place_id: p.place_id!,
                    name: d.name ?? p.name ?? "Sin nombre",
                    address: d.formatted_address,
                    category: d.types?.[0],
                    rating: d.rating,
                    phone: d.formatted_phone_number,
                    website: d.website,
                    lat: d.geometry.location.lat(),
                    lng: d.geometry.location.lng(),
                  });
                },
              );
            }),
        ),
      );
      const leads = detailed.filter((x): x is Lead => !!x);
      setResults(leads);
      const noWeb = leads.filter((l) => !l.website).length;
      toast.success(`${leads.length} negocios encontrados · ${noWeb} sin web`);
    } catch (e: any) {
      toast.error(e?.message ?? "Error en la búsqueda");
    } finally {
      setSearching(false);
    }
  }

  async function handleSave() {
    if (!user) {
      toast.error("Inicia sesión para guardar leads");
      navigate({ to: "/login" });
      return;
    }
    if (visibleResults.length === 0) {
      toast.error("No hay resultados que guardar");
      return;
    }
    setSaving(true);
    try {
      const { data: search, error: e1 } = await supabase
        .from("searches")
        .insert({
          user_id: user.id,
          name: `${CATEGORIES.find((c) => c.value === category)?.label ?? category} · ${query}`,
          location_label: query,
          filters: { category, radius, onlyNoWeb },
        })
        .select()
        .single();
      if (e1 || !search) throw e1;
      const rows = visibleResults.map((r) => ({
        search_id: search.id,
        place_id: r.place_id,
        name: r.name,
        address: r.address,
        category: r.category,
        rating: r.rating,
        phone: r.phone,
        raw_data: r as any,
      }));
      const { error: e2 } = await supabase.from("search_results").insert(rows);
      if (e2) throw e2;
      toast.success(`Guardados ${rows.length} leads`);
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      toast.error(e?.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/60 backdrop-blur sticky top-0 z-20 bg-background/80">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: NEON, boxShadow: `0 0 8px ${NEON}` }} />
            <span style={{ fontFamily: "var(--font-display)" }}>LeadMapper</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || visibleResults.length === 0}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-40 transition"
              style={{ background: NEON, color: "#04140b" }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar búsqueda
            </button>
            {!user && !authLoading && (
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <aside className="border-r border-border/60 p-5 space-y-5 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Ubicación</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ciudad, barrio, dirección…"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary/60 border border-border focus:border-[color:var(--primary)] outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Categoría</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${
                    category === c.value
                      ? "border-[color:var(--primary)] text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                  style={category === c.value ? { background: "rgba(0,255,136,0.08)" } : {}}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex justify-between">
              <span>Radio</span>
              <span style={{ color: NEON }}>{(radius / 1000).toFixed(1)} km</span>
            </label>
            <input
              type="range"
              min={500}
              max={10000}
              step={500}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-[color:var(--primary)]"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-border hover:border-[color:var(--primary)]/40 transition">
            <input
              type="checkbox"
              checked={onlyNoWeb}
              onChange={(e) => setOnlyNoWeb(e.target.checked)}
              className="w-4 h-4 accent-[color:var(--primary)]"
            />
            <div>
              <div className="text-sm font-medium">Solo sin web</div>
              <div className="text-xs text-muted-foreground">Filtra negocios sin sitio web</div>
            </div>
          </label>

          <button
            onClick={handleSearch}
            disabled={searching || !mapReady}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition hover:scale-[1.01]"
            style={{ background: NEON, color: "#04140b", boxShadow: `0 8px 28px -8px ${NEON}80` }}
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar negocios
          </button>

          {/* Results list */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                Resultados ({visibleResults.length})
              </h3>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {visibleResults.map((r, i) => (
                  <motion.button
                    key={r.place_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => mapInstance.current?.panTo({ lat: r.lat, lng: r.lng })}
                    className="w-full text-left p-3 rounded-xl border border-border hover:border-[color:var(--primary)]/50 bg-card/40 transition group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-sm font-medium leading-tight">{r.name}</div>
                      {!r.website && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0" style={{ background: NEON, color: "#04140b" }}>
                          SIN WEB
                        </span>
                      )}
                    </div>
                    {r.address && <div className="text-xs text-muted-foreground line-clamp-1">{r.address}</div>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {r.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> {r.rating.toFixed(1)}
                        </span>
                      )}
                      {r.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {r.phone}
                        </span>
                      )}
                      {r.website && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" /> web
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
              {!searching && results.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">
                  Configura los filtros y pulsa buscar.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || visibleResults.length === 0}
            className="md:hidden w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold disabled:opacity-40"
            style={{ background: NEON, color: "#04140b" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar búsqueda
          </button>
        </aside>

        {/* Map */}
        <main className="relative h-[60vh] lg:h-[calc(100vh-3.5rem)]">
          <div ref={mapRef} className="absolute inset-0 bg-secondary/30" />
          {!mapReady && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: NEON }} />
            </div>
          )}
          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-md text-center p-6 rounded-2xl border border-destructive/40 bg-destructive/10">
                <p className="text-sm font-medium mb-1">No se pudo cargar Google Maps</p>
                <p className="text-xs text-muted-foreground">{mapError}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0c1410" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0c1410" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7a8a82" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a221d" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0c1410" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#243029" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#06100a" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1a221d" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#10180f" }] },
];