import { useEffect, useState } from "react";
import { ShoppingBag, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { cancelOrder, getMyOrders } from "../api/client";
import { AuthenticatedImage } from "../components/AuthenticatedImage";
import { Layout } from "../components/Layout";
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
    if (!confirm("Annuler cette réservation ? Le tampon et les frais de livraison seront remboursés.")) return;
    try {
      await cancelOrder(reservationId);
      toast.success("Réservation annulée — tampon et livraison remboursés");
      await refreshUser();
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Impossible d'annuler");
    }
  };

  return (
    <Layout>
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-8 w-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
          <p className="text-gray-500">Suivez vos réservations et livraisons</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-gray-500">Chargement...</p>
      ) : orders.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">Aucune commande pour le moment.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div key={order.reservationId} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row">
              <AuthenticatedImage
                src={order.photoUrl}
                alt={order.bookTitle}
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{order.bookTitle}</h3>
                <p className="mt-1 text-sm text-gray-500">Zone : {order.zoneName}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {COPY_STATUS_LABELS[order.bookStatus]}
                  </span>
                  {order.deliveryStatus && (
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                      {DELIVERY_STATUS_LABELS[order.deliveryStatus]}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Livraison : {order.deliveryFeePaid.toLocaleString()} F
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
              {order.cancellable && (
                <button
                  onClick={() => handleCancel(order.reservationId)}
                  className="flex h-fit items-center gap-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" /> Annuler
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
