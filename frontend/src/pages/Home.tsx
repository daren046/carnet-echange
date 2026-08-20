import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchBooks } from "../api/client";
import {
  BrowseShell,
  bookMatchesCategory,
  categoryGalleryTitle,
  levelCategoryLabel,
  listingSubjectLabel,
  type CategoryId,
} from "../components/BrowseShell";
import { Layout } from "../components/Layout";
import { BookCard } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  CONDITION_LABELS,
  type BookCopy,
} from "../types";
import { isSellerOnly } from "../utils/roles";

function byNewest(a: BookCopy, b: BookCopy) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function categoryFromParam(value: string | null): CategoryId {
  if (value === "livres") return "rayon-livres";
  if (value === "deco") return "rayon-deco";
  if (value === "divers") return "rayon-misc";
  return "all";
}

function paramFromCategory(id: CategoryId): string | null {
  if (id === "rayon-livres") return "livres";
  if (id === "rayon-deco") return "deco";
  if (id === "rayon-misc") return "divers";
  return null;
}

export function Home() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = categoryFromParam(searchParams.get("categorie"));
  const [books, setBooks] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(true);
  const seller = isSellerOnly(user);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchBooks()
      .then((res) => {
        if (!cancelled) setBooks([...res.data].sort(byNewest));
      })
      .catch(() => {
        if (!cancelled) setBooks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleBooks = books
    .filter((b) => bookMatchesCategory(b.level, b.subject, b.listingCategory, category))
    .sort(byNewest)
    .filter((b) => {
      const vue = searchParams.get("vue");
      if (vue === "offres") return b.listingKind !== "WANTED";
      if (vue === "recherches") return b.listingKind === "WANTED";
      return true;
    });

  const handleCategoryChange = (id: CategoryId) => {
    const param = paramFromCategory(id);
    const vue = searchParams.get("vue");
    const next: Record<string, string> = {};
    if (param) next.categorie = param;
    if (vue) next.vue = vue;
    setSearchParams(next);
  };

  const bookAction = (book: BookCopy) => {
    if (seller) {
      return (
        <Link
          to="/seller"
          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Retour à mon espace
        </Link>
      );
    }
    if (book.libraryMode) {
      return (
        <Link
          to="/library"
          className="block w-full rounded-xl bg-violet-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-800"
        >
          {user ? "Emprunter" : "Voir en bibliothèque"}
        </Link>
      );
    }
    if (user) {
      return (
        <Link
          to="/catalog"
          className="block w-full rounded-xl bg-emerald-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Réserver
        </Link>
      );
    }
    return (
      <Link
        to="/login"
        className="block w-full rounded-xl bg-emerald-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-800"
      >
        Se connecter pour réserver
      </Link>
    );
  };

  return (
    <Layout wide>
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
      <BrowseShell
        rayon="HOME"
        banner={
          <div className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-600">
                {user
                  ? seller
                    ? "Le catalogue public est ici. Vos offres et recherches se gèrent dans l’espace vendeur."
                    : "Les dernières offres et recherches, tous produits confondus."
                  : "Rien ne se perd : donnez, échangez, vendez ou publiez ce que vous cherchez."}
              </p>
              <Link
                to="/deposit"
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Déposer une annonce
              </Link>
              </div>
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
                {(
                  [
                    [null, "Tout"],
                    ["offres", "Offres"],
                    ["recherches", "Recherches"],
                  ] as const
                ).map(([value, label]) => {
                  const active = (searchParams.get("vue") ?? null) === value;
                  const params = new URLSearchParams(searchParams);
                  if (value) params.set("vue", value);
                  else params.delete("vue");
                  const qs = params.toString();
                  return (
                    <Link
                      key={label}
                      to={qs ? `/?${qs}` : "/"}
                      className={`rounded-md px-3 py-1.5 font-medium ${
                        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        }
        activeCategory={category}
        onCategoryChange={handleCategoryChange}
        galleryTitle={categoryGalleryTitle(category, "HOME")}
      >
        {loading ? (
          <p className="py-16 text-center text-sm text-slate-400">Chargement…</p>
        ) : visibleBooks.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-400">
            Aucune annonce dans cette catégorie pour le moment.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {visibleBooks.map((book) => (
              <BookCard
                key={book.id}
                size="gallery"
                book={{
                  ...book,
                  level: book.listingCategory === "BOOKS" ? levelCategoryLabel(book.level) : null,
                  subject: listingSubjectLabel(book.listingCategory, book.subject) ?? "",
                  condition: CONDITION_LABELS[book.condition],
                }}
                action={book.listingKind === "WANTED" ? undefined : bookAction(book)}
              />
            ))}
          </div>
        )}
      </BrowseShell>
    </Layout>
  );
}
