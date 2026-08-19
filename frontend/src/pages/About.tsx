import { useEffect, useState } from "react";
import { BookOpen, Recycle, Users, Wallet } from "lucide-react";
import { getImpactStats } from "../api/client";
import { Layout } from "../components/Layout";
import { Card, PageHeader } from "../components/ui";
import type { ImpactStats } from "../types";

const FAQ = [
  {
    q: "Je dois m’inscrire pour regarder ?",
    a: "Non. Sur Perso, vous parcourez Livres, Intérieur Déco et Articles divers sans compte. À Ouaga, beaucoup préfèrent d’abord voir ce qui existe.",
  },
  {
    q: "Puis-je publier sans donner mon nom ?",
    a: "Oui. Cochez « utilisateur anonyme » : l’annonce s’affiche sans votre identité. Sans compte, la publication est forcément anonyme.",
  },
  {
    q: "Comment fonctionne un tampon ?",
    a: "Vous déposez un livre (avec votre compte, sans anonymat) : vous gagnez 1 tampon. Pour récupérer un autre livre, vous dépensez 1 tampon. La livraison est à 1 000 F.",
  },
  {
    q: "Pourquoi 1 000 F de livraison ?",
    a: "Les 1 000 F paient le livreur qui ramasse et dépose dans votre zone, pour regrouper les tournées.",
  },
  {
    q: "Qui peut s’inscrire ?",
    a: "Élèves, parents et vendeurs. Les livreurs sont créés par l’équipe. Un tampon de bienvenue est offert à l’inscription.",
  },
  {
    q: "C’est quoi la bibliothèque ?",
    a: "Certains ouvrages s’empruntent avec une caution (5 000 F) remboursée au retour. Aucun tampon n’est débité.",
  },
  {
    q: "Puis-je annuler une commande ?",
    a: "Oui, tant que le livreur n’a pas pris la tournée. Le tampon et les 1 000 F sont alors renvoyés.",
  },
];

export function About() {
  const [stats, setStats] = useState<ImpactStats | null>(null);

  useEffect(() => {
    getImpactStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  const items = [
    { icon: Recycle, label: "Manuels déposés", value: stats?.booksDeposited ?? "—" },
    { icon: BookOpen, label: "Disponibles", value: stats?.booksAvailable ?? "—" },
    { icon: Users, label: "Membres", value: stats?.members ?? "—" },
    {
      icon: Wallet,
      label: "Économisés (est.)",
      value: stats ? `${stats.estimatedSavedCfa.toLocaleString("fr-FR")} F` : "—",
    },
  ];

  return (
    <Layout>
      <PageHeader
        title="Impact & FAQ"
        subtitle="Livres, intérieur déco et articles divers, sans obligation de créer un compte. Voici l’effet du réseau et les réponses utiles."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-5">
            <Icon className="h-5 w-5 text-emerald-700" />
            <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        L’économie estimée compte 8 000 F par manuel livré (prix moyen d’un ouvrage d’occasion évité).
        {stats && stats.booksDelivered > 0 ? ` ${stats.booksDelivered} livraison${stats.booksDelivered > 1 ? "s" : ""} confirmée${stats.booksDelivered > 1 ? "s" : ""}.` : ""}
      </p>

      <h2 className="mt-12 text-lg font-semibold text-slate-900">Questions fréquentes</h2>
      <div className="mt-4 space-y-3">
        {FAQ.map((item) => (
          <Card key={item.q} className="p-5">
            <h3 className="font-medium text-slate-900">{item.q}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
