import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { cancelOrder, getMyOrders } from "../api/client";
import { AuthenticatedImage } from "../components/AuthenticatedImage";
import { Layout } from "../components/Layout";
import { Badge, EmptyState, LoadingState, PageHeader, PrimaryButton } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { COPY_STATUS_LABELS, type Order } from "../types";

const DELIVERY_STATUS_LABELS = {
  PENDING: "En attente de livreur",
  IN_PROGRESS: "En cours de livraison",
  DELIVERED: "Livré",
};

export function MyOrders() {
  const { refreshUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (reservationId: number) => {
    if (!confirm("Annuler cette réservation ? Le cauris et les frais de livraison seront remboursés.")) return;
    try {
      await cancelOrder(reservationId);
      toast.success("Réservation annulée — cauris et livraison remboursés");
      await refreshUser();
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Impossible d'annuler");
    }
  };

  return (
    <Layout>
      <PageHeader title="Mes commandes" subtitle="Suivez vos réservations et livraisons" />
      {loading ? (
        <LoadingState />
      ) : orders.length === 0 ? (
        <EmptyState message="Aucune commande pour le moment." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.reservationId} className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-start">
              <AuthenticatedImage
                src={order.photoUrl}
                alt={order.bookTitle}
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{order.bookTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">Zone {order.zoneName}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="emerald">{COPY_STATUS_LABELS[order.bookStatus]}</Badge>
                  {order.deliveryStatus && (
                    <Badge tone="orange">{DELIVERY_STATUS_LABELS[order.deliveryStatus]}</Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Livraison {order.deliveryFeePaid.toLocaleString("fr-FR")} F
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(order.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              {order.cancellable && (
                <PrimaryButton variant="danger" onClick={() => handleCancel(order.reservationId)}>
                  <XCircle className="h-4 w-4" /> Annuler
                </PrimaryButton>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
