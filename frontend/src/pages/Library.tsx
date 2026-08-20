import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  borrowLibraryBook,
  getLibraryBooks,
  getLibraryDepositAmount,
  getMyLoans,
  returnLibraryBook,
} from "../api/client";
import { BookCard } from "../components/Navbar";
import { Layout } from "../components/Layout";
import { EmptyState, LoadingState, PageHeader, PrimaryButton } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { CONDITION_LABELS, type BookCopy, type LibraryLoan } from "../types";
import { levelCategoryLabel, listingSubjectLabel } from "../components/BrowseShell";

export function Library() {
  const { user, refreshUser } = useAuth();
  const [books, setBooks] = useState<BookCopy[]>([]);
  const [loans, setLoans] = useState<LibraryLoan[]>([]);
  const [depositAmount, setDepositAmount] = useState(5000);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [booksRes, depositRes] = await Promise.all([
        getLibraryBooks(),
        getLibraryDepositAmount(),
      ]);
      setBooks(booksRes.data);
      setDepositAmount(depositRes.data.amount);
      if (user) {
        const loansRes = await getMyLoans();
        setLoans(loansRes.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleBorrow = async (bookId: number) => {
    try {
      await borrowLibraryBook(bookId);
      toast.success(`Emprunt confirmé — caution ${depositAmount.toLocaleString("fr-FR")} F`);
      await refreshUser();
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Impossible d'emprunter");
    }
  };

  const handleReturn = async (loanId: number) => {
    try {
      await returnLibraryBook(loanId);
      toast.success("Livre rendu — caution remboursée");
      await refreshUser();
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Erreur lors du retour");
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Bibliothèque"
        subtitle={`Empruntez et rendez — caution de ${depositAmount.toLocaleString("fr-FR")} F remboursée au retour`}
      />

      {loans.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">Mes emprunts en cours</h2>
          <div className="mt-4 space-y-3">
            {loans.map((loan) => (
              <div key={loan.id} className="flex flex-col gap-3 rounded-xl border border-violet-100 bg-violet-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{loan.bookTitle}</p>
                  <p className="text-sm text-violet-700">Caution {loan.depositAmount.toLocaleString("fr-FR")} F</p>
                </div>
                <PrimaryButton variant="violet" onClick={() => handleReturn(loan.id)}>
                  Rendre le livre
                </PrimaryButton>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Ouvrages disponibles</h2>
        {loading ? (
          <LoadingState />
        ) : books.length === 0 ? (
          <EmptyState message="Aucun ouvrage en bibliothèque pour le moment." />
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={{
                  ...book,
                  level: levelCategoryLabel(book.level),
                  subject: listingSubjectLabel(book.listingCategory, book.subject) ?? "",
                  condition: CONDITION_LABELS[book.condition],
                  libraryMode: true,
                }}
                action={
                  user ? (
                    <PrimaryButton variant="violet" onClick={() => handleBorrow(book.id)} className="w-full">
                      Emprunter ({depositAmount.toLocaleString("fr-FR")} F caution)
                    </PrimaryButton>
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full rounded-xl bg-violet-700 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-800"
                    >
                      Se connecter pour emprunter
                    </Link>
                  )
                }
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
