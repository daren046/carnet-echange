import { useEffect, useState } from "react";
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
import { useAuth } from "../context/AuthContext";
import {
  CONDITION_LABELS,
  LEVEL_LABELS,
  SUBJECT_LABELS,
  type BookCopy,
  type LibraryLoan,
} from "../types";

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
      toast.success(`Emprunt confirmé — caution ${depositAmount.toLocaleString()} F`);
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
      <h1 className="text-2xl font-bold text-gray-900">Bibliothèque</h1>
      <p className="mt-1 text-gray-500">
        Empruntez et rendez — caution de {depositAmount.toLocaleString()} F remboursée au retour
      </p>

      {loans.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800">Mes emprunts en cours</h2>
          <div className="mt-4 space-y-3">
            {loans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50 p-4">
                <div>
                  <p className="font-medium">{loan.bookTitle}</p>
                  <p className="text-sm text-purple-600">Caution : {loan.depositAmount.toLocaleString()} F</p>
                </div>
                <button
                  onClick={() => handleReturn(loan.id)}
                  className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800"
                >
                  Rendre le livre
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800">Ouvrages disponibles</h2>
        {loading ? (
          <p className="mt-6 text-center text-gray-500">Chargement...</p>
        ) : books.length === 0 ? (
          <p className="mt-6 text-center text-gray-500">Aucun ouvrage en bibliothèque pour le moment.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={{
                  ...book,
                  level: LEVEL_LABELS[book.level],
                  subject: SUBJECT_LABELS[book.subject],
                  condition: CONDITION_LABELS[book.condition],
                  libraryMode: true,
                }}
                action={
                  user ? (
                    <button
                      onClick={() => handleBorrow(book.id)}
                      className="w-full rounded-xl bg-purple-700 py-2 text-sm font-semibold text-white hover:bg-purple-800"
                    >
                      Emprunter ({depositAmount.toLocaleString()} F caution)
                    </button>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
