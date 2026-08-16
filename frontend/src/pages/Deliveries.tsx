import { useEffect, useState } from "react";
import { CheckCircle, Truck } from "lucide-react";
import { toast } from "react-toastify";
import { assignDelivery, getPendingDeliveries, markDelivered } from "../api/client";
import { Layout } from "../components/Layout";
import type { Delivery } from "../types";

const STATUS_LABELS = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  DELIVERED: "Livré",
};

export function Deliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getPendingDeliveries()
      .then((res) => setDeliveries(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAssign = async (id: number) => {
    try {
      await assignDelivery(id);
      toast.success("Livraison prise en charge");
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Erreur");
    }
  };

  const handleDelivered = async (id: number) => {
    try {
      await markDelivered(id);
      toast.success("Livraison marquée comme livrée — stock mis à jour");
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Erreur");
    }
  };

  return (
    <Layout>
      <div className="flex items-center gap-3">
        <Truck className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Livraisons par zone</h1>
          <p className="text-gray-500">Regroupez les livraisons d&apos;une même zone — 1 000 F par client</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-gray-500">Chargement...</p>
      ) : deliveries.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">Aucune livraison en attente.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {deliveries.map((d) => (
            <div key={d.id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Zone : {d.zoneName}</p>
                  <p className="text-sm text-gray-500">
                    {d.reservationCount} livre{d.reservationCount > 1 ? "s" : ""} — {d.deliveryFee.toLocaleString()} F / client
                  </p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    d.status === "PENDING" ? "bg-yellow-100 text-yellow-800"
                    : d.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                  }`}>
                    {STATUS_LABELS[d.status]}
                  </span>
                  {d.delivererName && (
                    <p className="mt-1 text-sm text-gray-600">Livreur : {d.delivererName}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {d.status === "PENDING" && (
                    <button
                      onClick={() => handleAssign(d.id)}
                      className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                      Prendre en charge
                    </button>
                  )}
                  {d.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleDelivered(d.id)}
                      className="flex items-center gap-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                      <CheckCircle className="h-4 w-4" /> Livré
                    </button>
                  )}
                </div>
              </div>
              <ul className="mt-4 space-y-1 border-t border-gray-100 pt-4">
                {d.bookTitles.map((title, i) => (
                  <li key={i} className="text-sm text-gray-700">• {title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
