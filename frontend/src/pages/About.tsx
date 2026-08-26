import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  HeartHandshake,
  Recycle,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { getImpactStats } from "../api/client";
import { Layout } from "../components/Layout";
import { Card, PrimaryButton } from "../components/ui";
import type { ImpactStats } from "../types";

const VALUES = [
  {
    icon: HeartHandshake,
    title: "Esprit de famille",
    text: "Perso encourage les rencontres, le partage et les interactions au sein de la communauté.",
  },
  {
    icon: Users,
    title: "Solidarité",
    text: "Chacun peut se séparer utilement des objets dont il n’a plus besoin, et accéder à ceux qu’il recherche à moindre coût.",
  },
  {
    icon: Recycle,
    title: "Préservation de l’environnement",
    text: "Rien ne se perd : chaque objet peut trouver une nouvelle utilité grâce au don, à l’échange ou à la réutilisation.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Publiez une offre ou une recherche",
    text: "Vous avez un article : déposez une offre avec photos, catégorie, état, et don / échange / vente. Vous cherchez un article : publiez une recherche, et ceux qui l’ont pourront vous contacter. Sans compte, la publication est relue par l’équipe.",
  },
  {
    step: "2",
    title: "Donnez, échangez ou vendez",
    text: "Une fois publiée, l’annonce est accessible aux membres. Ils peuvent vous contacter directement, ou solliciter l’équipe de Perso pour faciliter l’échange.",
  },
  {
    step: "3",
    title: "Faites circuler les biens",
    text: "En favorisant la réutilisation, Perso contribue à une économie plus accessible, responsable et solidaire : les objets trouvent une nouvelle utilité plutôt que de finir à la poubelle.",
  },
];

const FAQ = [
  {
    q: "Je cherche un livre, je fais comment ?",
    a: "Publiez une recherche : titre, précisions et un numéro. Les personnes qui ont l’article vous contactent. Ce n’est pas une offre : aucun cauri n’est débité.",
  },
  {
    q: "Je dois m’inscrire pour regarder ou publier ?",
    a: "Non. Vous parcourez et vous pouvez publier sans compte. Un visiteur ne voit que les articles disponibles. Sans inscription, vous perdez tous les avantages liés à l’attribution de cauris : nous vous recommandons de vous inscrire dès que possible.",
  },
  {
    q: "Pourquoi un code sur mon téléphone ?",
    a: "Comme sur Amazon, on demande l’email et le numéro, puis on envoie un code de confirmation pour s’assurer que le téléphone est bien le vôtre. Le quartier reste demandé pour la remise.",
  },
  {
    q: "Qui valide les annonces ?",
    a: "Les publications des visiteurs non inscrits sont soumises à validation par l’équipe. Les membres abonnés publient directement.",
  },
  {
    q: "Comment fonctionnent les cauris ?",
    a: "Dès votre première inscription, vous recevez 50 cauris. Ensuite, don, vente, achat ou échange d’un article vous en rapportent d’autres. Ils sont proposés automatiquement selon l’état, puis délivrés après validation de nos équipes. Vous pouvez demander des cauris supplémentaires pour certaines catégories : retour sous 48 h. Cumulez-les pour bénéficier de nombreux avantages.",
  },
  {
    q: "Puis-je demander plus de cauris pour un article ?",
    a: "Oui, pour certaines catégories. Vous soumettez une demande ; nos équipes vous font un retour sous 48 h.",
  },
  {
    q: "Qui paie la livraison ?",
    a: "Les frais de livraison sont à votre charge, sauf si vous bénéficiez de la livraison gratuite.",
  },
  {
    q: "C’est quoi la bibliothèque ?",
    a: "Certains ouvrages s’empruntent avec une caution remboursée au retour. Aucun cauri n’est débité.",
  },
  {
    q: "Puis-je publier sans donner mon nom ?",
    a: "Oui. Cochez « utilisateur anonyme » : l’annonce s’affiche sans votre identité. Sans compte, la publication reste anonyme et passe par validation.",
  },
  {
    q: "Puis-je annuler une commande ?",
    a: "Oui, tant que le livreur n’a pas pris la tournée. Les cauris et les frais de livraison sont alors renvoyés.",
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
    { icon: Recycle, label: "Articles déposés", value: stats?.booksDeposited ?? "—" },
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
      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-6 py-10 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Perso</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Une seconde vie pour les objets, une communauté pour s’entraider
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
          Perso est une application qui met en relation les particuliers afin de donner une seconde vie
          aux objets dont ils n’ont plus l’utilité. Elle offre à chacun la possibilité de donner,
          d’échanger ou de vendre simplement et en toute confiance, tout en encourageant les rencontres,
          le partage et les interactions au sein de la communauté.
        </p>
        <p className="mt-4 max-w-3xl text-sm font-medium text-emerald-800">
          Ambition : Fédérer l’Afrique autour d’une consommation plus responsable, plus solidaire et plus durable.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/deposit">
            <PrimaryButton>Déposer une annonce</PrimaryButton>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Voir les annonces
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-slate-900">Trois valeurs fondamentales</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Perso s’appuie sur l’esprit de famille, la solidarité et la préservation de l’environnement,
          notamment par la lutte contre le gaspillage. Son ambition est de bâtir une communauté fondée
          sur la confiance, le partage et l’entraide.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="p-5">
              <Icon className="h-5 w-5 text-emerald-700" />
              <h3 className="mt-3 font-medium text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-slate-900">Comment fonctionne Perso ?</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Perso est une plateforme simple, intuitive et conviviale, conçue pour permettre à chacun de
          donner une seconde vie aux articles dont il n’a plus l’utilité. Les utilisateurs peuvent publier
          des annonces afin de donner, échanger ou vendre facilement leurs biens.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <Card key={item.step} className="p-5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-sm font-semibold text-white">
                {item.step}
              </span>
              <h3 className="mt-3 font-medium text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <Card className="bg-amber-50/70 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Le système de fidélité à cauris</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Dès votre première inscription sur la plateforme Perso, vous recevez 50 cauris.
                Ensuite, vos activités de don, de vente, d’achat ou d’échange d’un article vous
                rapportent des cauris. Ceux-ci sont proposés automatiquement selon l’état de l’article,
                puis délivrés après validation de nos équipes.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-amber-100 bg-white p-4">
                  <h3 className="font-medium text-slate-900">Gagner des cauris</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Chaque offre (don, vente ou échange) génère une proposition de cauris selon l’état
                    de l’article. L’équipe confirme ou ajuste avant le crédit.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Vous pouvez soumettre une demande de cauris supplémentaires pour certaines catégories
                    d’articles. Nos équipes vous feront un retour sous 48 h.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Cumulez le maximum de cauris et bénéficiez de nombreux avantages.
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-white p-4">
                  <h3 className="font-medium text-slate-900">Utiliser ses cauris</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Vos cauris vous permettront de récupérer certains articles sur la plateforme ou de
                    bénéficier d’autres avantages (offre soumise à conditions).
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    La publication d’articles est autorisée sans inscription, mais vous perdez alors
                    tous les avantages liés à l’attribution de cauris. Nous vous recommandons de vous
                    inscrire le plus rapidement possible.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    NB: Les frais de livraison sont à votre charge sauf si vous bénéficiez de la
                    livraison gratuite.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-slate-900">Un service d’accompagnement sur mesure</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
          Au-delà de sa plateforme, Perso propose un accompagnement personnalisé aux particuliers comme
          aux professionnels qui souhaitent être épaulés dans la gestion de leurs biens et de leurs espaces.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h3 className="font-medium text-slate-900">Récupération et valorisation</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Nos équipes peuvent intervenir pour récupérer les articles dont vous souhaitez vous séparer,
              qu’ils soient destinés au don, à la vente ou au recyclage, en fonction de leur état et de
              leur potentiel de réutilisation.
            </p>
          </Card>
          <Card className="p-5">
            <h3 className="font-medium text-slate-900">Rangement, tri et vidage</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Nous vous accompagnons dans le rangement d’un magasin, l’organisation d’un espace, le vidage
              d’une réserve ou le tri de vos biens. L’équipe aide à identifier ce qu’il faut conserver,
              donner, vendre ou évacuer, pour retrouver un environnement plus propre, ordonné et fonctionnel.
            </p>
          </Card>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
          Cette prestation transforme une situation parfois complexe ou chronophage en une démarche simple,
          structurée et efficace. Nous trions, organisons et valorisons vos articles afin qu’ils puissent,
          lorsque cela est possible, être récupérés, transmis ou réutilisés.
        </p>
      </section>

      <section className="mt-12">
        <Card className="border-emerald-100 bg-emerald-50/50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Bien plus qu’une plateforme d’annonces</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Perso est avant tout une communauté d’entraide et un service de proximité, fondés sur trois
                valeurs essentielles : l’esprit de famille, la solidarité et la promotion d’une économie plus
                responsable. Avec Perso, chacun peut vendre, donner, échanger, récupérer, ranger ou se faire
                accompagner, tout en contribuant à donner une seconde vie aux objets et à réduire le gaspillage.
              </p>
              <p className="mt-3 text-sm font-medium text-emerald-900">
                Perso, c’est une nouvelle manière de consommer, de partager et de s’entraider.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-slate-900">Impact de la communauté</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          {stats && stats.booksDelivered > 0
            ? ` ${stats.booksDelivered} livraison${stats.booksDelivered > 1 ? "s" : ""} confirmée${stats.booksDelivered > 1 ? "s" : ""}.`
            : ""}
        </p>
      </section>

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
