import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Coins, Library, Search, Truck } from "lucide-react";
import { searchBooks } from "../api/client";
import {
  BrowseShell,
  bookMatchesCategory,
  categoryGalleryTitle,
  type CategoryId,
} from "../components/BrowseShell";
import { Layout } from "../components/Layout";
import { BookCard } from "../components/Navbar";
import { PrimaryButton, inputClass } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
  CONDITION_LABELS,
  LEVEL_LABELS,
  SUBJECT_LABELS,
  type BookCopy,
} from "../types";

const SERVICE_CARDS = [
  {
    icon: BookOpen,
    title: "Catalogue",
    desc: "Réservez un manuel contre 1 tampon. Livraison 1 000 F, regroupée par zone.",
    to: "/catalog",
  },
  {
    icon: Coins,
    title: "Déposer",
    desc: "Photo + infos de votre livre : vous gagnez 1 tampon pour le niveau suivant.",
    to: "/deposit",
  },
  {
    icon: Truck,
    title: "Livraison",
    desc: "Un livreur de votre quartier ramasse et dépose. 1 000 F par commande.",
    to: "/catalog",
  },
  {
    icon: Library,
    title: "Bibliothèque",
    desc: "Empruntez avec une caution remboursable, sans dépenser de tampon.",
    to: "/library",
  },
];

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [titleInput, setTitleInput] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryId>("all");
  const [books, setBooks] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setBooks([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchBooks({
      libraryMode: false,
      title: title || undefined,
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
  }, [user, title]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = titleInput.trim();
    if (!user) {
      navigate("/register");
      return;
    }
    setTitle(q);
  };

  const visibleBooks = books.filter((b) => bookMatchesCategory(b.level, b.subject, category));

  return (
    <Layout wide>
      <BrowseShell
        banner={
          <div className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              {user ? (
                <>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{user.stampBalance} tampon{user.stampBalance !== 1 ? "s" : ""}</span>
                    {" · "}
                    {user.walletBalance.toLocaleString("fr-FR")} F
                    {user.zoneName ? ` · ${user.zoneName}` : ""}
                  </p>
                  <Link
                    to="/deposit"
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  >
                    Déposer un livre
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600">
                    Donnez vos manuels, gagnez des tampons, récupérez ceux du niveau suivant.
                  </p>
                  <Link
                    to="/register"
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                  >
                    Commencer
                  </Link>
                </>
              )}
            </div>
          </div>
        }
        hero={
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
              <Search className="h-4 w-4" />
              Rechercher un manuel
            </p>
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Titre, ex. Maths 4ème"
                className={`${inputClass} mt-0 py-3`}
              />
              <PrimaryButton type="submit" className="shrink-0 px-6 py-3">
                Rechercher
              </PrimaryButton>
            </form>
          </div>
        }
        activeCategory={category}
        onCategoryChange={setCategory}
        galleryTitle={categoryGalleryTitle(category)}
      >
        {user ? (
          loading ? (
            <p className="py-16 text-center text-sm text-slate-400">Chargement…</p>
          ) : visibleBooks.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">
              Aucun manuel dans cette catégorie pour le moment.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {visibleBooks.map((book) => (
                <BookCard
                  key={book.id}
                  size="gallery"
                  book={{
                    ...book,
                    level: LEVEL_LABELS[book.level],
                    subject: SUBJECT_LABELS[book.subject],
                    condition: CONDITION_LABELS[book.condition],
                  }}
                  action={
                    <Link
                      to="/catalog"
                      className="block w-full rounded-xl bg-emerald-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                      Voir dans le catalogue
                    </Link>
                  }
                />
              ))}
            </div>
          )
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {SERVICE_CARDS.map(({ icon: Icon, title, desc, to }) => (
              <Link
                key={title}
                to={to}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex aspect-[16/10] items-center justify-center bg-slate-50">
                  <Icon className="h-12 w-12 text-emerald-700" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </BrowseShell>
    </Layout>
  );
}
