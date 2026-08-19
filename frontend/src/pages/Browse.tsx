import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { searchBooks } from "../api/client";
import {
  BrowseShell,
  bookMatchesCategory,
  categoryGalleryTitle,
  type CategoryId,
} from "../components/BrowseShell";
import { Layout } from "../components/Layout";
import { BookCard } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  CONDITION_LABELS,
  LEVEL_LABELS,
  SUBJECT_LABELS,
  type BookCopy,
  type ListingCategory,
} from "../types";
import { isSellerOnly } from "../utils/roles";

function rayonFromPath(pathname: string): ListingCategory | "ALL" {
  if (pathname === "/deco") return "DECOR";
  if (pathname === "/divers") return "MISC";
  if (pathname === "/annonces") return "ALL";
  return "BOOKS";
}

export function Browse() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState<CategoryId>("all");
  const [books, setBooks] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(true);

  const rayon = rayonFromPath(location.pathname);
  const title = searchParams.get("q")?.trim() ?? "";
  const catParam = searchParams.get("cat") as CategoryId | null;

  useEffect(() => {
    setCategory(catParam ?? "all");
  }, [catParam, rayon]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchBooks({
      libraryMode: false,
      title: title || undefined,
      listingCategory: rayon === "ALL" ? undefined : rayon,
    })
      .then((res) => {
        if (!cancelled) setBooks(res.data);
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
  }, [title, rayon]);

  const visibleBooks = books.filter((b) =>
    bookMatchesCategory(b.level, b.subject, b.listingCategory, category)
  );
  const seller = isSellerOnly(user);

  const bookAction = () => {
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
      <BrowseShell
        rayon={rayon}
        banner={
          <div className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              <p className="text-sm text-slate-600">
                {rayon === "DECOR"
                  ? "Meubles, luminaires, textile et objets déco."
                  : rayon === "MISC"
                    ? "Objets du quotidien et tout ce qui n’est ni un livre ni de la déco."
                  : rayon === "ALL"
                    ? "Livres, intérieur déco et articles divers."
                    : "Manuels scolaires, du primaire à l’université."}
              </p>
              <Link
                to="/deposit"
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Déposer une annonce
              </Link>
            </div>
          </div>
        }
        activeCategory={category}
        onCategoryChange={setCategory}
        galleryTitle={
          title
            ? `Résultats pour « ${title} »`
            : categoryGalleryTitle(category, rayon)
        }
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
                  level: book.listingCategory === "BOOKS" && book.level ? LEVEL_LABELS[book.level] : null,
                  subject: book.listingCategory === "MISC" ? "Articles divers" : SUBJECT_LABELS[book.subject],
                  condition: CONDITION_LABELS[book.condition],
                }}
                action={bookAction()}
              />
            ))}
          </div>
        )}
      </BrowseShell>
    </Layout>
  );
}
