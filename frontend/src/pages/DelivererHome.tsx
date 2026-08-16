import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Truck } from "lucide-react";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export function DelivererHome() {
  const { user } = useAuth();

  return (
    <Layout>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-orange-900 px-6 py-12 text-white md:px-12 md:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-sm font-medium text-orange-200">Espace livreur</p>
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            Bonjour {user?.firstName} 👋
          </h1>
          <p className="mt-4 text-lg text-orange-100">
            Gérez les livraisons de manuels par zone. Prenez en charge une tournée,
            regroupez les colis d&apos;un même quartier, puis confirmez la remise.
          </p>
          <Link
            to="/deliveries"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-orange-800 hover:bg-orange-50"
          >
            Voir les livraisons <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Truck className="absolute -right-4 -bottom-4 h-48 w-48 text-white/10" />
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { step: "1", title: "Choisir une zone", desc: "Les commandes sont regroupées par quartier" },
          { step: "2", title: "Prendre en charge", desc: "Une tournée = plusieurs livres, 1 000 F par client" },
          { step: "3", title: "Confirmer « Livré »", desc: "Le stock est mis à jour automatiquement" },
        ].map(({ step, title, desc }) => (
          <div key={step} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
              {step}
            </span>
            <h3 className="mt-3 font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>

      {user?.zoneName && (
        <section className="mt-8 rounded-2xl border border-orange-100 bg-orange-50 p-6">
          <div className="flex items-center gap-2 text-orange-800">
            <MapPin className="h-5 w-5" />
            <h2 className="font-semibold">Votre secteur</h2>
          </div>
          <p className="mt-2 text-lg font-medium text-orange-900">{user.zoneName}</p>
          <p className="text-sm text-orange-700">Priorisez les livraisons de votre zone quand c&apos;est possible.</p>
        </section>
      )}
    </Layout>
  );
}
