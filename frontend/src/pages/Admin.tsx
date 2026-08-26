import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  approveListing,
  creditCauris,
  decideCaurisGrant,
  decideExtraCauris,
  getModerationInbox,
  rejectListing,
} from "../api/client";
import { AuthenticatedImage } from "../components/AuthenticatedImage";
import { Layout } from "../components/Layout";
import { Badge, Card, EmptyState, LoadingState, PageHeader, PrimaryButton, inputClass } from "../components/ui";
import { CONDITION_LABELS, EXTRA_CAURIS_LABELS, formatCauris, proposedCaurisFor, type BookCopy, type CaurisGrantRequest } from "../types";

type Tab = "listings" | "cauris" | "extra" | "grants";

export function Admin() {
  const [tab, setTab] = useState<Tab>("listings");
  const [loading, setLoading] = useState(true);
  const [pendingListings, setPendingListings] = useState<BookCopy[]>([]);
  const [pendingCauris, setPendingCauris] = useState<BookCopy[]>([]);
  const [extraRequests, setExtraRequests] = useState<BookCopy[]>([]);
  const [grantRequests, setGrantRequests] = useState<CaurisGrantRequest[]>([]);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [pickupCosts, setPickupCosts] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await getModerationInbox();
      setPendingListings(res.data.pendingListings);
      setPendingCauris(res.data.pendingCauris);
      setExtraRequests(res.data.extraCaurisRequests);
      setGrantRequests(res.data.grantRequests ?? []);
    } catch {
      toast.error("Impossible de charger la modération");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const proposedAmount = (book: BookCopy) =>
    book.proposedCauris > 0 ? book.proposedCauris : proposedCaurisFor(book.condition);

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast.success(success);
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Action impossible");
    }
  };

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "listings", label: "Annonces visiteurs", count: pendingListings.length },
    { id: "cauris", label: "Cauris à délivrer", count: pendingCauris.length },
    { id: "extra", label: "Cauris supplémentaires", count: extraRequests.length },
    { id: "grants", label: "Sans dépôt", count: grantRequests.length },
  ];

  const visible =
    tab === "listings" ? pendingListings : tab === "cauris" ? pendingCauris : tab === "extra" ? extraRequests : [];

  return (
    <Layout>
      <PageHeader
        title="Espace équipe"
        subtitle="Validez les publications des visiteurs, confirmez les cauris proposés selon l’état, et répondez aux demandes sous 48 h."
      />
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === item.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>
      <div className="mt-6">
        {loading ? (
          <LoadingState />
        ) : tab === "grants" ? (
          grantRequests.length === 0 ? (
            <EmptyState message="Rien en attente dans cet onglet." />
          ) : (
            <div className="space-y-4">
              {grantRequests.map((request) => (
                <Card key={request.id} className="p-4 sm:p-5">
                  <h3 className="font-semibold text-slate-900">{request.userName}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {request.userEmail} · {new Date(request.createdAt).toLocaleString("fr-FR")}
                  </p>
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{request.note}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                      inputMode="numeric"
                      className={`${inputClass} mt-0 w-24`}
                      placeholder="Nb"
                      value={amounts[request.id] ?? "1"}
                      onChange={(e) => setAmounts((prev) => ({ ...prev, [request.id]: e.target.value }))}
                    />
                    <PrimaryButton
                      onClick={() => {
                        const n = Number((amounts[request.id] ?? "1").replace(/[^0-9]/g, ""));
                        return run(() => decideCaurisGrant(request.id, true, n), "Cauris accordés");
                      }}
                    >
                      Accorder
                    </PrimaryButton>
                    <PrimaryButton
                      variant="danger"
                      onClick={() => run(() => decideCaurisGrant(request.id, false), "Demande refusée")}
                    >
                      Refuser
                    </PrimaryButton>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : visible.length === 0 ? (
          <EmptyState message="Rien en attente dans cet onglet." />
        ) : (
          <div className="space-y-4">
            {visible.map((book) => (
              <Card key={book.id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-36">
                    <AuthenticatedImage src={book.photoUrl} alt={book.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{book.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge>{CONDITION_LABELS[book.condition]}</Badge>
                      <Badge>{book.zoneName}</Badge>
                      {book.anonymous && <Badge>Anonyme</Badge>}
                      {tab === "extra" && (
                        <Badge tone="amber">{EXTRA_CAURIS_LABELS[book.extraCaurisStatus]}</Badge>
                      )}
                      {tab === "cauris" && proposedAmount(book) > 0 && (
                        <Badge tone="amber">Proposition : {formatCauris(proposedAmount(book))}</Badge>
                      )}
                      {tab === "cauris" && book.pickupCaurisCost > 1 && (
                        <Badge tone="amber">{formatCauris(book.pickupCaurisCost)} au retrait</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {book.depositorName} · {new Date(book.createdAt).toLocaleString("fr-FR")}
                      {book.contactPhone ? ` · ${book.contactPhone}` : ""}
                    </p>
                    {tab === "extra" && book.extraCaurisNote && (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        {book.extraCaurisNote}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {tab === "listings" && (
                        <>
                          <PrimaryButton onClick={() => run(() => approveListing(book.id), "Annonce publiée")}>
                            Publier
                          </PrimaryButton>
                          <PrimaryButton
                            variant="danger"
                            onClick={() => run(() => rejectListing(book.id), "Annonce refusée")}
                          >
                            Refuser
                          </PrimaryButton>
                        </>
                      )}
                      {tab === "cauris" && (
                        <>
                          <label className="flex items-center gap-2 text-xs text-slate-500">
                            Cauris
                            <input
                              inputMode="numeric"
                              className={`${inputClass} mt-0 w-16`}
                              value={amounts[book.id] ?? String(proposedAmount(book))}
                              onChange={(e) => setAmounts((prev) => ({ ...prev, [book.id]: e.target.value }))}
                            />
                          </label>
                          {book.listingCategory === "BOOKS" && (
                            <label className="flex items-center gap-2 text-xs text-slate-500">
                              Coût au retrait
                              <input
                                inputMode="numeric"
                                className={`${inputClass} mt-0 w-16`}
                                value={pickupCosts[book.id] ?? String(book.pickupCaurisCost || 1)}
                                onChange={(e) => setPickupCosts((prev) => ({ ...prev, [book.id]: e.target.value }))}
                              />
                            </label>
                          )}
                          <PrimaryButton
                            onClick={() => {
                              const n = Number((amounts[book.id] ?? String(proposedAmount(book))).replace(/[^0-9]/g, ""));
                              const pickup = Number((pickupCosts[book.id] ?? String(book.pickupCaurisCost || 1)).replace(/[^0-9]/g, ""));
                              return run(
                                () => creditCauris(book.id, n || 1, pickup || 1),
                                "Cauris délivrés"
                              );
                            }}
                          >
                            Valider et délivrer
                          </PrimaryButton>
                        </>
                      )}
                      {tab === "extra" && (
                        <>
                          <input
                            inputMode="numeric"
                            className={`${inputClass} mt-0 w-24`}
                            placeholder="Nb"
                            value={amounts[book.id] ?? "1"}
                            onChange={(e) => setAmounts((prev) => ({ ...prev, [book.id]: e.target.value }))}
                          />
                          <PrimaryButton
                            onClick={() => {
                              const n = Number((amounts[book.id] ?? "1").replace(/[^0-9]/g, ""));
                              return run(() => decideExtraCauris(book.id, true, n), "Cauris supplémentaires accordés");
                            }}
                          >
                            Accorder
                          </PrimaryButton>
                          <PrimaryButton
                            variant="danger"
                            onClick={() => run(() => decideExtraCauris(book.id, false), "Demande refusée")}
                          >
                            Refuser
                          </PrimaryButton>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
