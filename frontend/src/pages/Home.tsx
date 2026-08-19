import { Link } from "react-router-dom";
import { BookOpen, Building2, GraduationCap, School } from "lucide-react";
import { LEVEL_CATEGORIES } from "../components/BrowseShell";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { BOOK_SUBJECTS, DECOR_SUBJECTS, SUBJECT_LABELS } from "../types";
import { isSellerOnly } from "../utils/roles";

const LEVEL_ICONS = {
  primaire: School,
  secondaire: BookOpen,
  lycee: GraduationCap,
  universite: Building2,
} as const;

const LEVEL_TONES = [
  "from-teal-700 to-emerald-600",
  "from-slate-800 to-teal-800",
  "from-emerald-800 to-slate-900",
  "from-teal-900 to-slate-800",
];

export function Home() {
  const { user } = useAuth();
  const seller = isSellerOnly(user);

  return (
    <Layout wide>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
          <p className="text-sm text-slate-600">
            {user
              ? seller
                ? "Le catalogue public est ici. Vos annonces se gèrent dans l’espace vendeur."
                : "Choisissez une catégorie, puis réservez."
              : "Regardez les annonces sans créer de compte — à Ouaga, on commence par regarder."}
          </p>
          <Link
            to="/deposit"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Déposer une annonce
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:px-6 pb-16">
        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Livres</h1>
              <p className="mt-1 text-sm text-slate-500">Par niveau ou par matière</p>
            </div>
            <Link to="/livres" className="text-sm font-medium text-emerald-700 hover:underline">
              Voir les livres
            </Link>
          </div>

          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Par niveau</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEVEL_CATEGORIES.map((cat, i) => {
              const Icon = LEVEL_ICONS[cat.id];
              return (
                <Link
                  key={cat.id}
                  to={`/livres?cat=${cat.id}`}
                  className={`group relative flex min-h-[9.5rem] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${LEVEL_TONES[i]}`}
                >
                  <Icon className="absolute right-4 top-4 h-12 w-12 opacity-20 transition group-hover:opacity-30" />
                  <span className="text-lg font-bold tracking-tight">{cat.label}</span>
                  <span className="mt-0.5 text-sm text-white/80">{cat.desc}</span>
                </Link>
              );
            })}
          </div>

          <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-slate-400">Par matière</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {BOOK_SUBJECTS.map((id) => (
              <Link
                key={id}
                to={`/livres?cat=${id}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {SUBJECT_LABELS[id]}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Intérieur Déco</h2>
              <p className="mt-1 text-sm text-slate-500">Meubles, luminaires et objets</p>
            </div>
            <Link to="/deco" className="text-sm font-medium text-emerald-700 hover:underline">
              Voir la déco
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {DECOR_SUBJECTS.map((id) => (
              <Link
                key={id}
                to={`/deco?cat=${id}`}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                {SUBJECT_LABELS[id]}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
