import { useEffect, useState } from "react";
import { getTransactions } from "../api/client";
import { Layout } from "../components/Layout";
import type { Transaction, TransactionType } from "../types";

const TYPE_LABELS: Record<TransactionType, string> = {
  WELCOME_BONUS: "Tampon de bienvenue",
  DEPOSIT: "Dépôt de livre",
  PICKUP: "Récupération",
  PICKUP_REFUND: "Remboursement tampon",
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
      <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
      <p className="mt-1 text-gray-500">Tous vos dons, récupérations et paiements</p>

      {loading ? (
        <p className="mt-10 text-center text-gray-500">Chargement...</p>
      ) : transactions.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">Aucune transaction pour le moment.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-gray-900">{TYPE_LABELS[t.type]}</p>
                {t.bookTitle && <p className="text-sm text-gray-600">{t.bookTitle}</p>}
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <div className="text-right text-sm">
                {t.stampDelta !== 0 && (
                  <p className={t.stampDelta > 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>
                    {t.stampDelta > 0 ? "+" : ""}{t.stampDelta} tampon{t.stampDelta !== 1 && t.stampDelta !== -1 ? "s" : ""}
                  </p>
                )}
                {t.amount > 0 && (
                  <p className="text-gray-600">{t.amount.toLocaleString()} F</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
