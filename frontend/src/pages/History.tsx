import { useEffect, useState } from "react";
import { getTransactions } from "../api/client";
import { Layout } from "../components/Layout";
import { EmptyState, LoadingState, PageHeader } from "../components/ui";
import type { Transaction, TransactionType } from "../types";

const TYPE_LABELS: Record<TransactionType, string> = {
  WELCOME_BONUS: "Cauris de bienvenue",
  DEPOSIT: "Dépôt de livre",
  EXTRA_CAURIS: "Cauris supplémentaires",
  PICKUP: "Récupération",
  PICKUP_REFUND: "Remboursement cauris",
  DELIVERY_PAYMENT: "Paiement livraison",
  DELIVERY_REFUND: "Remboursement livraison",
  WALLET_TOPUP: "Recharge Mobile Money",
  LIBRARY_DEPOSIT: "Caution bibliothèque",
  LIBRARY_REFUND: "Remboursement caution",
};

export function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions()
      .then((res) => setTransactions(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <PageHeader title="Historique" subtitle="Tous vos dons, récupérations et paiements" />
      {loading ? (
        <LoadingState />
      ) : transactions.length === 0 ? (
        <EmptyState message="Aucune transaction pour le moment." />
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200/80 bg-white px-4 py-4">
              <div>
                <p className="font-medium text-slate-900">{TYPE_LABELS[t.type]}</p>
                {t.bookTitle && <p className="text-sm text-slate-500">{t.bookTitle}</p>}
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(t.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="text-right text-sm">
                {t.stampDelta !== 0 && (
                  <p className={t.stampDelta > 0 ? "font-semibold text-emerald-700" : "font-semibold text-red-600"}>
                    {t.stampDelta > 0 ? "+" : ""}{t.stampDelta} cauris
                  </p>
                )}
                {t.amount > 0 && (
                  <p className="tabular-nums text-slate-600">{t.amount.toLocaleString("fr-FR")} F</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
