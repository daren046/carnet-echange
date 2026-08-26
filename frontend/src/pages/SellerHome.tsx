import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Package, ShoppingBag, Store, Truck } from "lucide-react";
import { getMyDeposits, requestExtraCauris } from "../api/client";
import { AuthenticatedImage } from "../components/AuthenticatedImage";
import { Layout } from "../components/Layout";
import { Badge, EmptyState, LoadingState, PageHeader, PrimaryButton } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { levelCategoryLabel, listingSubjectLabel } from "../components/BrowseShell";
import {
  CONDITION_LABELS,
  COPY_STATUS_LABELS,
  EXTRA_CAURIS_LABELS,
  formatCfa,
  formatCauris,
  OFFER_TYPE_LABELS,
  type BookCopy,
  type CopyStatus,
} from "../types";
import { isSellerOnly } from "../utils/roles";

type Tab = "listings" | "sales";

const SALE_STATUSES: CopyStatus[] = ["RESERVED", "IN_DELIVERY", "DELIVERED"];

function statusTone(status: CopyStatus) {
  if (status === "AVAILABLE") return "green" as const;
  if (status === "PENDING_REVIEW") return "amber" as const;
  if (status === "RESERVED") return "amber" as const;
  if (status === "IN_DELIVERY") return "blue" as const;
  if (status === "DELIVERED") return "emerald" as const;
  if (status === "LIBRARY_BORROWED") return "violet" as const;
  if (status === "REJECTED") return "orange" as const;
  return "slate" as const;
}

export function SellerHome() {
  const { user } = useAuth();
  const [books, setBooks] = useState<BookCopy[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("listings");

  const load = () => {
    setLoading(true);
    getMyDeposits()
      .then((res) => setBooks(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleExtra = async (book: BookCopy) => {
    const note = window.prompt(
      "Pourquoi cet article justifie-t-il des cauris supplémentaires ? L’équipe répond sous 48 h."
    );
    if (note == null) return;
    if (note.trim().length < 8) {
      toast.error("Précisez un peu plus votre demande");
      return;
    }
    try {
      await requestExtraCauris(book.id, note.trim());
      toast.success("Demande transmise — retour sous 48 h");
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Demande impossible");
    }
  };
  const listings = useMemo(
    () => books.filter((b) => b.status === "AVAILABLE" || b.status === "LIBRARY_BORROWED" || b.status === "PENDING_REVIEW" || b.status === "REJECTED"),
    [books]
  );
  const sales = useMemo(
    () => books.filter((b) => SALE_STATUSES.includes(b.status)),
    [books]
  );

  const stats = [
    { label: "En vente", value: listings.filter((b) => b.status === "AVAILABLE").length, icon: Store },
    { label: "Réservés", value: books.filter((b) => b.status === "RESERVED").length, icon: Package },
    { label: "Livrés", value: books.filter((b) => b.status === "DELIVERED").length, icon: Truck },
    { label: "Ventes", value: sales.length, icon: ShoppingBag },
  ];

  const visible = tab === "listings" ? listings : sales;

  return (
    <Layout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title={`Bonjour ${user?.firstName ?? ""}`}
          subtitle="Ici, uniquement vos annonces et vos ventes — le catalogue public reste sur l’accueil."
          accent={isSellerOnly(user) ? "teal" : "emerald"}
        />
        <div className="mb-8 flex shrink-0 flex-wrap gap-2">
          <Link to="/deposit">
            <PrimaryButton className="w-full sm:w-auto">Déposer une annonce</PrimaryButton>
          </Link>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
              <Icon className="h-4 w-4 text-teal-700" />
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          onClick={() => setTab("listings")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
            tab === "listings" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Mes livres ({listings.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("sales")}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
            tab === "sales" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Mes ventes ({sales.length})
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState />
        ) : visible.length === 0 ? (
          <EmptyState
            message={
              tab === "listings"
                ? "Aucun livre en vente pour le moment. Déposez un manuel pour le voir apparaître ici."
                : "Pas encore de vente. Dès qu’un acheteur réserve l’un de vos livres, il s’affiche ici."
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((book) => (
              <div key={book.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <AuthenticatedImage src={book.photoUrl} alt={book.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 line-clamp-2">{book.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {book.listingKind === "WANTED" && <Badge tone="blue">Recherche</Badge>}
                    {book.listingCategory === "BOOKS" && levelCategoryLabel(book.level) && (
                      <Badge tone="emerald">{levelCategoryLabel(book.level)}</Badge>
                    )}
                    <Badge>
                      {book.listingCategory === "DECOR" ? "Déco" : book.listingCategory === "MISC" ? "Divers" : "Livre"}
                    </Badge>
                    {listingSubjectLabel(book.listingCategory, book.subject) && (
                      <Badge>{listingSubjectLabel(book.listingCategory, book.subject)}</Badge>
                    )}
                    {book.listingKind !== "WANTED" && <Badge>{CONDITION_LABELS[book.condition]}</Badge>}
                    {book.libraryMode && <Badge tone="violet">Bibliothèque</Badge>}
                    {!book.libraryMode && book.listingKind !== "WANTED" && (
                      <Badge
                        tone={
                          book.offerType === "DONATION"
                            ? "violet"
                            : book.offerType === "SALE"
                              ? "amber"
                              : "emerald"
                        }
                      >
                        {OFFER_TYPE_LABELS[book.offerType] ?? "Échange"}
                      </Badge>
                    )}
                    {book.anonymous && <Badge>Anonyme</Badge>}
                    {!book.libraryMode && book.listingKind !== "WANTED" && !book.caurisCredited && (
                      <Badge tone="amber">
                        {book.proposedCauris > 0
                          ? `${formatCauris(book.proposedCauris)} en attente`
                          : "Cauris en attente"}
                      </Badge>
                    )}
                    {book.extraCaurisStatus && book.extraCaurisStatus !== "NONE" && (
                      <Badge tone={book.extraCaurisStatus === "APPROVED" ? "emerald" : "amber"}>
                        {EXTRA_CAURIS_LABELS[book.extraCaurisStatus]}
                      </Badge>
                    )}
                  </div>
                  {book.offerType === "SALE" && book.expectedPrice != null && book.listingCategory !== "BOOKS" && (
                    <p className="mt-2 text-sm font-medium text-amber-800">
                      Prix indicatif : {formatCfa(book.expectedPrice)}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Badge tone={statusTone(book.status)}>{COPY_STATUS_LABELS[book.status]}</Badge>
                    {book.reservedByName && book.status !== "AVAILABLE" && (
                      <span className="truncate text-xs text-slate-400">→ {book.reservedByName}</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {tab === "sales" ? "Mouvement du" : "Déposé le"}{" "}
                    {new Date(book.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  {tab === "listings" && !book.libraryMode
                    && book.listingKind !== "WANTED"
                    && (book.extraCaurisStatus === "NONE" || book.extraCaurisStatus === "REJECTED") && (
                    <button
                      type="button"
                      onClick={() => handleExtra(book)}
                      className="mt-3 text-xs font-medium text-amber-800 hover:underline"
                    >
                      Demander des cauris supplémentaires
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
