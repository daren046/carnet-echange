import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Coins, Truck, Library } from "lucide-react";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { user } = useAuth();

  return (
    <Layout>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-900 px-6 py-12 text-white md:px-12 md:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-2 text-sm font-medium text-emerald-200">Économie circulaire scolaire</p>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            Carnet d&apos;Échange
          </h1>
          <p className="mt-4 text-lg text-emerald-100">
            Donnez vos manuels, gagnez des tampons, récupérez ceux du niveau suivant.
            Collège, lycée, primaire — l&apos;échange est gratuit, la livraison 1 000 F.
          </p>
          {!user ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-emerald-800 hover:bg-emerald-50"
              >
                Commencer <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10"
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalog" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-emerald-800">
                Voir le catalogue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/deposit" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10">
                Déposer un livre
              </Link>
            </div>
          )}
        </div>
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-white/5" />
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BookOpen, title: "Déposer", desc: "Photo + infos → +1 tampon", to: "/deposit" },
          { icon: Coins, title: "Tampons", desc: "1 tampon de bienvenue à l'inscription", to: "/catalog" },
          { icon: Truck, title: "Livraison", desc: "1 000 F, regroupée par zone", to: "/catalog" },
          { icon: Library, title: "Bibliothèque", desc: "Emprunt avec caution remboursable", to: "/library" },
        ].map(({ icon: Icon, title, desc, to }) => (
          <Link
            key={title}
            to={to}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          >
            <Icon className="h-8 w-8 text-emerald-600" />
            <h3 className="mt-3 font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{desc}</p>
          </Link>
        ))}
      </section>

      {user && (
        <section className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
          <h2 className="text-lg font-semibold text-emerald-900">Votre solde</h2>
          <div className="mt-4 flex flex-wrap gap-6">
            <div>
              <p className="text-3xl font-bold text-emerald-700">{user.stampBalance}</p>
              <p className="text-sm text-emerald-600">tampons disponibles</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-700">{user.walletBalance.toLocaleString()} F</p>
              <p className="text-sm text-emerald-600">portefeuille Mobile Money</p>
            </div>
            <div>
              <p className="text-lg font-medium text-emerald-800">{user.zoneName}</p>
              <p className="text-sm text-emerald-600">votre zone de livraison</p>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
