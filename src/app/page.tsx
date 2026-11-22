const sampleHospitals = [
  { name: "Sample hospital A", status: "Needs confirmation", beds: "Not reported", capability: "Not verified" },
  { name: "Sample hospital B", status: "Needs confirmation", beds: "Not reported", capability: "Not verified" },
  { name: "Sample hospital C", status: "Needs confirmation", beds: "Not reported", capability: "Not verified" }
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold tracking-tight">ERMap</h1>
        <span className="text-sm text-[var(--ermap-muted)]">North Bengaluru pilot</span>
      </header>

      <section aria-labelledby="emergency-title" className="rounded-2xl border border-[var(--ermap-border)] bg-white p-4">
        <h2 id="emergency-title" className="mb-3 font-semibold">Emergency? Call first.</h2>
        <div className="grid grid-cols-2 gap-3">
          <a className="flex min-h-14 items-center justify-center rounded-xl bg-[var(--ermap-red)] px-3 text-lg font-bold text-white" href="tel:112">Call 112</a>
          <a className="flex min-h-14 items-center justify-center rounded-xl bg-[var(--ermap-red)] px-3 text-lg font-bold text-white" href="tel:108">Call 108</a>
        </div>
        <p className="mt-3 text-xs text-[var(--ermap-muted)]">If someone may be in immediate danger, contact emergency services. ERMap is an information aid, not medical advice.</p>
      </section>

      <section aria-label="Map preview" className="flex min-h-44 items-center justify-center rounded-2xl border border-[var(--ermap-border)] bg-[#E4EAE4] p-4 text-center text-sm text-[var(--ermap-muted)]">
        Map will appear here after a permitted tile provider is configured. No hospital locations are shown until verified.
      </section>

      <section className="flex flex-wrap gap-2" aria-label="Pilot scope">
        {["Trauma", "Cardiac", "Stroke", "Child", "Maternity"].map((item) => (
          <span key={item} className="rounded-full border border-[var(--ermap-border)] bg-white px-4 py-2 text-sm">{item}</span>
        ))}
      </section>

      <section className="space-y-3" aria-labelledby="sample-title">
        <div>
          <h2 id="sample-title" className="font-semibold">Sample records</h2>
          <p className="text-xs text-[var(--ermap-muted)]">Illustrative placeholders only. These are not real hospital records.</p>
        </div>
        {sampleHospitals.map((hospital) => (
          <article key={hospital.name} className="rounded-2xl border border-[var(--ermap-border)] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{hospital.name}</h3>
              <span className="rounded-full bg-[#FFF1D6] px-3 py-1 text-xs font-semibold text-[var(--ermap-amber)]">{hospital.status}</span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-[var(--ermap-muted)]">Capability</dt><dd>{hospital.capability}</dd></div>
              <div><dt className="text-[var(--ermap-muted)]">ER holding beds</dt><dd>{hospital.beds}</dd></div>
            </dl>
          </article>
        ))}
      </section>

      <footer className="mt-auto border-t border-[var(--ermap-border)] pt-4 text-xs leading-5 text-[var(--ermap-muted)]">
        ERMap does not show live bed availability or rank hospitals. Details can change; call the facility before travelling. In an emergency, call 112 or 108 first.
      </footer>
    </main>
  );
}
