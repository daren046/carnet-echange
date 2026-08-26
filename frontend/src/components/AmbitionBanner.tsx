import { Link } from "react-router-dom";

export function AmbitionBanner() {
  return (
    <section className="border-b border-emerald-100 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">Perso</p>
          <p className="mt-2 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
            Fédérer l’Afrique autour d’une consommation plus responsable, plus solidaire et plus durable.
          </p>
          <p className="mt-2 text-sm text-emerald-100">Notre ambition — rien ne se perd, tout circule.</p>
        </div>
        <Link
          to="/a-propos"
          className="shrink-0 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
        >
          Découvrir Perso
        </Link>
      </div>
    </section>
  );
}
