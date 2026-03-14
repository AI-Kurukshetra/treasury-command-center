export default function Loading() {
  return (
    <main className="container py-16">
      <div className="animate-pulse rounded-xl border border-border bg-card p-10">
        <div className="h-6 w-48 rounded bg-muted" />
        <div className="mt-4 h-4 w-80 rounded bg-muted" />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    </main>
  );
}
