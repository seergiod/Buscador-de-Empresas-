export function Loader({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      <div className="flex gap-1.5">
        <span className="loader-dot inline-block w-2 h-2 rounded-full bg-[var(--neon)]" style={{ animationDelay: "0s" }} />
        <span className="loader-dot inline-block w-2 h-2 rounded-full bg-[var(--neon)]" style={{ animationDelay: ".15s" }} />
        <span className="loader-dot inline-block w-2 h-2 rounded-full bg-[var(--neon)]" style={{ animationDelay: ".3s" }} />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function FullLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-deep">
      <Loader label="Cargando..." />
    </div>
  );
}