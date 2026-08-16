import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { getMyDeposits } from "../api/client";
import { AuthenticatedImage } from "../components/AuthenticatedImage";
import { Layout } from "../components/Layout";
import {
  CONDITION_LABELS,
  COPY_STATUS_LABELS,
  LEVEL_LABELS,
  SUBJECT_LABELS,
  type BookCopy,
} from "../types";

export function MyDeposits() {
  const [books, setBooks] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyDeposits()
      .then((res) => setBooks(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="flex items-center gap-3">
        <Package className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes dépôts</h1>
          <p className="text-gray-500">Suivez l&apos;état de vos manuels déposés</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-gray-500">Chargement...</p>
      ) : books.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">Vous n&apos;avez pas encore déposé de livre.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div key={book.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <AuthenticatedImage src={book.photoUrl} alt={book.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                    {LEVEL_LABELS[book.level]}
                  </span>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                    {SUBJECT_LABELS[book.subject]}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                    {CONDITION_LABELS[book.condition]}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    book.status === "AVAILABLE" ? "bg-green-100 text-green-800"
                    : book.status === "RESERVED" ? "bg-yellow-100 text-yellow-800"
                    : book.status === "IN_DELIVERY" ? "bg-blue-100 text-blue-800"
                    : book.status === "DELIVERED" ? "bg-gray-100 text-gray-600"
                    : "bg-purple-100 text-purple-800"
                  }`}>
                    {COPY_STATUS_LABELS[book.status]}
                  </span>
                  {book.reservedByName && book.status !== "AVAILABLE" && (
                    <span className="text-xs text-gray-500">→ {book.reservedByName}</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Déposé le {new Date(book.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
