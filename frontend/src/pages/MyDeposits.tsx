import { useEffect, useState } from "react";
import { getMyDeposits } from "../api/client";
import { AuthenticatedImage } from "../components/AuthenticatedImage";
import { Layout } from "../components/Layout";
import { Badge, EmptyState, LoadingState, PageHeader } from "../components/ui";
import {
  CONDITION_LABELS,
  COPY_STATUS_LABELS,
  LEVEL_LABELS,
  SUBJECT_LABELS,
  type BookCopy,
} from "../types";

function statusTone(status: BookCopy["status"]) {
  if (status === "AVAILABLE") return "green" as const;
  if (status === "RESERVED") return "amber" as const;
  if (status === "IN_DELIVERY") return "blue" as const;
  if (status === "LIBRARY_BORROWED") return "violet" as const;
  return "slate" as const;
}

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
      <PageHeader title="Mes dépôts" subtitle="Suivez l'état de vos manuels déposés" />
      {loading ? (
        <LoadingState />
      ) : books.length === 0 ? (
        <EmptyState message="Vous n'avez pas encore déposé de livre." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div key={book.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                <AuthenticatedImage src={book.photoUrl} alt={book.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 line-clamp-2">{book.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {book.level && <Badge tone="emerald">{LEVEL_LABELS[book.level]}</Badge>}
                  <Badge>{SUBJECT_LABELS[book.subject]}</Badge>
                  <Badge>{CONDITION_LABELS[book.condition]}</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone={statusTone(book.status)}>{COPY_STATUS_LABELS[book.status]}</Badge>
                  {book.reservedByName && book.status !== "AVAILABLE" && (
                    <span className="text-xs text-slate-400">→ {book.reservedByName}</span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
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
