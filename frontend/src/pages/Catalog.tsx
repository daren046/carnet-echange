import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { getZones, reserveBook, searchBooks } from "../api/client";
import {
  BrowseShell,
  bookMatchesCategory,
  categoryGalleryTitle,
  isSubjectCategory,
  type CategoryId,
} from "../components/BrowseShell";
import { BookCard } from "../components/Navbar";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  CONDITION_LABELS,
  LEVEL_LABELS,
  SUBJECT_LABELS,
  type BookCopy,
  type Zone,
} from "../types";

export function Catalog() {
  const { user, refreshUser } = useAuth();
  const [books, setBooks] = useState<BookCopy[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryId>("all");
  const [title, setTitle] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [zoneFilter, setZoneFilter] = useState<number | "">("");
  const [myZoneOnly, setMyZoneOnly] = useState(true);

  useEffect(() => {
    getZones().then((res) => setZones(res.data));
  }, []);

  useEffect(() => {
    if (user && myZoneOnly && user.zoneId) {
      setZoneFilter(user.zoneId);
    }
  }, [user, myZoneOnly]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await searchBooks({
        subject: isSubjectCategory(category) ? category : undefined,
        libraryMode: false,
        zoneId: zoneFilter !== "" ? zoneFilter : undefined,
        title: title || undefined,
      });
      setBooks(res.data.filter((b) => bookMatchesCategory(b.level, b.subject, category)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [category, title, zoneFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTitle(titleInput.trim());
  };

  const handleReserve = async (bookId: number) => {
    if (!user) {
      toast.info("Connectez-vous pour réserver un livre");
      return;
    }
    try {
      await reserveBook(bookId);
      toast.success("Réservé ! Livraison 1 000 F — regroupée par zone");
      await refreshUser();
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Impossible de réserver");
    }
  };

  return (
    <Layout wide>
      <BrowseShell
        hero={
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-500">
              <Sparkles className="h-4 w-4" />
              TROUVEZ UN MANUEL INSTANTANÉMENT...
            </p>
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Titre du manuel, ex. Maths 4ème"
                className="w-full flex-1 rounded-lg border border-gray-200 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-bold tracking-wide text-white hover:bg-emerald-800"
              >
                CONFIRMER &amp; RECHERCHER
              </button>
            </form>
          </div>
        }
        activeCategory={category}
        onCategoryChange={setCategory}
        extraFilter={
          <div className="space-y-3">
            <select
              value={zoneFilter}
              onChange={(e) => {
                const val = e.target.value;
                setZoneFilter(val === "" ? "" : Number(val));
                setMyZoneOnly(false);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Toutes les zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
            {user?.zoneId && (
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={myZoneOnly}
                  onChange={(e) => {
                    setMyZoneOnly(e.target.checked);
                    if (e.target.checked && user.zoneId) {
                      setZoneFilter(user.zoneId);
                    } else {
                      setZoneFilter("");
                    }
                  }}
                  className="rounded border-gray-300 text-emerald-600"
                />
                Ma zone uniquement
              </label>
            )}
          </div>
        }
        galleryTitle={categoryGalleryTitle(category)}
      >
        {loading ? (
          <p className="py-16 text-center text-gray-500">Chargement...</p>
        ) : books.length === 0 ? (
          <p className="py-16 text-center text-gray-500">Aucun manuel disponible pour le moment.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {books.map((book) => (
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
                  user ? (
                    <button
                      onClick={() => handleReserve(book.id)}
                      className="w-full rounded-xl bg-emerald-700 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                      Réserver (1 tampon + 1 000 F)
                    </button>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </BrowseShell>
    </Layout>
  );
}
