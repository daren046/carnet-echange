import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import { getZones, reserveBook, searchBooks } from "../api/client";
import { BookCard } from "../components/Navbar";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  CONDITION_LABELS,
  LEVEL_LABELS,
  SUBJECT_LABELS,
  type BookCopy,
  type SchoolLevel,
  type Subject,
  type Zone,
} from "../types";

export function Catalog() {
  const { user, refreshUser } = useAuth();
  const [books, setBooks] = useState<BookCopy[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<SchoolLevel | "">("");
  const [subject, setSubject] = useState<Subject | "">("");
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
        level: level || undefined,
        subject: subject || undefined,
        libraryMode: false,
        zoneId: zoneFilter !== "" ? zoneFilter : undefined,
        title: title || undefined,
      });
      setBooks(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [level, subject, title, zoneFilter]);

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
    <Layout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
          <p className="text-gray-500">Manuels disponibles — 1 tampon + 1 000 F livraison</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Rechercher par titre..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
            Chercher
          </button>
          {title && (
            <button
              type="button"
              onClick={() => { setTitle(""); setTitleInput(""); }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Effacer
            </button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as SchoolLevel | "")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Tous niveaux</option>
            {Object.entries(LEVEL_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject | "")}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Toutes matières</option>
            {Object.entries(SUBJECT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={zoneFilter}
            onChange={(e) => {
              const val = e.target.value;
              setZoneFilter(val === "" ? "" : Number(val));
              setMyZoneOnly(false);
            }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
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
              Ma zone ({user.zoneName})
            </label>
          )}
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-gray-500">Chargement...</p>
      ) : books.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">Aucun manuel disponible pour le moment.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard
              key={book.id}
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
    </Layout>
  );
}
