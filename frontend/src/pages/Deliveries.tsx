import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { assignDelivery, getPendingDeliveries, markDelivered } from "../api/client";
import { Layout } from "../components/Layout";
import { Badge, EmptyState, LoadingState, PageHeader, PrimaryButton } from "../components/ui";
import type { Delivery } from "../types";

const STATUS_LABELS = {
  PENDING: "En attente",
  IN_PROGRESS: "En cours",
  DELIVERED: "Livré",
};

function statusTone(status: Delivery["status"]) {
  if (status === "PENDING") return "amber" as const;
  if (status === "IN_PROGRESS") return "blue" as const;
  return "green" as const;
}

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
      <PageHeader
        title="Livraisons par zone"
        subtitle="Regroupez les livraisons d'une même zone — 1 000 F par client"
        accent="orange"
      />

      {loading ? (
        <LoadingState />
      ) : deliveries.length === 0 ? (
        <EmptyState message="Aucune livraison en attente." />
      ) : (
        <div className="space-y-3">
          {deliveries.map((d) => (
            <div key={d.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">Zone {d.zoneName}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {d.reservationCount} livre{d.reservationCount > 1 ? "s" : ""} — {d.deliveryFee.toLocaleString("fr-FR")} F / client
                  </p>
                  <div className="mt-2">
                    <Badge tone={statusTone(d.status)}>{STATUS_LABELS[d.status]}</Badge>
                  </div>
                  {d.delivererName && (
                    <p className="mt-2 text-sm text-slate-500">Livreur : {d.delivererName}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {d.status === "PENDING" && (
                    <PrimaryButton variant="orange" onClick={() => handleAssign(d.id)}>
                      Prendre en charge
                    </PrimaryButton>
                  )}
                  {d.status === "IN_PROGRESS" && (
                    <PrimaryButton onClick={() => handleDelivered(d.id)}>
                      <CheckCircle className="h-4 w-4" /> Livré
                    </PrimaryButton>
                  )}
                </div>
              </div>
              <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                {d.bookTitles.map((title, i) => (
                  <li key={i} className="text-sm text-slate-600">• {title}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
