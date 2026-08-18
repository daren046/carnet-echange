import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function DelivererHome() {
  const { user } = useAuth();

  return (
    <Layout>
      <PageHeader
        title={`Bonjour ${user?.firstName ?? ""}`}
        subtitle="Gérez les livraisons de manuels par zone. Prenez une tournée, regroupez les colis d’un même quartier, puis confirmez la remise."
        accent="orange"
      />

      <section className="rounded-2xl border border-orange-100 bg-orange-50 px-6 py-8">
        <p className="text-sm font-medium text-orange-800">Espace livreur</p>
        <p className="mt-2 max-w-xl text-slate-700">
          Les commandes sont regroupées par quartier. Une tournée = plusieurs livres, 1 000 F par client.
        </p>
        <Link
          to="/deliveries"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Voir les livraisons <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { step: "1", title: "Choisir une zone", desc: "Les commandes sont regroupées par quartier" },
          { step: "2", title: "Prendre en charge", desc: "Une tournée = plusieurs livres, 1 000 F par client" },
          { step: "3", title: "Confirmer « Livré »", desc: "Le stock est mis à jour automatiquement" },
        ].map(({ step, title, desc }) => (
          <div key={step} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700">
              {step}
            </span>
            <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </section>

      {user?.zoneName && (
        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6">
          <div className="flex items-center gap-2 text-slate-800">
            <MapPin className="h-5 w-5 text-orange-600" />
            <h2 className="font-semibold">Votre secteur</h2>
          </div>
          <p className="mt-2 text-lg font-medium text-slate-900">{user.zoneName}</p>
          <p className="text-sm text-slate-500">Priorisez les livraisons de votre zone quand c&apos;est possible.</p>
        </section>
      )}
    </Layout>
  );
}
